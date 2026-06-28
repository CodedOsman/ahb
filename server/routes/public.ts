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

const processImageUrl = (type: string, id: number, imageUrl: string | null) => {
  if (!imageUrl) return imageUrl;
  if (imageUrl.startsWith('data:image/')) {
    return `/api/images/${type}/${id}`;
  }
  return imageUrl;
};

// Serve binary images from base64 strings
router.get('/images/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  let tableName = '';
  if (type === 'service') tableName = 'services';
  else if (type === 'product') tableName = 'products';
  else if (type === 'hero-slide') tableName = 'hero_slides';
  else if (type === 'client-photo') tableName = 'client_photos';
  else if (type === 'category') tableName = 'categories';
  else return res.status(400).json({ error: 'Invalid type' });

  try {
    const [rows]: any = await pool.query(`SELECT image_url FROM ${tableName} WHERE id = ?`, [id]);
    if (rows.length === 0 || !rows[0].image_url) {
      return res.status(404).send('Not found');
    }
    
    const imageUrl = rows[0].image_url;
    if (imageUrl.startsWith('data:image/')) {
      const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(500).send('Invalid image format');
      }
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // cache for 1 year
      return res.send(buffer);
    }
    
    // If it's a URL, redirect to it
    res.redirect(imageUrl);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).send('Internal server error');
  }
});

// Get hero slides
router.get('/hero-slides', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, display_order FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC'
    );
    const processedRows = rows.map((row: any) => ({
      ...row,
      image_url: processImageUrl('hero-slide', row.id, row.image_url)
    }));
    res.json(processedRows);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all services
router.get('/services', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, category_id, title, description, price, image_url, booking_link, is_active FROM services WHERE is_active = 1'
    );
    const processedRows = rows.map((row: any) => ({
      ...row,
      image_url: processImageUrl('service', row.id, row.image_url)
    }));
    res.json(processedRows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM categories');
    const processedRows = rows.map((row: any) => ({
      ...row,
      image_url: processImageUrl('category', row.id, row.image_url)
    }));
    res.json(processedRows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products with filters
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT p.*, p.stock, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params: any[] = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows]: any = await pool.query(query, params);
    const processedRows = rows.map((row: any) => ({
      ...row,
      image_url: processImageUrl('product', row.id, row.image_url)
    }));
    res.json(processedRows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product with variants
router.get('/products/:slug', async (req, res) => {
  try {
    const [productRows]: any = await pool.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? OR p.id = ?',
      [req.params.slug, req.params.slug]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productId = productRows[0].id;

    const [variantRows] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC',
      [productId]
    );
    res.json({
      ...productRows[0],
      image_url: processImageUrl('product', productId, productRows[0].image_url),
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
    const [rows]: any = await pool.query('SELECT * FROM client_photos ORDER BY created_at DESC');
    const processedRows = rows.map((row: any) => ({
      ...row,
      image_url: processImageUrl('client-photo', row.id, row.image_url)
    }));
    res.json(processedRows);
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

// Get Google Reviews
let cachedGoogleReviews: any[] = [];
let googleReviewsLastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

router.get('/reviews/google', async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.json([]); // Return empty if not configured
  }

  if (Date.now() - googleReviewsLastFetch < CACHE_TTL && cachedGoogleReviews.length > 0) {
    return res.json(cachedGoogleReviews);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.result && data.result.reviews) {
      cachedGoogleReviews = data.result.reviews.map((r: any) => ({
        id: `google-${r.time}`,
        name: r.author_name,
        service: 'Google Review',
        rating: r.rating,
        content: r.text,
        created_at: new Date(r.time * 1000).toISOString(),
        isGoogle: true,
      }));
      googleReviewsLastFetch = Date.now();
    }
    
    res.json(cachedGoogleReviews);
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active promotions
router.get('/promotions/active', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM promotions WHERE is_active = 1 AND (end_time IS NULL OR end_time > NOW()) ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


