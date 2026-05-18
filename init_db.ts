import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const sqlFile = process.argv[2] || 'server/schema.sql';
  console.log(`Reading SQL from ${sqlFile}...`);
  
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const queries = sql.split(';').filter(q => q.trim().length > 0);

  for (let query of queries) {
    try {
      await connection.query(query);
    } catch (err) {
      console.error('Error executing query:', query.substring(0, 50), '...');
      console.error(err);
    }
  }

  console.log('Database initialization finished.');
  await connection.end();
}

init().catch(console.error);
