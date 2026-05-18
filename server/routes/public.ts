import { Router } from 'express';
import pool from '../db';


const router = Router();

// Get all services
router.get('/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE is_active = 1');
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

// Get single product with lengths
router.get('/products/:id', async (req, res) => {
  try {
    const [productRows]: any = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [lengthRows] = await pool.query(
      'SELECT * FROM product_lengths WHERE product_id = ? ORDER BY price ASC',
      [req.params.id]
    );
    res.json({
      ...productRows[0],
      lengths: lengthRows,
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

export default router;


