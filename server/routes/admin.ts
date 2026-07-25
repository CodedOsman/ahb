import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { logError } from '../utils/logger';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'asantey_luxury_salon_secret_key_2024';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const UPLOADS_DIR = process.env.PUBLIC_DIR 
  ? path.join(process.env.PUBLIC_DIR, 'uploads')
  : path.join(__dirname, '../../client/public/uploads');

const saveBase64Image = (type: string, base64String: string | null | undefined): string | null => {
  if (!base64String || !base64String.startsWith('data:image/')) {
    return base64String || null;
  }

  const matches = base64String.match(/^data:image\/(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64String;
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`;
  const typeDir = path.join(UPLOADS_DIR, type);

  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }

  const filePath = path.join(typeDir, filename);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${type}/${filename}`;
};

// Middleware to verify JWT
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows]: any = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    const admin = rows[0];

    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    logError('ADMIN_LOGIN', error);
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    const admin = rows[0];
    if (!admin) {
      return res.status(404).json({ error: 'Admin with this email not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query('UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [resetToken, resetTokenExpires, admin.id]);

    const resetUrl = `http://${req.headers.host}/admin/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset - Asantey Luxury Salon',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM admins WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    const admin = rows[0];
    if (!admin) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [passwordHash, admin.id]);

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Change Password (Authenticated)
router.post('/change-password', authenticateToken, async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM admins WHERE id = ?', [req.user.id]);
    const admin = rows[0];
    
    if (!admin || !(await bcrypt.compare(currentPassword, admin.password_hash))) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Profile Update
router.put('/profile', authenticateToken, async (req: any, res) => {
  const { username, email } = req.body;
  try {
    await pool.query('UPDATE admins SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);
    res.json({ message: 'Profile updated successfully', admin: { id: req.user.id, username, email } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  const { name, slug, type, image_url } = req.body;
  const finalImageUrl = saveBase64Image('category', image_url);
  try {
    const [result]: any = await pool.query(
      'INSERT INTO categories (name, slug, type, image_url) VALUES (?, ?, ?, ?)',
      [name, slug, type, finalImageUrl || null]
    );
    res.json({ id: result.insertId, message: 'Category created' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/categories/:id', authenticateToken, async (req, res) => {
  const { name, slug, type, image_url } = req.body;
  const finalImageUrl = saveBase64Image('category', image_url);
  console.log(`[PUT /categories/${req.params.id}] name: ${name}, image_url length: ${image_url?.length || 0}`);
  try {
    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, type = ?, image_url = ? WHERE id = ?',
      [name, slug, type, finalImageUrl || null, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/categories/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Services
router.get('/services', authenticateToken, async (req, res) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT s.id, s.category_id, s.title, s.description, s.price, s.image_url, s.booking_link, s.is_active,
             c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/services', authenticateToken, async (req, res) => {
  const { category_id, title, description, price, image_url, booking_link, is_active } = req.body;
  const finalImageUrl = saveBase64Image('service', image_url);
  const connection = await pool.getConnection();
  try {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    let success = false;
    let insertId = null;

    while (!success) {
      try {
        const [result]: any = await connection.query(
          'INSERT INTO services (category_id, title, slug, description, price, image_url, booking_link, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [category_id, title, slug, description, price, finalImageUrl, booking_link || null, is_active === undefined ? 1 : is_active]
        );
        insertId = result.insertId;
        success = true;
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          throw err;
        }
      }
    }
    res.json({ id: insertId, message: 'Service created' });
  } catch (error) {
    logError('CREATE_SERVICE', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});


router.put('/services/:id', authenticateToken, async (req, res) => {
  const { category_id, title, description, price, image_url, booking_link, is_active } = req.body;
  const finalImageUrl = saveBase64Image('service', image_url);
  const connection = await pool.getConnection();
  try {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    let success = false;

    while (!success) {
      try {
        await connection.query(
          'UPDATE services SET category_id = ?, title = ?, slug = ?, description = ?, price = ?, image_url = ?, booking_link = ?, is_active = ? WHERE id = ?',
          [category_id, title, slug, description, price, finalImageUrl, booking_link || null, is_active, req.params.id]
        );
        success = true;
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          throw err;
        }
      }
    }
    res.json({ message: 'Service updated' });
  } catch (error) {
    logError('UPDATE_SERVICE', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

router.delete('/services/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Products
router.post('/products', authenticateToken, async (req, res) => {
  const { category_id, name, description, base_price, image_url, is_active, variants, stock } = req.body;
  const finalImageUrl = saveBase64Image('product', image_url);
  const totalStock = Array.isArray(variants) && variants.length
    ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
    : (stock || 0);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    let success = false;
    let productId = null;

    while (!success) {
        try {
            const [result]: any = await connection.query(
              'INSERT INTO products (category_id, name, slug, description, base_price, image_url, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [category_id, name, slug, description, base_price, finalImageUrl, is_active === undefined ? 1 : is_active, totalStock]
            );
            productId = result.insertId;
            success = true;
        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') {
                slug = `${baseSlug}-${counter}`;
                counter++;
            } else {
                throw err;
            }
        }
    }

    if (variants && Array.isArray(variants)) {
        for (const variant of req.body.variants) {
          await connection.query(
            'INSERT INTO product_variants (product_id, variant_type, size, length, texture, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [productId, variant.variant_type || null, variant.size || null, variant.length || null, variant.texture || null, variant.price, variant.stock || 0]
          );
      }
    }

    await connection.commit();
    res.json({ id: productId, message: 'Product created' });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error('Failed to rollback transaction (connection closed):', rollbackErr);
    }
    logError('CREATE_PRODUCT', error);
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

router.put('/products/:id', authenticateToken, async (req, res) => {
  const { category_id, name, description, base_price, image_url, is_active, variants, stock } = req.body;
  const finalImageUrl = saveBase64Image('product', image_url);
  const totalStock = Array.isArray(variants) && variants.length
    ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
    : (stock || 0);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    let success = false;

    while (!success) {
        try {
            await connection.query(
              'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, base_price = ?, image_url = ?, is_active = ?, stock = ? WHERE id = ?',
              [category_id, name, slug, description, base_price, finalImageUrl, is_active, totalStock, req.params.id]
            );
            success = true;
        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') {
                slug = `${baseSlug}-${counter}`;
                counter++;
            } else {
                throw err;
            }
        }
    }

    // Update variants: Delete and re-insert for simplicity or match IDs
    await connection.query('DELETE FROM product_variants WHERE product_id = ?', [req.params.id]);
    
    if (variants && Array.isArray(variants)) {
        for (const variant of req.body.variants) {
          await connection.query(
            'INSERT INTO product_variants (product_id, variant_type, size, length, texture, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.params.id, variant.variant_type || null, variant.size || null, variant.length || null, variant.texture || null, variant.price, variant.stock || 0]
          );
      }
    }

    await connection.commit();
    res.json({ message: 'Product updated' });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error('Failed to rollback transaction (connection closed):', rollbackErr);
    }
    logError('UPDATE_PRODUCT', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

router.get('/products', authenticateToken, async (req, res) => {
  try {
    const [products]: any = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);

    const [variants]: any = await pool.query('SELECT * FROM product_variants');

    const productsWithVariants = products.map((p: any) => {
      const productVariants = variants.filter((v: any) => v.product_id === p.id);
      const variantStock = productVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
      return {
        ...p,
        stock: productVariants.length ? variantStock : p.stock,
        variants: productVariants
      };
    });

    res.json(productsWithVariants);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Delivery Zones
router.post('/delivery-zones', authenticateToken, async (req, res) => {
  const { name, price, is_active } = req.body;
  try {
    await pool.query('INSERT INTO delivery_zones (name, price, is_active) VALUES (?, ?, ?)', [name, price, is_active === undefined ? 1 : is_active]);
    res.json({ message: 'Delivery zone created' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/delivery-zones/:id', authenticateToken, async (req, res) => {
  const { name, price, is_active } = req.body;
  try {
    await pool.query('UPDATE delivery_zones SET name = ?, price = ?, is_active = ? WHERE id = ?', [name, price, is_active, req.params.id]);
    res.json({ message: 'Delivery zone updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/delivery-zones/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM delivery_zones WHERE id = ?', [req.params.id]);
    res.json({ message: 'Delivery zone deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const [orders]: any = await pool.query('SELECT o.*, d.name as delivery_zone_name FROM orders o LEFT JOIN delivery_zones d ON o.delivery_zone_id = d.id ORDER BY o.created_at DESC');
    
    if (orders.length > 0) {
      const orderIds = orders.map((o: any) => o.id);
      const [items]: any = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds]);
      orders.forEach((order: any) => {
        order.items = items.filter((item: any) => item.order_id == order.id);
      });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/orders/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const orderId = req.params.id;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    
    // If order is marked as shipped, send a notification email
    if (status === 'shipped') {
      const [orderRows]: any = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const order = orderRows[0];
      
      if (order && order.customer_email && process.env.SMTP_USER) {
        await transporter.sendMail({
          from: `"Asantey Hair & Beauty Salon" <${process.env.SMTP_USER}>`,
          to: order.customer_email,
          subject: 'Your Order Has Been Shipped! - Asantey Hair & Beauty Salon',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border: 1px solid #eaeaea;">
              <h1 style="color: #000000; font-size: 24px; text-transform: uppercase;">Good News!</h1>
              <p>Hi ${order.customer_name || 'there'},</p>
              <p>Your order has been shipped and is on its way to you.</p>
              <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 3px solid #000000;">
                <p style="margin: 0;"><strong>Shipping Address:</strong><br/>${order.shipping_address || 'Not provided'}</p>
              </div>
              <p>We hope you love your purchase. If you have any questions, please feel free to reply directly to this email.</p>
              <br/>
              <p>Warm regards,<br/>The Asantey Hair & Beauty Salon Team</p>
            </div>
          `
        }).catch(err => console.error("Failed to send shipping notification:", err));
      }
    }

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [orders]: any = await pool.query('SELECT total FROM orders WHERE status IN ("paid", "shipped", "delivered")');
    const revenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    
    const [services]: any = await pool.query('SELECT COUNT(*) as count FROM services');
    const [products]: any = await pool.query('SELECT COUNT(*) as count FROM products');
    const [categories]: any = await pool.query('SELECT COUNT(*) as count FROM categories');
    
    res.json({
      revenue,
      services: services[0].count,
      products: products[0].count,
      categories: categories[0].count
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Settings
router.post('/settings', authenticateToken, async (req, res) => {
  const { settings } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (let [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' && value.startsWith('data:image/')) {
        value = saveBase64Image('setting', value) || value;
      }
      await connection.query(
        'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, value, value]
      );
    }

    await connection.commit();
    res.json({ message: 'Settings updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Manage Client Photos
router.get('/client-photos', authenticateToken, async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM client_photos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error getting admin client photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client-photos', authenticateToken, async (req, res) => {
  const { image_url, caption } = req.body;
  const finalImageUrl = saveBase64Image('client-photo', image_url);
  if (!finalImageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }
  try {
    const [result]: any = await pool.query(
      'INSERT INTO client_photos (image_url, caption) VALUES (?, ?)',
      [finalImageUrl, caption || '']
    );
    res.json({ id: result.insertId, image_url, caption, message: 'Client photo added' });
  } catch (error) {
    logError('ADD_CLIENT_PHOTO', error);
    console.error('Error adding client photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/client-photos/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM client_photos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Client photo deleted' });
  } catch (error) {
    console.error('Error deleting client photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manage Reviews
router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/reviews/:id/approve', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review approved' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Hero Slides Management ---

router.get('/hero-slides', authenticateToken, async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM hero_slides ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching admin hero slides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/hero-slides', authenticateToken, async (req, res) => {
  const { image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, is_active, display_order } = req.body;
  const finalImageUrl = saveBase64Image('hero-slide', image_url);
  if (!finalImageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }
  try {
    await pool.query(
      'INSERT INTO hero_slides (image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [finalImageUrl, headline || null, subtitle || null, button_1_text || null, button_1_link || null, button_2_text || null, button_2_link || null, is_active !== undefined ? is_active : 1, display_order || 0]
    );
    res.json({ message: 'Hero slide created successfully' });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/hero-slides/:id', authenticateToken, async (req, res) => {
  const { image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, is_active, display_order } = req.body;
  const finalImageUrl = saveBase64Image('hero-slide', image_url);
  try {
    await pool.query(
      'UPDATE hero_slides SET image_url = ?, headline = ?, subtitle = ?, button_1_text = ?, button_1_link = ?, button_2_text = ?, button_2_link = ?, is_active = ?, display_order = ? WHERE id = ?',
      [finalImageUrl, headline || null, subtitle || null, button_1_text || null, button_1_link || null, button_2_text || null, button_2_link || null, is_active, display_order, req.params.id]
    );
    res.json({ message: 'Hero slide updated successfully' });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/hero-slides/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
    res.json({ message: 'Hero slide deleted' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Promo Codes Management ---
router.get('/promo-codes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/promo-codes', authenticateToken, async (req, res) => {
  const { code, discount_percentage, is_active, valid_until } = req.body;
  try {
    await pool.query(
      'INSERT INTO promo_codes (code, discount_percentage, is_active, valid_until) VALUES (?, ?, ?, ?)',
      [code, discount_percentage, is_active !== undefined ? is_active : 1, valid_until || null]
    );
    res.json({ message: 'Promo code created successfully' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Promo code already exists' });
    }
    console.error('Error creating promo code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/promo-codes/:id', authenticateToken, async (req, res) => {
  const { code, discount_percentage, is_active, valid_until } = req.body;
  try {
    await pool.query(
      'UPDATE promo_codes SET code = ?, discount_percentage = ?, is_active = ?, valid_until = ? WHERE id = ?',
      [code, discount_percentage, is_active, valid_until || null, req.params.id]
    );
    res.json({ message: 'Promo code updated successfully' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Promo code already exists' });
    }
    console.error('Error updating promo code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/promo-codes/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM promo_codes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Promo code deleted' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Promotions (Banners) Management ---
router.get('/promotions', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/promotions', authenticateToken, async (req, res) => {
  const { title, message, end_time, is_active } = req.body;
  try {
    await pool.query(
      'INSERT INTO promotions (title, message, end_time, is_active) VALUES (?, ?, ?, ?)',
      [title || null, message, end_time || null, is_active !== undefined ? is_active : 1]
    );
    res.json({ message: 'Promotion created successfully' });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/promotions/:id', authenticateToken, async (req, res) => {
  const { title, message, end_time, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE promotions SET title = ?, message = ?, end_time = ?, is_active = ? WHERE id = ?',
      [title || null, message, end_time || null, is_active, req.params.id]
    );
    res.json({ message: 'Promotion updated successfully' });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/promotions/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

