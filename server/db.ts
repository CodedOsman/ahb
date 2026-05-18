import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logError } from './utils/logger';

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

export default pool;

/**
 * Initialize database with schema
 */
export async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    
    // Set max_allowed_packet to 100MB globally to support large base64 photo payloads
    try {
      await connection.query('SET GLOBAL max_allowed_packet = 104857600');
      console.log('MySQL max_allowed_packet successfully increased to 100MB.');
    } catch (packetErr: any) {
      console.log('Could not set GLOBAL max_allowed_packet:', packetErr.message);
    }
    
    // Create client_photos table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_photos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image_url MEDIUMTEXT NOT NULL,
          caption VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Ensure client_photos column is MEDIUMTEXT to support base64 uploads
    try {
      await connection.query('ALTER TABLE client_photos MODIFY COLUMN image_url MEDIUMTEXT NOT NULL');
    } catch (alterErr) {
      console.log('client_photos table column upgrade skipped or already updated');
    }

    // Ensure products table column is MEDIUMTEXT to support base64 uploads
    try {
      await connection.query('ALTER TABLE products MODIFY COLUMN image_url MEDIUMTEXT NULL');
      console.log('products table image_url column upgraded to MEDIUMTEXT');
    } catch (alterErr) {
      console.log('products table column upgrade skipped or already updated');
    }

    // Ensure services table column is MEDIUMTEXT to support base64 uploads
    try {
      await connection.query('ALTER TABLE services MODIFY COLUMN image_url MEDIUMTEXT NULL');
      console.log('services table image_url column upgraded to MEDIUMTEXT');
    } catch (alterErr) {
      console.log('services table column upgrade skipped or already updated');
    }
    
    // Create site_settings table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          \`key\` VARCHAR(255) NOT NULL UNIQUE,
          \`value\` TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed default site settings if table is empty
    const [settingsRows]: any = await connection.query('SELECT COUNT(*) as count FROM site_settings');
    if (settingsRows[0].count === 0) {
      await connection.query(`
        INSERT INTO site_settings (\`key\`, \`value\`) VALUES 
        ('contact_email', 'hello@asantey.com'),
        ('contact_phone', '+1 (234) 567-890'),
        ('contact_address', '123 Luxury Lane, Fashion District, NY'),
        ('social_instagram', 'https://instagram.com/asantey'),
        ('social_facebook', 'https://facebook.com/asantey'),
        ('social_twitter', 'https://twitter.com/asantey'),
        ('footer_description', 'Luxury hair and braiding services for the modern woman.')
      `);
      console.log('Seeded default site settings.');
    }
    
    console.log('Database tables verified/initialized.');
    
    connection.release();
  } catch (error) {
    logError('DATABASE_INITIALIZATION', error);
    console.error('Error connecting to/initializing the database:', error);
    process.exit(1);
  }
}
