import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { logError } from '../utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'asantey_luxury_salon_secret_key_2024';

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

// Manage Categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  const { name, slug, type } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO categories (name, slug, type) VALUES (?, ?, ?)',
      [name, slug, type]
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
  const { name, slug, type } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, type = ? WHERE id = ?',
      [name, slug, type, req.params.id]
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
    const [rows] = await pool.query(`
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
  try {
    const [result]: any = await pool.query(
      'INSERT INTO services (category_id, title, description, price, image_url, booking_link, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id, title, description, price, image_url, booking_link || null, is_active === undefined ? 1 : is_active]
    );
    res.json({ id: result.insertId, message: 'Service created' });
  } catch (error) {
    logError('CREATE_SERVICE', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/services/:id', authenticateToken, async (req, res) => {
  const { category_id, title, description, price, image_url, booking_link, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE services SET category_id = ?, title = ?, description = ?, price = ?, image_url = ?, booking_link = ?, is_active = ? WHERE id = ?',
      [category_id, title, description, price, image_url, booking_link || null, is_active, req.params.id]
    );
    res.json({ message: 'Service updated' });
  } catch (error) {
    logError('UPDATE_SERVICE', error);
    res.status(500).json({ error: 'Internal server error' });
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
  const totalStock = Array.isArray(variants) && variants.length
    ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
    : (stock || 0);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result]: any = await connection.query(
      'INSERT INTO products (category_id, name, description, base_price, image_url, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, description, base_price, image_url, is_active === undefined ? 1 : is_active, totalStock]
    );

    const productId = result.insertId;

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await connection.query(
          'INSERT INTO product_variants (product_id, variant_type, length, price, stock) VALUES (?, ?, ?, ?, ?)',
          [productId, v.variant_type || '', v.length || '', v.price, v.stock || 0]
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
  const totalStock = Array.isArray(variants) && variants.length
    ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
    : (stock || 0);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, image_url = ?, is_active = ?, stock = ? WHERE id = ?',
      [category_id, name, description, base_price, image_url, is_active, totalStock, req.params.id]
    );

    // Update variants: Delete and re-insert for simplicity or match IDs
    await connection.query('DELETE FROM product_variants WHERE product_id = ?', [req.params.id]);
    
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await connection.query(
          'INSERT INTO product_variants (product_id, variant_type, length, price, stock) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, v.variant_type || '', v.length || '', v.price, v.stock || 0]
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
        variants: productVariants,
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
    const [rows] = await pool.query('SELECT o.*, d.name as delivery_zone_name FROM orders o LEFT JOIN delivery_zones d ON o.delivery_zone_id = d.id ORDER BY o.created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/orders/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
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

    for (const [key, value] of Object.entries(settings)) {
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
    const [rows] = await pool.query('SELECT * FROM client_photos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error getting admin client photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client-photos', authenticateToken, async (req, res) => {
  const { image_url, caption } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: 'Image URL is required' });
  }
  try {
    const [result]: any = await pool.query(
      'INSERT INTO client_photos (image_url, caption) VALUES (?, ?)',
      [image_url, caption || '']
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

export default router;

