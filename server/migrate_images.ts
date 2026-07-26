import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const UPLOADS_DIR = process.env.PUBLIC_DIR 
  ? path.join(process.env.PUBLIC_DIR, 'uploads')
  : path.join(__dirname, '../client/public/uploads'); // fallback for local dev

// Ensure directories exist
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const tablesToMigrate = [
  { table: 'services', type: 'service' },
  { table: 'products', type: 'product' },
  { table: 'hero_slides', type: 'hero-slide' },
  { table: 'client_photos', type: 'client-photo' },
  { table: 'categories', type: 'category' }
];

async function migrateImages() {
  console.log('Starting image migration...');
  console.log(`Uploads directory: ${UPLOADS_DIR}`);
  ensureDir(UPLOADS_DIR);

  try {
    for (const { table, type } of tablesToMigrate) {
      console.log(`Processing table: ${table}`);
      const typeDir = path.join(UPLOADS_DIR, type);
      ensureDir(typeDir);

      const [rows]: any = await pool.query(`SELECT id, image_url FROM ${table} WHERE image_url LIKE 'data:image/%'`);
      console.log(`Found ${rows.length} images to migrate in ${table}`);

      for (const row of rows) {
        if (!row.image_url) continue;

        const matches = row.image_url.match(/^data:image\/(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          console.log(`Skipping invalid base64 format for ID ${row.id} in ${table}`);
          continue;
        }

        const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1]; // normalize extension
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${row.id}.${extension}`;
        const filePath = path.join(typeDir, filename);

        // Save file
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved: ${filePath}`);

        // Update DB with the new path
        const newUrl = `/uploads/${type}/${filename}`;
        await pool.query(`UPDATE ${table} SET image_url = ? WHERE id = ?`, [newUrl, row.id]);
        console.log(`Updated DB: ${newUrl} for ID ${row.id}`);
      }
    }
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateImages();
