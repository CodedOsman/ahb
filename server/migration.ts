import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asantey_salon',
});

async function runMigration() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected. Running migration...');

    // Rename table
    try {
      await connection.query('RENAME TABLE product_lengths TO product_variants');
      console.log('Renamed product_lengths to product_variants');
    } catch (e: any) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.message.includes('already exists')) {
        console.log('Table product_variants already exists.');
      } else if (e.code === 'ER_NO_SUCH_TABLE') {
        console.log('Table product_lengths does not exist, perhaps already renamed.');
      } else {
        throw e;
      }
    }

    // Add variant_type
    try {
      await connection.query('ALTER TABLE product_variants ADD COLUMN variant_type VARCHAR(100) NULL DEFAULT ""');
      console.log('Added variant_type column');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column variant_type already exists.');
      } else {
        throw e;
      }
    }

    // Make length column nullable since some variants might just have a type and no length
    try {
      await connection.query('ALTER TABLE product_variants MODIFY COLUMN length VARCHAR(50) NULL DEFAULT ""');
      console.log('Modified length to be nullable');
    } catch (e: any) {
      console.log('Could not modify length column:', e.message);
    }

    console.log('Migration completed successfully.');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
