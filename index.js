// server/index.ts
import express from "express";
import { createServer } from "http";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import cors from "cors";
import dotenv2 from "dotenv";

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
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          \`key\` VARCHAR(255) NOT NULL UNIQUE,
          \`value\` TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
var router = Router();
router.get("/services", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM services WHERE is_active = 1");
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
    let query = "SELECT p.*, p.stock, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1";
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
router.get("/products/:id", async (req, res) => {
  try {
    const [productRows] = await db_default.query(
      "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?",
      [req.params.id]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const [lengthRows] = await db_default.query(
      "SELECT * FROM product_lengths WHERE product_id = ? ORDER BY price ASC",
      [req.params.id]
    );
    res.json({
      ...productRows[0],
      lengths: lengthRows
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
var public_default = router;

// server/routes/admin.ts
import { Router as Router2 } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var router2 = Router2();
var JWT_SECRET = process.env.JWT_SECRET || "asantey_luxury_salon_secret_key_2024";
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
router2.get("/services", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db_default.query(`
      SELECT s.*, c.name as category_name
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
  const { category_id, title, description, price, image_url, is_active } = req.body;
  try {
    const [result] = await db_default.query(
      "INSERT INTO services (category_id, title, description, price, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [category_id, title, description, price, image_url, is_active === void 0 ? 1 : is_active]
    );
    res.json({ id: result.insertId, message: "Service created" });
  } catch (error) {
    logError("CREATE_SERVICE", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/services/:id", authenticateToken, async (req, res) => {
  const { category_id, title, description, price, image_url, is_active } = req.body;
  try {
    await db_default.query(
      "UPDATE services SET category_id = ?, title = ?, description = ?, price = ?, image_url = ?, is_active = ? WHERE id = ?",
      [category_id, title, description, price, image_url, is_active, req.params.id]
    );
    res.json({ message: "Service updated" });
  } catch (error) {
    logError("UPDATE_SERVICE", error);
    res.status(500).json({ error: "Internal server error" });
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
  const { category_id, name, description, base_price, image_url, is_active, lengths, stock } = req.body;
  const connection = await db_default.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      "INSERT INTO products (category_id, name, description, base_price, image_url, is_active, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [category_id, name, description, base_price, image_url, is_active === void 0 ? 1 : is_active, stock || 0]
    );
    const productId = result.insertId;
    if (lengths && Array.isArray(lengths)) {
      for (const len of lengths) {
        await connection.query(
          "INSERT INTO product_lengths (product_id, length, price, stock) VALUES (?, ?, ?, ?)",
          [productId, len.length, len.price, len.stock || 0]
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
  const { category_id, name, description, base_price, image_url, is_active, lengths, stock } = req.body;
  const connection = await db_default.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      "UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, image_url = ?, is_active = ?, stock = ? WHERE id = ?",
      [category_id, name, description, base_price, image_url, is_active, stock || 0, req.params.id]
    );
    await connection.query("DELETE FROM product_lengths WHERE product_id = ?", [req.params.id]);
    if (lengths && Array.isArray(lengths)) {
      for (const len of lengths) {
        await connection.query(
          "INSERT INTO product_lengths (product_id, length, price, stock) VALUES (?, ?, ?, ?)",
          [req.params.id, len.length, len.price, len.stock || 0]
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
    const [lengths] = await db_default.query("SELECT * FROM product_lengths");
    const productsWithLengths = products.map((p) => {
      return {
        ...p,
        lengths: lengths.filter((l) => l.product_id === p.id)
      };
    });
    res.json(productsWithLengths);
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
    const [rows] = await db_default.query("SELECT o.*, d.name as delivery_zone_name FROM orders o LEFT JOIN delivery_zones d ON o.delivery_zone_id = d.id ORDER BY o.created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.put("/orders/:id/status", authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    await db_default.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Order status updated" });
  } catch (error) {
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
    for (const [key, value] of Object.entries(settings)) {
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
  const { image_url, caption } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: "Image URL is required" });
  }
  try {
    const [result] = await db_default.query(
      "INSERT INTO client_photos (image_url, caption) VALUES (?, ?)",
      [image_url, caption || ""]
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
var admin_default = router2;

// server/routes/checkout.ts
import { Router as Router3 } from "express";
import Stripe from "stripe";
import nodemailer from "nodemailer";
var router3 = Router3();
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-12-18.acacia"
});
var transporter = nodemailer.createTransport({
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
    const { items, deliveryZoneId } = req.body;
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
    const subtotal = items.reduce((acc, item) => {
      const price = parseFloat(item.price.replace("\xA3", "").replace("$", ""));
      return acc + price * item.quantity;
    }, 0);
    const deliveryFee = parseFloat(deliveryZone.price);
    const total = subtotal + deliveryFee;
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
router3.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
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
      const [orderRows] = await db_default.query("SELECT id FROM orders WHERE stripe_session_id = ?", [sessionId]);
      if (orderRows.length > 0) {
        const orderId = orderRows[0].id;
        const [items] = await db_default.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId]);
        for (const item of items) {
          const pId = item.product_id;
          if (pId.includes("-")) {
            const [prodId, lengthId] = pId.split("-");
            await db_default.query("UPDATE product_lengths SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, lengthId]);
          } else {
            await db_default.query("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, pId]);
          }
        }
      }
      if (customerEmail && process.env.SMTP_USER) {
        await transporter.sendMail({
          from: `"Asantey Salon" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: "Order Confirmation - Asantey Luxury Salon",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2D2D2D;">Thank you for your order!</h1>
                <p>Hi ${customerName},</p>
                <p>We've received your order and payment. We'll notify you once it ships.</p>
                <p><strong>Order Total:</strong> \xA3${(session.amount_total / 100).toFixed(2)}</p>
                <br/>
                <p>Best regards,<br/>Asantey Luxury Salon Team</p>
            </div>
          `
        });
      }
    } catch (dbErr) {
      console.error("Error processing successful checkout in DB:", dbErr);
    }
  }
  res.json({ received: true });
});
var checkout_default = router3;

// server/index.ts
dotenv2.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
async function startServer() {
  const app = express();
  const server = createServer(app);
  await initDb();
  app.use(cors());
  app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api/checkout", checkout_default);
  app.use("/api", public_default);
  app.use("/api/admin", admin_default);
  const staticPath = process.env.NODE_ENV === "production" ? path2.resolve(__dirname2, "public") : path2.resolve(__dirname2, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path2.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
