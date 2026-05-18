import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asantey_salon',
  });

  const username = 'admin';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`Creating admin user: ${username}...`);
  
  try {
    await connection.query(
      'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)',
      [username, passwordHash, 'admin@asantey.com']
    );
    console.log('Admin user created successfully.');
  } catch (err) {
    console.error('Error creating admin user:', err);
  }

  await connection.end();
}

createAdmin().catch(console.error);
