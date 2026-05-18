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
    const { items, deliveryZoneId } = req.body;

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
    const subtotal = items.reduce((acc: number, item: any) => {
        const price = parseFloat(item.price.replace('£', '').replace('$', ''));
        return acc + price * item.quantity;
    }, 0);
    const deliveryFee = parseFloat(deliveryZone.price);
    const total = subtotal + deliveryFee; // We are removing tax for simplicity, but if needed we can add it. Assuming prices include tax or no tax.

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

      // Fetch the order items to reduce stock
      const [orderRows]: any = await pool.query('SELECT id FROM orders WHERE stripe_session_id = ?', [sessionId]);
      if (orderRows.length > 0) {
        const orderId = orderRows[0].id;
        const [items]: any = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
        
        for (const item of items) {
            const pId = item.product_id; // could be '1' or '1-2'
            if (pId.includes('-')) {
                // It's a length variant: id-lengthId
                const [prodId, lengthId] = pId.split('-');
                await pool.query('UPDATE product_lengths SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, lengthId]);
            } else {
                // Base product
                await pool.query('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, pId]);
            }
        }
      }

      // Send confirmation email
      if (customerEmail && process.env.SMTP_USER) {
        await transporter.sendMail({
          from: `"Asantey Salon" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: 'Order Confirmation - Asantey Luxury Salon',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2D2D2D;">Thank you for your order!</h1>
                <p>Hi ${customerName},</p>
                <p>We've received your order and payment. We'll notify you once it ships.</p>
                <p><strong>Order Total:</strong> £${(session.amount_total! / 100).toFixed(2)}</p>
                <br/>
                <p>Best regards,<br/>Asantey Luxury Salon Team</p>
            </div>
          `
        });
      }
    } catch (dbErr) {
      console.error('Error processing successful checkout in DB:', dbErr);
    }
  }

  res.json({ received: true });
});

export default router;
