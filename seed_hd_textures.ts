import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asantey_salon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function run() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database. Starting HD Closures & Frontals variant seed...');

    // 1. Find the HD Closures category ID
    const [categories]: any = await connection.query('SELECT id, name FROM categories WHERE slug = ? OR name LIKE ?', ['hd-closures', '%HD Closures%']);
    
    if (categories.length === 0) {
      console.error('Could not find HD Closures category. Aborting.');
      process.exit(1);
    }
    
    const categoryId = categories[0].id;
    console.log(`Found category: ${categories[0].name} (ID: ${categoryId})`);

    // 2. Fetch all products in this category
    const [products]: any = await connection.query('SELECT id, name FROM products WHERE category_id = ?', [categoryId]);
    console.log(`Found ${products.length} products in this category.`);

    if (products.length === 0) {
      console.log('No products found. Exiting.');
      process.exit(0);
    }

    const productIds = products.map((p: any) => p.id);

    // 3. Fetch all current variants for these products
    const [variants]: any = await connection.query(
      'SELECT * FROM product_variants WHERE product_id IN (?)',
      [productIds]
    );
    console.log(`Found ${variants.length} existing variants.`);

    // Group variants to check if they already have texture populated
    let updateCount = 0;
    let insertCount = 0;

    await connection.beginTransaction();

    try {
      for (const variant of variants) {
        // Only modify variants that don't already have a valid texture, or if they have null/empty texture
        if (!variant.texture || variant.texture.trim() === '') {
          // Update the current variant to 'Raw'
          await connection.query(
            'UPDATE product_variants SET texture = ? WHERE id = ?',
            ['Raw', variant.id]
          );
          updateCount++;

          // Insert a duplicate variant but with 'Virgin' texture
          await connection.query(
            'INSERT INTO product_variants (product_id, variant_type, size, length, texture, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              variant.product_id,
              variant.variant_type,
              variant.size,
              variant.length,
              'Virgin',
              variant.price,
              variant.stock
            ]
          );
          insertCount++;
        }
      }

      await connection.commit();
      console.log(`Successfully updated ${updateCount} variants to 'Raw' and inserted ${insertCount} new 'Virgin' variants.`);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding textures:', error);
    process.exit(1);
  }
}

run();
