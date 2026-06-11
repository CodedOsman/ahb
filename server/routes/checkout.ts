import { Router } from 'express';
import Stripe from 'stripe';
import pool from '../db';
import nodemailer from 'nodemailer';
import express from 'express';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia' as any,
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/create-session', async (req, res) => {
  try {
    const { items, deliveryZoneId, discount_code } = req.body;

    // Fetch delivery zone
    const [zoneRows]: any = await pool.query('SELECT * FROM delivery_zones WHERE id = ?', [deliveryZoneId]);
    if (zoneRows.length === 0) return res.status(400).json({ error: 'Invalid delivery zone' });
    const deliveryZone = zoneRows[0];

    // Create line items for Stripe
    const line_items = items.map((item: any) => {
      const priceValue = parseFloat(item.price.replace('£', '').replace('$', ''));
      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name,
            metadata: {
              product_id: item.id, // we store the id (e.g., '1' or '1-2') here to read later
            }
          },
          unit_amount: Math.round(priceValue * 100), // Stripe expects amounts in cents/pence
        },
        quantity: item.quantity,
      };
    });

    // Add delivery as a line item
    line_items.push({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `Shipping: ${deliveryZone.name}`,
        },
        unit_amount: Math.round(parseFloat(deliveryZone.price) * 100),
      },
      quantity: 1,
    });

    // Calculate totals for our database
    let subtotal = items.reduce((acc: number, item: any) => {
        const price = parseFloat(item.price.replace('£', '').replace('$', ''));
        return acc + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (discount_code) {
      const [promoRows]: any = await pool.query(
        'SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())',
        [discount_code]
      );
      if (promoRows.length > 0) {
        const promo = promoRows[0];
        discountAmount = subtotal * (promo.discount_percentage / 100);
        subtotal = subtotal - discountAmount;
      }
    }

    const deliveryFee = parseFloat(deliveryZoneId === 0 ? '0' : deliveryZone.price); // handle pickup or free delivery if needed
    const total = subtotal + deliveryFee; // We are removing tax for simplicity, but if needed we can add it. Assuming prices include tax or no tax.

    // If discount was applied, we need to distribute it across the line items so Stripe accepts it 
    // or add a negative line item if Stripe allows (Stripe does not allow negative line items easily).
    // Instead we use Stripe Coupons, but for simplicity, we adjust the unit_amount of each item proportionally.
    if (discountAmount > 0) {
       const discountFactor = subtotal / (subtotal + discountAmount);
       line_items.forEach((li: any) => {
         if (li.price_data.product_data.name !== `Shipping: ${deliveryZone.name}`) {
           li.price_data.unit_amount = Math.round(li.price_data.unit_amount * discountFactor);
         }
       });
    }

    const origin = req.headers.origin || 'http://localhost:3000';

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'FR', 'DE', 'IT', 'ES'], // Add relevant countries
      },
      line_items,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        delivery_zone_id: deliveryZoneId.toString(),
        subtotal: subtotal.toString(),
        delivery_fee: deliveryFee.toString(),
        total: total.toString(),
        items_json: JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
      }
    });

    // Store pending order in DB
    const [orderResult]: any = await pool.query(
      'INSERT INTO orders (stripe_session_id, delivery_zone_id, subtotal, delivery_fee, total, status) VALUES (?, ?, ?, ?, ?, ?)',
      [session.id, deliveryZoneId, subtotal, deliveryFee, total, 'pending']
    );
    const orderId = orderResult.insertId;

    // Store order items
    for (const item of items) {
      const priceValue = parseFloat(item.price.replace('£', '').replace('$', ''));
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, priceValue, item.quantity]
      );
    }

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/validate-promo', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }
    const [promoRows]: any = await pool.query(
      'SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())',
      [code]
    );
    if (promoRows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired promo code' });
    }
    res.json({ discount_percentage: promoRows[0].discount_percentage });
  } catch (error: any) {
    console.error('Promo validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// We need raw body for Stripe webhook signature verification
// Webhook parsing is handled in index.ts
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Process successful payment
    const sessionId = session.id;
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const address = session.customer_details?.address;
    const shippingAddressStr = address 
      ? `${address.line1}, ${address.city}, ${address.state || ''} ${address.postal_code}, ${address.country}`
      : 'No address provided';

    try {
      // Update Order Status
      await pool.query(
        'UPDATE orders SET status = ?, customer_email = ?, customer_name = ?, shipping_address = ? WHERE stripe_session_id = ?',
        ['paid', customerEmail, customerName, shippingAddressStr, sessionId]
      );

        // Fetch the order items to reduce stock and build email summary
        const [orderRows]: any = await pool.query('SELECT id, subtotal, delivery_fee FROM orders WHERE stripe_session_id = ?', [sessionId]);
        if (orderRows.length > 0) {
          const orderId = orderRows[0].id;
          const subtotal = parseFloat(orderRows[0].subtotal);
          const deliveryFee = parseFloat(orderRows[0].delivery_fee);
          const [items]: any = await pool.query('SELECT product_id, product_name, price, quantity FROM order_items WHERE order_id = ?', [orderId]);
          
          // Fetch dynamic email settings
          const [settingsRows]: any = await pool.query('SELECT `key`, value FROM site_settings WHERE `key` LIKE "email_%" OR `key` = "admin_notification_email"');
          const emailSettings: Record<string, string> = {};
          settingsRows.forEach((row: any) => {
            emailSettings[row.key] = row.value;
          });

          const primaryColor = emailSettings.email_primary_color || '#000000';
          const accentColor = emailSettings.email_accent_color || '#f9f9f9';
          
          let itemsHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">`;
        for (const item of items) {
            let baseProductId = item.product_id;
            if (baseProductId.includes('-')) {
                baseProductId = baseProductId.split('-')[0];
            }
            const [catRows]: any = await pool.query('SELECT c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [baseProductId]);
            const categoryName = catRows.length > 0 ? catRows[0].category_name : 'Product';

            itemsHtml += `
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">
                        <strong style="color: #000000;">${item.product_name}</strong> <span style="color: #999999; font-size: 12px; margin-left: 5px;">(${categoryName})</span><br/>
                        <span style="color: #666666; font-size: 12px;">Qty: ${item.quantity} | Price: £${parseFloat(item.price).toFixed(2)}</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; text-align: right; color: #000000;">
                        £${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                </tr>
            `;

            const pId = item.product_id; // could be '1' or '1-2'
            if (pId.includes('-')) {
                // It's a length variant: id-lengthId
                const [prodId, lengthId] = pId.split('-');
                await pool.query('UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, lengthId]);
            } else {
                // Base product
                await pool.query('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, pId]);
            }
        }
        itemsHtml += `
                <tr>
                    <td style="padding: 10px 0; border-top: 2px solid ${primaryColor}; text-align: right;">
                        <strong style="color: #666666; font-size: 14px;">Subtotal:</strong>
                    </td>
                    <td style="padding: 10px 0; border-top: 2px solid ${primaryColor}; text-align: right; color: ${primaryColor};">
                        £${subtotal.toFixed(2)}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 5px 0; text-align: right;">
                        <strong style="color: #666666; font-size: 14px;">Delivery Fee:</strong>
                    </td>
                    <td style="padding: 5px 0; text-align: right; color: ${primaryColor};">
                        £${deliveryFee.toFixed(2)}
                    </td>
                </tr>
            </table>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eaeaea; font-size: 14px; color: #666666;">
                <strong style="color: ${primaryColor};">Shipping Address:</strong><br/>
                ${shippingAddressStr}
            </div>
        `;

        // Send confirmation email to customer
        if (customerEmail && process.env.SMTP_USER) {
          const subject = emailSettings.email_customer_subject || 'Order Confirmation - Asantey Hair & Beauty Salon';
          const headerText = emailSettings.email_header_text || 'Asantey Hair & Beauty Salon';
          const greetingText = (emailSettings.email_greeting || 'Dear {customerName},').replace('{customerName}', customerName || 'Customer');
          
          // format newlines to <br/>
          const formatText = (text: string) => text ? text.replace(/\n/g, '<br/>') : '';
          const bodyText = formatText(emailSettings.email_body_text || 'Thank you for choosing Asantey Hair & Beauty Salon. We are delighted to confirm that your order and payment have been successfully received.');
          const footerText = formatText(emailSettings.email_footer_text || 'We will notify you as soon as your order ships. If you have any questions, please reply directly to this email.');
          const closingText = formatText(emailSettings.email_closing_text || 'Warm regards,\nThe Asantey Hair & Beauty Salon Team');

          const headerImg = emailSettings.email_header_image_url ? `
            <div style="text-align: ${emailSettings.email_header_image_align || 'center'}; margin-bottom: 20px;">
              <img src="${emailSettings.email_header_image_url}" alt="Header" style="max-width: ${emailSettings.email_header_image_width || '100%'}; height: auto;" />
            </div>
          ` : '';

          const bodyImg = emailSettings.email_body_image_url ? `
            <div style="text-align: ${emailSettings.email_body_image_align || 'center'}; margin: 20px 0;">
              <img src="${emailSettings.email_body_image_url}" alt="Body" style="max-width: ${emailSettings.email_body_image_width || '100%'}; height: auto;" />
            </div>
          ` : '';

          const footerImg = emailSettings.email_footer_image_url ? `
            <div style="text-align: ${emailSettings.email_footer_image_align || 'center'}; margin-top: 30px;">
              <img src="${emailSettings.email_footer_image_url}" alt="Footer" style="max-width: ${emailSettings.email_footer_image_width || '100%'}; height: auto;" />
            </div>
          ` : '';

          await transporter.sendMail({
            from: `"Asantey Hair & Beauty Salon" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: subject,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border: 1px solid #eaeaea;">
                  ${headerImg}
                  <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: ${primaryColor}; font-size: 24px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; margin: 0;">${headerText}</h1>
                      <div style="height: 1px; background-color: ${primaryColor}; width: 50px; margin: 20px auto;"></div>
                  </div>
                  <div style="color: #333333; font-size: 14px; line-height: 1.6;">
                      <p style="font-size: 16px; font-weight: 400; color: ${primaryColor};">${greetingText}</p>
                      <p>${bodyText}</p>
                      ${bodyImg}
                      <div style="background-color: ${accentColor}; padding: 20px; margin: 30px 0; border-left: 3px solid ${primaryColor};">
                          <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666666;">Order Summary</p>
                          ${itemsHtml}
                          <p style="margin: 20px 0 0 0; font-size: 18px; color: ${primaryColor}; text-align: right;"><strong>Total: £${(session.amount_total! / 100).toFixed(2)}</strong></p>
                      </div>
                      <p>${footerText}</p>
                      <p style="margin-top: 40px; color: #666666;">${closingText}</p>
                      ${footerImg}
                  </div>
              </div>
            `
          });
        }

        // Send notification to admin
        let adminEmail = emailSettings.admin_notification_email || null;

        if (adminEmail && process.env.SMTP_USER) {
          await transporter.sendMail({
            from: `"Asantey System" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `New Order Received - ${customerName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #eaeaea;">
                  <h2 style="color: #000000; margin-top: 0;">New Order Alert</h2>
                  <p>A new order has been placed successfully.</p>
                  <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #000000; margin-top: 20px;">
                      <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
                      <p><strong>Order Summary:</strong></p>
                      ${itemsHtml}
                  </div>
                  <p style="margin-top: 20px;">Log in to the admin dashboard for full details.</p>
              </div>
            `
          }).catch(err => console.error("Failed to send admin order notification:", err));
        }
      }
    } catch (dbErr) {
      console.error('Error processing successful checkout in DB:', dbErr);
    }
  }

  res.json({ received: true });
});

export default router;
