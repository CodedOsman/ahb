// server/index.ts
import express from "express";
import { createServer } from "http";
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import cors from "cors";
import dotenv3 from "dotenv";

// server/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// server/utils/logger.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var LOG_FILE_PATH = path.resolve(__dirname, "..", "..", "server-errors.log");
function logError(context, error) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "";
  const logEntry = `[${timestamp}] [CONTEXT: ${context}]
ERROR: ${errorMessage}
STACK: ${errorStack}
----------------------------------------
`;
  console.error(`[ERROR LOGGED] ${context}:`, errorMessage);
  try {
    fs.appendFileSync(LOG_FILE_PATH, logEntry, "utf-8");
  } catch (fsErr) {
    console.error("Failed to write to error log file:", fsErr);
  }
}

// server/db.ts
dotenv.config();
var pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "asantey_salon",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
var db_default = pool;
async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the database.");
    try {
      await connection.query("SET GLOBAL max_allowed_packet = 104857600");
      console.log("MySQL max_allowed_packet successfully increased to 100MB.");
    } catch (packetErr) {
      console.log("Could not set GLOBAL max_allowed_packet:", packetErr.message);
    }
    await connection.query(`
      CREATE TABLE IF NOT EXISTS client_photos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image_url MEDIUMTEXT NOT NULL,
          caption VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try {
      await connection.query("ALTER TABLE client_photos MODIFY COLUMN image_url MEDIUMTEXT NOT NULL");
    } catch (alterErr) {
      console.log("client_photos table column upgrade skipped or already updated");
    }
    try {
      await connection.query("ALTER TABLE products MODIFY COLUMN image_url MEDIUMTEXT NULL");
      console.log("products table image_url column upgraded to MEDIUMTEXT");
    } catch (alterErr) {
      console.log("products table column upgrade skipped or already updated");
    }
    try {
      await connection.query("ALTER TABLE services MODIFY COLUMN image_url MEDIUMTEXT NULL");
      console.log("services table image_url column upgraded to MEDIUMTEXT");
    } catch (alterErr) {
      console.log("services table column upgrade skipped or already updated");
    }
    try {
      await connection.query("ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE NULL AFTER name");
      console.log("products table slug column added");
    } catch (alterErr) {
      if (alterErr.code !== "ER_DUP_FIELDNAME") {
        console.log("products table slug column upgrade skipped or already updated", alterErr.message);
      }
    }
    try {
      await connection.query("ALTER TABLE services ADD COLUMN slug VARCHAR(255) UNIQUE NULL AFTER title");
      console.log("services table slug column added");
    } catch (alterErr) {
      if (alterErr.code !== "ER_DUP_FIELDNAME") {
        console.log("services table slug column upgrade skipped or already updated", alterErr.message);
      }
    }
    try {
      await connection.query('ALTER TABLE product_variants ADD COLUMN texture VARCHAR(100) NULL DEFAULT ""');
      console.log("product_variants table texture column added");
    } catch (alterErr) {
      if (alterErr.code !== "ER_DUP_FIELDNAME") {
        console.log("product_variants table texture column upgrade skipped or already updated");
      }
    }
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image_url MEDIUMTEXT NOT NULL,
          headline VARCHAR(255),
          subtitle TEXT,
          button_1_text VARCHAR(100),
          button_1_link VARCHAR(255),
          button_2_text VARCHAR(100),
          button_2_link VARCHAR(255),
          is_active BOOLEAN DEFAULT 1,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          \`key\` VARCHAR(255) NOT NULL UNIQUE,
          \`value\` MEDIUMTEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          discount_percentage INT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          valid_until TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS promotions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255),
          message TEXT NOT NULL,
          end_time TIMESTAMP NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const [settingsRows] = await connection.query("SELECT COUNT(*) as count FROM site_settings");
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
      console.log("Seeded default site settings.");
    }
    const [productsWithoutSlugs] = await connection.query("SELECT id, name FROM products WHERE slug IS NULL");
    for (const product of productsWithoutSlugs) {
      const baseSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      let slug = baseSlug;
      let counter = 1;
      let success = false;
      while (!success) {
        try {
          await connection.query("UPDATE products SET slug = ? WHERE id = ?", [slug, product.id]);
          success = true;
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            slug = `${baseSlug}-${counter}`;
            counter++;
          } else {
            throw err;
          }
        }
      }
    }
    const [servicesWithoutSlugs] = await connection.query("SELECT id, title FROM services WHERE slug IS NULL");
    for (const service of servicesWithoutSlugs) {
      const baseSlug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      let slug = baseSlug;
      let counter = 1;
      let success = false;
      while (!success) {
        try {
          await connection.query("UPDATE services SET slug = ? WHERE id = ?", [slug, service.id]);
          success = true;
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            slug = `${baseSlug}-${counter}`;
            counter++;
          } else {
            throw err;
          }
        }
      }
    }
    console.log("Database tables verified/initialized.");
    connection.release();
  } catch (error) {
    logError("DATABASE_INITIALIZATION", error);
    console.error("Error connecting to/initializing the database:", error);
    process.exit(1);
  }
}

// server/routes/public.ts
import { Router } from "express";
import nodemailer from "nodemailer";
import dotenv2 from "dotenv";
dotenv2.config();
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var router = Router();
router.get("/hero-slides", async (req, res) => {
  try {
    const [rows] = await db_default.query(
      "SELECT id, image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, display_order FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/services", async (req, res) => {
  try {
    const [rows] = await db_default.query(
      "SELECT id, category_id, title, description, price, image_url, booking_link, is_active FROM services WHERE is_active = 1"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/categories", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM categories");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = "SELECT p.*, p.stock, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1";
    const params = [];
    if (category) {
      query += " AND c.slug = ?";
      params.push(category);
    }
    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await db_default.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/products/:slug", async (req, res) => {
  try {
    const [productRows] = await db_default.query(
      "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? OR p.id = ?",
      [req.params.slug, req.params.slug]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const productId = productRows[0].id;
    const [variantRows] = await db_default.query(
      "SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC",
      [productId]
    );
    res.json({
      ...productRows[0],
      variants: variantRows
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/settings", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM site_settings");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/delivery-zones", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM delivery_zones WHERE is_active = 1");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching delivery zones:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/client-photos", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM client_photos ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching client photos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/reviews", async (req, res) => {
  try {
    const [rows] = await db_default.query(
      "SELECT id, name, service, rating, content, created_at FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/reviews", async (req, res) => {
  const { name, service, rating, content } = req.body;
  if (!name || !service || !rating || !content) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }
  try {
    await db_default.query(
      "INSERT INTO reviews (name, service, rating, content, is_approved) VALUES (?, ?, ?, ?, 0)",
      [name, service, rating, content]
    );
    const [settingsRows] = await db_default.query('SELECT value FROM site_settings WHERE `key` = "admin_notification_email"');
    let adminEmail = null;
    if (settingsRows.length > 0 && settingsRows[0].value) {
      adminEmail = settingsRows[0].value;
    }
    if (adminEmail && process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"Asantey System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: "New Review Submitted - Action Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #eaeaea;">
              <h2 style="color: #000000; margin-top: 0;">New Review Pending Approval</h2>
              <p>A new review has been submitted and is waiting for your approval in the admin dashboard.</p>
              <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #000000; margin-top: 20px;">
                  <p><strong>Customer:</strong> ${name}</p>
                  <p><strong>Service:</strong> ${service}</p>
                  <p><strong>Rating:</strong> ${rating}/5</p>
                  <p><strong>Review:</strong></p>
                  <p style="color: #555555; font-style: italic;">"${content}"</p>
              </div>
              <p style="margin-top: 20px;">Please log in to the admin panel to approve or delete this review.</p>
          </div>
        `
      }).catch((err) => console.error("Failed to send review notification:", err));
    }
    res.json({ message: "Review submitted successfully. It will appear after approval." });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var cachedGoogleReviews = [];
var googleReviewsLastFetch = 0;
var CACHE_TTL = 1e3 * 60 * 60 * 24;
router.get("/reviews/google", async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    return res.json([]);
  }
  if (Date.now() - googleReviewsLastFetch < CACHE_TTL && cachedGoogleReviews.length > 0) {
    return res.json(cachedGoogleReviews);
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.result && data.result.reviews) {
      cachedGoogleReviews = data.result.reviews.map((r) => ({
        id: `google-${r.time}`,
        name: r.author_name,
        service: "Google Review",
        rating: r.rating,
        content: r.text,
        created_at: new Date(r.time * 1e3).toISOString(),
        isGoogle: true
      }));
      googleReviewsLastFetch = Date.now();
    }
    res.json(cachedGoogleReviews);
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/promotions/active", async (req, res) => {
  try {
    const [rows] = await db_default.query(
      "SELECT * FROM promotions WHERE is_active = 1 AND (end_time IS NULL OR end_time > NOW()) ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var public_default = router;

// server/routes/admin.ts
import { Router as Router2 } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer2 from "nodemailer";
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/utils/imageProcessor.ts
import sharp from "sharp";
async function convertToWebp(base64Image) {
  if (!base64Image) return base64Image;
  if (!base64Image.startsWith("data:image/")) {
    return base64Image;
  }
  try {
    const matches = base64Image.match(/^data:(image\/.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Image;
    }
    const mimeType = matches[1];
    const base64Data = matches[2];
    const inputBuffer = Buffer.from(base64Data, "base64");
    const outputBuffer = await sharp(inputBuffer).webp({ quality: 80 }).toBuffer();
    return `data:image/webp;base64,${outputBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error converting image to WebP:", error);
    return base64Image;
  }
}

// server/routes/admin.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var router2 = Router2();
var JWT_SECRET = process.env.JWT_SECRET || "asantey_luxury_salon_secret_key_2024";
var transporter2 = nodemailer2.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var UPLOADS_DIR = process.env.PUBLIC_DIR ? path2.join(process.env.PUBLIC_DIR, "uploads") : path2.join(__dirname2, "../../client/public/uploads");
var saveBase64Image = (type, base64String) => {
  if (!base64String || !base64String.startsWith("data:image/")) {
    return base64String || null;
  }
  const matches = base64String.match(/^data:image\/(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64String;
  }
  const extension = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");
  const filename = `${Date.now()}-${Math.floor(Math.random() * 1e4)}.${extension}`;
  const typeDir = path2.join(UPLOADS_DIR, type);
  if (!fs2.existsSync(typeDir)) {
    fs2.mkdirSync(typeDir, { recursive: true });
  }
  const filePath = path2.join(typeDir, filename);
  fs2.writeFileSync(filePath, buffer);
  return `/uploads/${type}/${filename}`;
};
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
router2.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db_default.query("SELECT * FROM admins WHERE username = ?", [username]);
    const admin = rows[0];
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "8h" });
      res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    logError("ADMIN_LOGIN", error);
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db_default.query("SELECT * FROM admins WHERE email = ?", [email]);
    const admin = rows[0];
    if (!admin) {
      return res.status(404).json({ error: "Admin with this email not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 36e5);
    await db_default.query("UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [resetToken, resetTokenExpires, admin.id]);
    const resetUrl = `http://${req.headers.host}/admin/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset - Asantey Luxury Salon",
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };
    await transporter2.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const [rows] = await db_default.query("SELECT * FROM admins WHERE reset_token = ? AND reset_token_expires > NOW()", [token]);
    const admin = rows[0];
    if (!admin) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db_default.query("UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?", [passwordHash, admin.id]);
    res.json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [rows] = await db_default.query("SELECT * FROM admins WHERE id = ?", [req.user.id]);
    const admin = rows[0];
    if (!admin || !await bcrypt.compare(currentPassword, admin.password_hash)) {
      return res.status(401).json({ error: "Incorrect current password" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db_default.query("UPDATE admins SET password_hash = ? WHERE id = ?", [passwordHash, req.user.id]);
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/profile", authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  try {
    await db_default.query("UPDATE admins SET username = ?, email = ? WHERE id = ?", [username, email, req.user.id]);
    res.json({ message: "Profile updated successfully", admin: { id: req.user.id, username, email } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/categories", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM categories ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/categories", authenticateToken, async (req, res) => {
  let { name, slug, type, image_url } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("category", image_url);
  try {
    const [result] = await db_default.query(
      "INSERT INTO categories (name, slug, type, image_url) VALUES (?, ?, ?, ?)",
      [name, slug, type, finalImageUrl || null]
    );
    res.json({ id: result.insertId, message: "Category created" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Category slug already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/categories/:id", authenticateToken, async (req, res) => {
  let { name, slug, type, image_url } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("category", image_url);
  console.log(`[PUT /categories/${req.params.id}] name: ${name}, image_url length: ${image_url?.length || 0}`);
  try {
    await db_default.query(
      "UPDATE categories SET name = ?, slug = ?, type = ?, image_url = ? WHERE id = ?",
      [name, slug, type, finalImageUrl || null, req.params.id]
    );
    res.json({ message: "Category updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Category slug already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/categories/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/services", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query(`
      SELECT s.id, s.category_id, s.title, s.description, s.price, s.image_url, s.booking_link, s.is_active,
             c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/services", authenticateToken, async (req, res) => {
  let { category_id, title, description, price, image_url, booking_link, is_active } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("service", image_url);
  const connection = await db_default.getConnection();
  try {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    let success = false;
    let insertId = null;
    while (!success) {
      try {
        const [result] = await connection.query(
          "INSERT INTO services (category_id, title, slug, description, price, image_url, booking_link, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [category_id, title, slug, description, price, finalImageUrl, booking_link || null, is_active === void 0 ? 1 : is_active]
        );
        insertId = result.insertId;
        success = true;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          throw err;
        }
      }
    }
    res.json({ id: insertId, message: "Service created" });
  } catch (error) {
    logError("CREATE_SERVICE", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});
router2.put("/services/:id", authenticateToken, async (req, res) => {
  let { category_id, title, description, price, image_url, booking_link, is_active } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("service", image_url);
  const connection = await db_default.getConnection();
  try {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    let success = false;
    while (!success) {
      try {
        await connection.query(
          "UPDATE services SET category_id = ?, title = ?, slug = ?, description = ?, price = ?, image_url = ?, booking_link = ?, is_active = ? WHERE id = ?",
          [category_id, title, slug, description, price, finalImageUrl, booking_link || null, is_active, req.params.id]
        );
        success = true;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          throw err;
        }
      }
    }
    res.json({ message: "Service updated" });
  } catch (error) {
    logError("UPDATE_SERVICE", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});
router2.delete("/services/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM services WHERE id = ?", [req.params.id]);
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/products", authenticateToken, async (req, res) => {
  let { category_id, name, description, base_price, image_url, is_active, variants, stock } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("product", image_url);
  const totalStock = Array.isArray(variants) && variants.length ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : stock || 0;
  const connection = await db_default.getConnection();
  try {
    await connection.beginTransaction();
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    let success = false;
    let productId = null;
    while (!success) {
      try {
        const [result] = await connection.query(
          "INSERT INTO products (category_id, name, slug, description, base_price, image_url, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [category_id, name, slug, description, base_price, finalImageUrl, is_active === void 0 ? 1 : is_active, totalStock]
        );
        productId = result.insertId;
        success = true;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          throw err;
        }
      }
    }
    if (variants && Array.isArray(variants)) {
      for (const variant of req.body.variants) {
        await connection.query(
          "INSERT INTO product_variants (product_id, variant_type, size, length, texture, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [productId, variant.variant_type || null, variant.size || null, variant.length || null, variant.texture || null, variant.price, variant.stock || 0]
        );
      }
    }
    await connection.commit();
    res.json({ id: productId, message: "Product created" });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error("Failed to rollback transaction (connection closed):", rollbackErr);
    }
    logError("CREATE_PRODUCT", error);
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});
router2.put("/products/:id", authenticateToken, async (req, res) => {
  let { category_id, name, description, base_price, image_url, is_active, variants, stock } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("product", image_url);
  const totalStock = Array.isArray(variants) && variants.length ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : stock || 0;
  const connection = await db_default.getConnection();
  try {
    await connection.beginTransaction();
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    let success = false;
    while (!success) {
      try {
        await connection.query(
          "UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, base_price = ?, image_url = ?, is_active = ?, stock = ? WHERE id = ?",
          [category_id, name, slug, description, base_price, finalImageUrl, is_active, totalStock, req.params.id]
        );
        success = true;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          throw err;
        }
      }
    }
    await connection.query("DELETE FROM product_variants WHERE product_id = ?", [req.params.id]);
    if (variants && Array.isArray(variants)) {
      for (const variant of req.body.variants) {
        await connection.query(
          "INSERT INTO product_variants (product_id, variant_type, size, length, texture, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [req.params.id, variant.variant_type || null, variant.size || null, variant.length || null, variant.texture || null, variant.price, variant.stock || 0]
        );
      }
    }
    await connection.commit();
    res.json({ message: "Product updated" });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error("Failed to rollback transaction (connection closed):", rollbackErr);
    }
    logError("UPDATE_PRODUCT", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});
router2.get("/products", authenticateToken, async (req, res) => {
  try {
    const [products] = await db_default.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    const [variants] = await db_default.query("SELECT * FROM product_variants");
    const productsWithVariants = products.map((p) => {
      const productVariants = variants.filter((v) => v.product_id === p.id);
      const variantStock = productVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...p,
        stock: productVariants.length ? variantStock : p.stock,
        variants: productVariants
      };
    });
    res.json(productsWithVariants);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/products/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/delivery-zones", authenticateToken, async (req, res) => {
  const { name, price, is_active } = req.body;
  try {
    await db_default.query("INSERT INTO delivery_zones (name, price, is_active) VALUES (?, ?, ?)", [name, price, is_active === void 0 ? 1 : is_active]);
    res.json({ message: "Delivery zone created" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/delivery-zones/:id", authenticateToken, async (req, res) => {
  const { name, price, is_active } = req.body;
  try {
    await db_default.query("UPDATE delivery_zones SET name = ?, price = ?, is_active = ? WHERE id = ?", [name, price, is_active, req.params.id]);
    res.json({ message: "Delivery zone updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/delivery-zones/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM delivery_zones WHERE id = ?", [req.params.id]);
    res.json({ message: "Delivery zone deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/orders", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db_default.query("SELECT o.*, d.name as delivery_zone_name FROM orders o LEFT JOIN delivery_zones d ON o.delivery_zone_id = d.id ORDER BY o.created_at DESC");
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const [items] = await db_default.query("SELECT * FROM order_items WHERE order_id IN (?)", [orderIds]);
      orders.forEach((order) => {
        order.items = items.filter((item) => item.order_id == order.id);
      });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/orders/:id/status", authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const orderId = req.params.id;
    await db_default.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    if (status === "shipped") {
      const [orderRows] = await db_default.query("SELECT * FROM orders WHERE id = ?", [orderId]);
      const order = orderRows[0];
      if (order && order.customer_email && process.env.SMTP_USER) {
        await transporter2.sendMail({
          from: `"Asantey Hair & Beauty Salon" <${process.env.SMTP_USER}>`,
          to: order.customer_email,
          subject: "Your Order Has Been Shipped! - Asantey Hair & Beauty Salon",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border: 1px solid #eaeaea;">
              <h1 style="color: #000000; font-size: 24px; text-transform: uppercase;">Good News!</h1>
              <p>Hi ${order.customer_name || "there"},</p>
              <p>Your order has been shipped and is on its way to you.</p>
              <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 3px solid #000000;">
                <p style="margin: 0;"><strong>Shipping Address:</strong><br/>${order.shipping_address || "Not provided"}</p>
              </div>
              <p>We hope you love your purchase. If you have any questions, please feel free to reply directly to this email.</p>
              <br/>
              <p>Warm regards,<br/>The Asantey Hair & Beauty Salon Team</p>
            </div>
          `
        }).catch((err) => console.error("Failed to send shipping notification:", err));
      }
    }
    res.json({ message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/stats", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db_default.query('SELECT total FROM orders WHERE status IN ("paid", "shipped", "delivered")');
    const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const [services] = await db_default.query("SELECT COUNT(*) as count FROM services");
    const [products] = await db_default.query("SELECT COUNT(*) as count FROM products");
    const [categories] = await db_default.query("SELECT COUNT(*) as count FROM categories");
    res.json({
      revenue,
      services: services[0].count,
      products: products[0].count,
      categories: categories[0].count
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/settings", authenticateToken, async (req, res) => {
  const { settings } = req.body;
  const connection = await db_default.getConnection();
  try {
    await connection.beginTransaction();
    for (let [key, value] of Object.entries(settings)) {
      if (typeof value === "string" && value.startsWith("data:image/")) {
        value = saveBase64Image("setting", value) || value;
      }
      await connection.query(
        "INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
        [key, value, value]
      );
    }
    await connection.commit();
    res.json({ message: "Settings updated" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
});
router2.get("/client-photos", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM client_photos ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error getting admin client photos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/client-photos", authenticateToken, async (req, res) => {
  let { image_url, caption } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("client-photo", image_url);
  if (!finalImageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }
  try {
    const [result] = await db_default.query(
      "INSERT INTO client_photos (image_url, caption) VALUES (?, ?)",
      [finalImageUrl, caption || ""]
    );
    res.json({ id: result.insertId, image_url, caption, message: "Client photo added" });
  } catch (error) {
    logError("ADD_CLIENT_PHOTO", error);
    console.error("Error adding client photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/client-photos/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM client_photos WHERE id = ?", [req.params.id]);
    res.json({ message: "Client photo deleted" });
  } catch (error) {
    console.error("Error deleting client photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/reviews", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/reviews/:id/approve", authenticateToken, async (req, res) => {
  try {
    await db_default.query("UPDATE reviews SET is_approved = 1 WHERE id = ?", [req.params.id]);
    res.json({ message: "Review approved" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/reviews/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/hero-slides", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM hero_slides ORDER BY display_order ASC, created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching admin hero slides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/hero-slides", authenticateToken, async (req, res) => {
  let { image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, is_active, display_order } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("hero-slide", image_url);
  if (!finalImageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }
  try {
    await db_default.query(
      "INSERT INTO hero_slides (image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [finalImageUrl, headline || null, subtitle || null, button_1_text || null, button_1_link || null, button_2_text || null, button_2_link || null, is_active !== void 0 ? is_active : 1, display_order || 0]
    );
    res.json({ message: "Hero slide created successfully" });
  } catch (error) {
    console.error("Error creating hero slide:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/hero-slides/:id", authenticateToken, async (req, res) => {
  let { image_url, headline, subtitle, button_1_text, button_1_link, button_2_text, button_2_link, is_active, display_order } = req.body;
  image_url = await convertToWebp(image_url);
  const finalImageUrl = saveBase64Image("hero-slide", image_url);
  try {
    await db_default.query(
      "UPDATE hero_slides SET image_url = ?, headline = ?, subtitle = ?, button_1_text = ?, button_1_link = ?, button_2_text = ?, button_2_link = ?, is_active = ?, display_order = ? WHERE id = ?",
      [finalImageUrl, headline || null, subtitle || null, button_1_text || null, button_1_link || null, button_2_text || null, button_2_link || null, is_active, display_order, req.params.id]
    );
    res.json({ message: "Hero slide updated successfully" });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/hero-slides/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM hero_slides WHERE id = ?", [req.params.id]);
    res.json({ message: "Hero slide deleted" });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/promo-codes", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM promo_codes ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/promo-codes", authenticateToken, async (req, res) => {
  const { code, discount_percentage, is_active, valid_until } = req.body;
  try {
    await db_default.query(
      "INSERT INTO promo_codes (code, discount_percentage, is_active, valid_until) VALUES (?, ?, ?, ?)",
      [code, discount_percentage, is_active !== void 0 ? is_active : 1, valid_until || null]
    );
    res.json({ message: "Promo code created successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Promo code already exists" });
    }
    console.error("Error creating promo code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/promo-codes/:id", authenticateToken, async (req, res) => {
  const { code, discount_percentage, is_active, valid_until } = req.body;
  try {
    await db_default.query(
      "UPDATE promo_codes SET code = ?, discount_percentage = ?, is_active = ?, valid_until = ? WHERE id = ?",
      [code, discount_percentage, is_active, valid_until || null, req.params.id]
    );
    res.json({ message: "Promo code updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Promo code already exists" });
    }
    console.error("Error updating promo code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/promo-codes/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM promo_codes WHERE id = ?", [req.params.id]);
    res.json({ message: "Promo code deleted" });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/promotions", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM promotions ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/promotions", authenticateToken, async (req, res) => {
  const { title, message, end_time, is_active } = req.body;
  try {
    await db_default.query(
      "INSERT INTO promotions (title, message, end_time, is_active) VALUES (?, ?, ?, ?)",
      [title || null, message, end_time || null, is_active !== void 0 ? is_active : 1]
    );
    res.json({ message: "Promotion created successfully" });
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/promotions/:id", authenticateToken, async (req, res) => {
  const { title, message, end_time, is_active } = req.body;
  try {
    await db_default.query(
      "UPDATE promotions SET title = ?, message = ?, end_time = ?, is_active = ? WHERE id = ?",
      [title || null, message, end_time || null, is_active, req.params.id]
    );
    res.json({ message: "Promotion updated successfully" });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/promotions/:id", authenticateToken, async (req, res) => {
  try {
    await db_default.query("DELETE FROM promotions WHERE id = ?", [req.params.id]);
    res.json({ message: "Promotion deleted" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var admin_default = router2;

// server/routes/checkout.ts
import { Router as Router3 } from "express";
import Stripe from "stripe";
import nodemailer3 from "nodemailer";
var router3 = Router3();
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-12-18.acacia"
});
var transporter3 = nodemailer3.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
router3.post("/create-session", async (req, res) => {
  try {
    const { items, deliveryZoneId, discount_code } = req.body;
    const [zoneRows] = await db_default.query("SELECT * FROM delivery_zones WHERE id = ?", [deliveryZoneId]);
    if (zoneRows.length === 0) return res.status(400).json({ error: "Invalid delivery zone" });
    const deliveryZone = zoneRows[0];
    const line_items = items.map((item) => {
      const priceValue = parseFloat(item.price.replace("\xA3", "").replace("$", ""));
      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.name,
            metadata: {
              product_id: item.id
              // we store the id (e.g., '1' or '1-2') here to read later
            }
          },
          unit_amount: Math.round(priceValue * 100)
          // Stripe expects amounts in cents/pence
        },
        quantity: item.quantity
      };
    });
    line_items.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Shipping: ${deliveryZone.name}`
        },
        unit_amount: Math.round(parseFloat(deliveryZone.price) * 100)
      },
      quantity: 1
    });
    let subtotal = items.reduce((acc, item) => {
      const price = parseFloat(item.price.replace("\xA3", "").replace("$", ""));
      return acc + price * item.quantity;
    }, 0);
    let discountAmount = 0;
    if (discount_code) {
      const [promoRows] = await db_default.query(
        "SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())",
        [discount_code]
      );
      if (promoRows.length > 0) {
        const promo = promoRows[0];
        discountAmount = subtotal * (promo.discount_percentage / 100);
        subtotal = subtotal - discountAmount;
      }
    }
    const deliveryFee = parseFloat(deliveryZoneId === 0 ? "0" : deliveryZone.price);
    const total = subtotal + deliveryFee;
    if (discountAmount > 0) {
      const discountFactor = subtotal / (subtotal + discountAmount);
      line_items.forEach((li) => {
        if (li.price_data.product_data.name !== `Shipping: ${deliveryZone.name}`) {
          li.price_data.unit_amount = Math.round(li.price_data.unit_amount * discountFactor);
        }
      });
    }
    const origin = req.headers.origin || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "CA", "FR", "DE", "IT", "ES"]
        // Add relevant countries
      },
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        delivery_zone_id: deliveryZoneId.toString(),
        subtotal: subtotal.toString(),
        delivery_fee: deliveryFee.toString(),
        total: total.toString(),
        items_json: JSON.stringify(items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
      }
    });
    const [orderResult] = await db_default.query(
      "INSERT INTO orders (stripe_session_id, delivery_zone_id, subtotal, delivery_fee, total, status) VALUES (?, ?, ?, ?, ?, ?)",
      [session.id, deliveryZoneId, subtotal, deliveryFee, total, "pending"]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      const priceValue = parseFloat(item.price.replace("\xA3", "").replace("$", ""));
      await db_default.query(
        "INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.id, item.name, priceValue, item.quantity]
      );
    }
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
router3.post("/validate-promo", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Promo code is required" });
    }
    const [promoRows] = await db_default.query(
      "SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())",
      [code]
    );
    if (promoRows.length === 0) {
      return res.status(404).json({ error: "Invalid or expired promo code" });
    }
    res.json({ discount_percentage: promoRows[0].discount_percentage });
  } catch (error) {
    console.error("Promo validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    const rawBody = req.rawBody || req.body;
    console.log(`Webhook received. Skipping verification.`);
    if (Buffer.isBuffer(rawBody)) {
      event = JSON.parse(rawBody.toString("utf8"));
    } else if (typeof rawBody === "string") {
      event = JSON.parse(rawBody);
    } else {
      event = rawBody;
    }
  } catch (err) {
    console.error(`Failed to process webhook payload: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const sessionId = session.id;
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const address = session.customer_details?.address;
    const shippingAddressStr = address ? `${address.line1}, ${address.city}, ${address.state || ""} ${address.postal_code}, ${address.country}` : "No address provided";
    try {
      await db_default.query(
        "UPDATE orders SET status = ?, customer_email = ?, customer_name = ?, shipping_address = ? WHERE stripe_session_id = ?",
        ["paid", customerEmail, customerName, shippingAddressStr, sessionId]
      );
      const [orderRows] = await db_default.query("SELECT id, subtotal, delivery_fee FROM orders WHERE stripe_session_id = ?", [sessionId]);
      if (orderRows.length > 0) {
        const orderId = orderRows[0].id;
        const subtotal = parseFloat(orderRows[0].subtotal);
        const deliveryFee = parseFloat(orderRows[0].delivery_fee);
        const [items] = await db_default.query("SELECT product_id, product_name, price, quantity FROM order_items WHERE order_id = ?", [orderId]);
        const [settingsRows] = await db_default.query('SELECT `key`, value FROM site_settings WHERE `key` LIKE "email_%" OR `key` = "admin_notification_email"');
        const emailSettings = {};
        settingsRows.forEach((row) => {
          emailSettings[row.key] = row.value;
        });
        const primaryColor = emailSettings.email_primary_color || "#000000";
        const accentColor = emailSettings.email_accent_color || "#f9f9f9";
        let itemsHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">`;
        for (const item of items) {
          let baseProductId = item.product_id;
          if (baseProductId.includes("-")) {
            baseProductId = baseProductId.split("-")[0];
          }
          const [catRows] = await db_default.query("SELECT c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?", [baseProductId]);
          const categoryName = catRows.length > 0 ? catRows[0].category_name : "Product";
          itemsHtml += `
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">
                        <strong style="color: #000000;">${item.product_name}</strong> <span style="color: #999999; font-size: 12px; margin-left: 5px;">(${categoryName})</span><br/>
                        <span style="color: #666666; font-size: 12px;">Qty: ${item.quantity} | Price: \xA3${parseFloat(item.price).toFixed(2)}</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; text-align: right; color: #000000;">
                        \xA3${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                </tr>
            `;
          const pId = item.product_id;
          if (pId.includes("-")) {
            const [prodId, lengthId] = pId.split("-");
            await db_default.query("UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, lengthId]);
          } else {
            await db_default.query("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, pId]);
          }
        }
        itemsHtml += `
                <tr>
                    <td style="padding: 10px 0; border-top: 2px solid ${primaryColor}; text-align: right;">
                        <strong style="color: #666666; font-size: 14px;">Subtotal:</strong>
                    </td>
                    <td style="padding: 10px 0; border-top: 2px solid ${primaryColor}; text-align: right; color: ${primaryColor};">
                        \xA3${subtotal.toFixed(2)}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 5px 0; text-align: right;">
                        <strong style="color: #666666; font-size: 14px;">Delivery Fee:</strong>
                    </td>
                    <td style="padding: 5px 0; text-align: right; color: ${primaryColor};">
                        \xA3${deliveryFee.toFixed(2)}
                    </td>
                </tr>
            </table>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eaeaea; font-size: 14px; color: #666666;">
                <strong style="color: ${primaryColor};">Shipping Address:</strong><br/>
                ${shippingAddressStr}
            </div>
        `;
        if (customerEmail && process.env.SMTP_USER) {
          const subject = emailSettings.email_customer_subject || "Order Confirmation - Asantey Hair & Beauty Salon";
          const headerText = emailSettings.email_header_text || "Asantey Hair & Beauty Salon";
          const greetingText = (emailSettings.email_greeting || "Dear {customerName},").replace("{customerName}", customerName || "Customer");
          const formatText = (text) => text ? text.replace(/\n/g, "<br/>") : "";
          const bodyText = formatText(emailSettings.email_body_text || "Thank you for choosing Asantey Hair & Beauty Salon. We are delighted to confirm that your order and payment have been successfully received.");
          const footerText = formatText(emailSettings.email_footer_text || "We will notify you as soon as your order ships. If you have any questions, please reply directly to this email.");
          const closingText = formatText(emailSettings.email_closing_text || "Warm regards,\nThe Asantey Hair & Beauty Salon Team");
          const headerImg = emailSettings.email_header_image_url ? `
            <div style="text-align: ${emailSettings.email_header_image_align || "center"}; margin-bottom: 20px;">
              <img src="${emailSettings.email_header_image_url}" alt="Header" style="max-width: ${emailSettings.email_header_image_width || "100%"}; height: auto;" />
            </div>
          ` : "";
          const bodyImg = emailSettings.email_body_image_url ? `
            <div style="text-align: ${emailSettings.email_body_image_align || "center"}; margin: 20px 0;">
              <img src="${emailSettings.email_body_image_url}" alt="Body" style="max-width: ${emailSettings.email_body_image_width || "100%"}; height: auto;" />
            </div>
          ` : "";
          const footerImg = emailSettings.email_footer_image_url ? `
            <div style="text-align: ${emailSettings.email_footer_image_align || "center"}; margin-top: 30px;">
              <img src="${emailSettings.email_footer_image_url}" alt="Footer" style="max-width: ${emailSettings.email_footer_image_width || "100%"}; height: auto;" />
            </div>
          ` : "";
          await transporter3.sendMail({
            from: `"Asantey Hair & Beauty Salon" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border: 1px solid #eaeaea;">
                  ${headerImg}
                  <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: ${primaryColor}; font-size: 24px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; margin: 0;">${headerText}</h1>
                      <div style="height: 1px; background-color: ${primaryColor}; width: 50px; margin: 20px auto;"></div>
                  </div>
                  <div style="color: #333333; font-size: 14px; line-height: 1.6;">
                      <p style="font-size: 16px; font-weight: 400; color: ${primaryColor};">${greetingText}</p>
                      <p>${bodyText}</p>
                      ${bodyImg}
                      <div style="background-color: ${accentColor}; padding: 20px; margin: 30px 0; border-left: 3px solid ${primaryColor};">
                          <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666666;">Order Summary</p>
                          ${itemsHtml}
                          <p style="margin: 20px 0 0 0; font-size: 18px; color: ${primaryColor}; text-align: right;"><strong>Total: \xA3${(session.amount_total / 100).toFixed(2)}</strong></p>
                      </div>
                      <p>${footerText}</p>
                      <p style="margin-top: 40px; color: #666666;">${closingText}</p>
                      ${footerImg}
                  </div>
              </div>
            `
          });
        }
        let adminEmail = emailSettings.admin_notification_email || null;
        if (adminEmail && process.env.SMTP_USER) {
          await transporter3.sendMail({
            from: `"Asantey System" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `New Order Received - ${customerName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #eaeaea;">
                  <h2 style="color: #000000; margin-top: 0;">New Order Alert</h2>
                  <p>A new order has been placed successfully.</p>
                  <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #000000; margin-top: 20px;">
                      <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
                      <p><strong>Order Summary:</strong></p>
                      ${itemsHtml}
                  </div>
                  <p style="margin-top: 20px;">Log in to the admin dashboard for full details.</p>
              </div>
            `
          }).catch((err) => console.error("Failed to send admin order notification:", err));
        }
      }
    } catch (dbErr) {
      console.error("Error processing successful checkout in DB:", dbErr);
    }
  }
  res.json({ received: true });
});
var checkout_default = router3;

// server/index.ts
dotenv3.config();
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
async function startServer() {
  const app = express();
  const server = createServer(app);
  await initDb();
  app.use(cors());
  app.use(express.json({
    limit: "50mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api/checkout", checkout_default);
  app.use("/api", public_default);
  app.use("/api/admin", admin_default);
  const staticPath = process.env.PUBLIC_DIR ? path3.resolve(process.env.PUBLIC_DIR) : path3.resolve(process.cwd(), "dist", "public");
  app.get("/cart", (_req, res) => {
    res.redirect(301, "/");
  });
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path3.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 5e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
