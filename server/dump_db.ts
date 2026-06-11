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
    const [productVariants]: any = await connection.query('SELECT * FROM product_variants');
    const [deliveryZones]: any = await connection.query('SELECT * FROM delivery_zones');
    const [reviews]: any = await connection.query('SELECT * FROM reviews');

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
const productVariants = ${JSON.stringify(productVariants, null, 2)};
const deliveryZones = ${JSON.stringify(deliveryZones, null, 2)};
const reviews = ${JSON.stringify(reviews, null, 2)};

async function seed() {
  try {
    const connection = await pool.getConnection();
    console.log('Seeding database with fresh active dump...');

    // Disable foreign key checks to safely truncate
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE product_variants');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE services');
    await connection.query('TRUNCATE TABLE client_photos');
    await connection.query('TRUNCATE TABLE site_settings');
    await connection.query('TRUNCATE TABLE admins');
    await connection.query('TRUNCATE TABLE categories');
    await connection.query('TRUNCATE TABLE delivery_zones');
    await connection.query('TRUNCATE TABLE reviews');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Truncated all tables.');

    // Seed categories
    for (const cat of categories) {
      await connection.query(
        'INSERT INTO categories (id, name, slug, type, created_at) VALUES (?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.slug, cat.type, cat.created_at]
      );
    }
    console.log(\`Seeded \${categories.length} categories.\`);

    // Seed admins
    for (const admin of admins) {
      await connection.query(
        'INSERT INTO admins (id, username, password_hash, email, created_at) VALUES (?, ?, ?, ?, ?)',
        [admin.id, admin.username, admin.password_hash, admin.email, admin.created_at]
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

    // Seed product variants
    for (const variant of productVariants) {
      await connection.query(
        'INSERT INTO product_variants (id, product_id, size, length, price, stock, variant_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [variant.id, variant.product_id, variant.size, variant.length, variant.price, variant.stock, variant.variant_type]
      );
    }
    console.log(\`Seeded \${productVariants.length} product variants.\`);

    // Seed delivery zones
    for (const zone of deliveryZones) {
      await connection.query(
        'INSERT INTO delivery_zones (id, name, price, is_active, created_at) VALUES (?, ?, ?, ?, ?)',
        [zone.id, zone.name, zone.price, zone.is_active, zone.created_at]
      );
    }
    console.log(\`Seeded \${deliveryZones.length} delivery zones.\`);

    // Seed reviews
    for (const review of reviews) {
      await connection.query(
        'INSERT INTO reviews (id, name, service, rating, content, is_approved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [review.id, review.name, review.service, review.rating, review.content, review.is_approved, review.created_at]
      );
    }
    console.log(\`Seeded \${reviews.length} reviews.\`);

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
