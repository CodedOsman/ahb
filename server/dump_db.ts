import pool from './db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dump() {
  console.log('Fetching active database tables for dump...');
  try {
    const connection = await pool.getConnection();

    const [categories]: any = await connection.query('SELECT * FROM categories');
    const [admins]: any = await connection.query('SELECT * FROM admins');
    const [siteSettings]: any = await connection.query('SELECT * FROM site_settings');
    const [clientPhotos]: any = await connection.query('SELECT * FROM client_photos');
    const [services]: any = await connection.query('SELECT * FROM services');
    const [products]: any = await connection.query('SELECT * FROM products');
    const [productLengths]: any = await connection.query('SELECT * FROM product_lengths');

    connection.release();

    const outputFilePath = path.resolve(__dirname, '..', 'seed_db.ts');

    const seedCode = `import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asantey_salon',
});

const categories = ${JSON.stringify(categories, null, 2)};
const admins = ${JSON.stringify(admins, null, 2)};
const siteSettings = ${JSON.stringify(siteSettings, null, 2)};
const clientPhotos = ${JSON.stringify(clientPhotos, null, 2)};
const services = ${JSON.stringify(services, null, 2)};
const products = ${JSON.stringify(products, null, 2)};
const productLengths = ${JSON.stringify(productLengths, null, 2)};

async function seed() {
  try {
    const connection = await pool.getConnection();
    console.log('Seeding database with fresh active dump...');

    // Disable foreign key checks to safely truncate
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE product_lengths');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE services');
    await connection.query('TRUNCATE TABLE client_photos');
    await connection.query('TRUNCATE TABLE site_settings');
    await connection.query('TRUNCATE TABLE admins');
    await connection.query('TRUNCATE TABLE categories');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Truncated all tables.');

    // Seed categories
    for (const cat of categories) {
      await connection.query(
        'INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)',
        [cat.id, cat.name, cat.slug]
      );
    }
    console.log(\`Seeded \${categories.length} categories.\`);

    // Seed admins
    for (const admin of admins) {
      await connection.query(
        'INSERT INTO admins (id, username, password) VALUES (?, ?, ?)',
        [admin.id, admin.username, admin.password]
      );
    }
    console.log(\`Seeded \${admins.length} admins.\`);

    // Seed site settings
    for (const setting of siteSettings) {
      await connection.query(
        'INSERT INTO site_settings (id, \`key\`, \`value\`) VALUES (?, ?, ?)',
        [setting.id, setting.key, setting.value]
      );
    }
    console.log(\`Seeded \${siteSettings.length} site settings.\`);

    // Seed client photos
    for (const photo of clientPhotos) {
      await connection.query(
        'INSERT INTO client_photos (id, image_url, caption, created_at) VALUES (?, ?, ?, ?)',
        [photo.id, photo.image_url, photo.caption, photo.created_at]
      );
    }
    console.log(\`Seeded \${clientPhotos.length} client photos.\`);

    // Seed services
    for (const service of services) {
      await connection.query(
        'INSERT INTO services (id, category_id, title, description, price, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [service.id, service.category_id, service.title, service.description, service.price, service.image_url, service.is_active]
      );
    }
    console.log(\`Seeded \${services.length} services.\`);

    // Seed products
    for (const product of products) {
      await connection.query(
        'INSERT INTO products (id, category_id, name, description, base_price, image_url, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [product.id, product.category_id, product.name, product.description, product.base_price, product.image_url, product.is_active, product.stock]
      );
    }
    console.log(\`Seeded \${products.length} products.\`);

    // Seed product lengths
    for (const len of productLengths) {
      await connection.query(
        'INSERT INTO product_lengths (id, product_id, length, price, stock) VALUES (?, ?, ?, ?, ?)',
        [len.id, len.product_id, len.length, len.price, len.stock]
      );
    }
    console.log(\`Seeded \${productLengths.length} product lengths.\`);

    console.log('Seeding completed successfully!');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
`;

    fs.writeFileSync(outputFilePath, seedCode, 'utf-8');
    console.log(`Successfully generated fresh seed file at: ${outputFilePath}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to dump database:', err);
    process.exit(1);
  }
}

dump();
