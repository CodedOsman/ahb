import { Router } from 'express';
import pool from '../db';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const router = Router();

// Get all services
router.get('/services', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category_id, title, description, price, image_url, booking_link, is_active FROM services WHERE is_active = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products with filters
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT p.*, p.stock, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params: any[] = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product with variants
router.get('/products/:id', async (req, res) => {
  try {
    const [productRows]: any = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [variantRows] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC',
      [req.params.id]
    );
    res.json({
      ...productRows[0],
      variants: variantRows,
    });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all settings

router.get('/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_settings');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get delivery zones
router.get('/delivery-zones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM delivery_zones WHERE is_active = 1');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client photos
router.get('/client-photos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM client_photos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching client photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approved reviews
router.get('/reviews', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, service, rating, content, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a new review (pending approval)
router.post('/reviews', async (req, res) => {
  const { name, service, rating, content } = req.body;
  if (!name || !service || !rating || !content) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  try {
    await pool.query(
      'INSERT INTO reviews (name, service, rating, content, is_approved) VALUES (?, ?, ?, ?, 0)',
      [name, service, rating, content]
    );

    // Fetch admin notification email
    const [settingsRows]: any = await pool.query('SELECT value FROM site_settings WHERE `key` = "admin_notification_email"');
    let adminEmail = null;
    if (settingsRows.length > 0 && settingsRows[0].value) {
      adminEmail = settingsRows[0].value;
    }

    if (adminEmail && process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"Asantey System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: 'New Review Submitted - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #eaeaea;">
              <h2 style="color: #000000; margin-top: 0;">New Review Pending Approval</h2>
              <p>A new review has been submitted and is waiting for your approval in the admin dashboard.</p>
              <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #000000; margin-top: 20px;">
                  <p><strong>Customer:</strong> ${name}</p>
                  <p><strong>Service:</strong> ${service}</p>
                  <p><strong>Rating:</strong> ${rating}/5</p>
                  <p><strong>Review:</strong></p>
                  <p style="color: #555555; font-style: italic;">"${content}"</p>
              </div>
              <p style="margin-top: 20px;">Please log in to the admin panel to approve or delete this review.</p>
          </div>
        `
      }).catch(err => console.error("Failed to send review notification:", err));
    }

    res.json({ message: 'Review submitted successfully. It will appear after approval.' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


