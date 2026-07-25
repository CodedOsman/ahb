"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
var promise_1 = __importDefault(require("mysql2/promise"));
var dotenv_1 = __importDefault(require("dotenv"));
var logger_1 = require("./utils/logger");
dotenv_1.default.config();
var pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asantey_salon',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.default = pool;
/**
 * Initialize database with schema
 */
function initDb() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, packetErr_1, alterErr_1, alterErr_2, alterErr_3, alterErr_4, alterErr_5, alterErr_6, settingsRows, productsWithoutSlugs, _i, productsWithoutSlugs_1, product, baseSlug, slug, counter, success, err_1, servicesWithoutSlugs, _a, servicesWithoutSlugs_1, service, baseSlug, slug, counter, success, err_2, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 51, , 52]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    connection = _b.sent();
                    console.log('Successfully connected to the database.');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, connection.query('SET GLOBAL max_allowed_packet = 104857600')];
                case 3:
                    _b.sent();
                    console.log('MySQL max_allowed_packet successfully increased to 100MB.');
                    return [3 /*break*/, 5];
                case 4:
                    packetErr_1 = _b.sent();
                    console.log('Could not set GLOBAL max_allowed_packet:', packetErr_1.message);
                    return [3 /*break*/, 5];
                case 5: 
                // Create client_photos table if it doesn't exist
                return [4 /*yield*/, connection.query("\n      CREATE TABLE IF NOT EXISTS client_photos (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          image_url MEDIUMTEXT NOT NULL,\n          caption VARCHAR(255),\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      )\n    ")];
                case 6:
                    // Create client_photos table if it doesn't exist
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, connection.query('ALTER TABLE client_photos MODIFY COLUMN image_url MEDIUMTEXT NOT NULL')];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    alterErr_1 = _b.sent();
                    console.log('client_photos table column upgrade skipped or already updated');
                    return [3 /*break*/, 10];
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, connection.query('ALTER TABLE products MODIFY COLUMN image_url MEDIUMTEXT NULL')];
                case 11:
                    _b.sent();
                    console.log('products table image_url column upgraded to MEDIUMTEXT');
                    return [3 /*break*/, 13];
                case 12:
                    alterErr_2 = _b.sent();
                    console.log('products table column upgrade skipped or already updated');
                    return [3 /*break*/, 13];
                case 13:
                    _b.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, connection.query('ALTER TABLE services MODIFY COLUMN image_url MEDIUMTEXT NULL')];
                case 14:
                    _b.sent();
                    console.log('services table image_url column upgraded to MEDIUMTEXT');
                    return [3 /*break*/, 16];
                case 15:
                    alterErr_3 = _b.sent();
                    console.log('services table column upgrade skipped or already updated');
                    return [3 /*break*/, 16];
                case 16:
                    _b.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, connection.query('ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE NULL AFTER name')];
                case 17:
                    _b.sent();
                    console.log('products table slug column added');
                    return [3 /*break*/, 19];
                case 18:
                    alterErr_4 = _b.sent();
                    if (alterErr_4.code !== 'ER_DUP_FIELDNAME') {
                        console.log('products table slug column upgrade skipped or already updated', alterErr_4.message);
                    }
                    return [3 /*break*/, 19];
                case 19:
                    _b.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, connection.query('ALTER TABLE services ADD COLUMN slug VARCHAR(255) UNIQUE NULL AFTER title')];
                case 20:
                    _b.sent();
                    console.log('services table slug column added');
                    return [3 /*break*/, 22];
                case 21:
                    alterErr_5 = _b.sent();
                    if (alterErr_5.code !== 'ER_DUP_FIELDNAME') {
                        console.log('services table slug column upgrade skipped or already updated', alterErr_5.message);
                    }
                    return [3 /*break*/, 22];
                case 22:
                    _b.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, connection.query('ALTER TABLE product_variants ADD COLUMN texture VARCHAR(100) NULL DEFAULT ""')];
                case 23:
                    _b.sent();
                    console.log('product_variants table texture column added');
                    return [3 /*break*/, 25];
                case 24:
                    alterErr_6 = _b.sent();
                    if (alterErr_6.code !== 'ER_DUP_FIELDNAME') {
                        console.log('product_variants table texture column upgrade skipped or already updated');
                    }
                    return [3 /*break*/, 25];
                case 25: 
                // Create hero_slides table if it doesn't exist
                return [4 /*yield*/, connection.query("\n      CREATE TABLE IF NOT EXISTS hero_slides (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          image_url MEDIUMTEXT NOT NULL,\n          headline VARCHAR(255),\n          subtitle TEXT,\n          button_1_text VARCHAR(100),\n          button_1_link VARCHAR(255),\n          button_2_text VARCHAR(100),\n          button_2_link VARCHAR(255),\n          is_active BOOLEAN DEFAULT 1,\n          display_order INT DEFAULT 0,\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      )\n    ")];
                case 26:
                    // Create hero_slides table if it doesn't exist
                    _b.sent();
                    // Create site_settings table if it doesn't exist
                    return [4 /*yield*/, connection.query("\n      CREATE TABLE IF NOT EXISTS site_settings (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          `key` VARCHAR(255) NOT NULL UNIQUE,\n          `value` MEDIUMTEXT,\n          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n      )\n    ")];
                case 27:
                    // Create site_settings table if it doesn't exist
                    _b.sent();
                    // Create promo_codes table
                    return [4 /*yield*/, connection.query("\n      CREATE TABLE IF NOT EXISTS promo_codes (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          code VARCHAR(50) NOT NULL UNIQUE,\n          discount_percentage INT NOT NULL,\n          is_active BOOLEAN DEFAULT TRUE,\n          valid_until TIMESTAMP NULL,\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      )\n    ")];
                case 28:
                    // Create promo_codes table
                    _b.sent();
                    // Create promotions table
                    return [4 /*yield*/, connection.query("\n      CREATE TABLE IF NOT EXISTS promotions (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          title VARCHAR(255),\n          message TEXT NOT NULL,\n          end_time TIMESTAMP NULL,\n          is_active BOOLEAN DEFAULT TRUE,\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      )\n    ")];
                case 29:
                    // Create promotions table
                    _b.sent();
                    return [4 /*yield*/, connection.query('SELECT COUNT(*) as count FROM site_settings')];
                case 30:
                    settingsRows = (_b.sent())[0];
                    if (!(settingsRows[0].count === 0)) return [3 /*break*/, 32];
                    return [4 /*yield*/, connection.query("\n        INSERT INTO site_settings (`key`, `value`) VALUES \n        ('contact_email', 'hello@asantey.com'),\n        ('contact_phone', '+1 (234) 567-890'),\n        ('contact_address', '123 Luxury Lane, Fashion District, NY'),\n        ('social_instagram', 'https://instagram.com/asantey'),\n        ('social_facebook', 'https://facebook.com/asantey'),\n        ('social_twitter', 'https://twitter.com/asantey'),\n        ('footer_description', 'Luxury hair and braiding services for the modern woman.')\n      ")];
                case 31:
                    _b.sent();
                    console.log('Seeded default site settings.');
                    _b.label = 32;
                case 32: return [4 /*yield*/, connection.query('SELECT id, name FROM products WHERE slug IS NULL')];
                case 33:
                    productsWithoutSlugs = (_b.sent())[0];
                    _i = 0, productsWithoutSlugs_1 = productsWithoutSlugs;
                    _b.label = 34;
                case 34:
                    if (!(_i < productsWithoutSlugs_1.length)) return [3 /*break*/, 41];
                    product = productsWithoutSlugs_1[_i];
                    baseSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    slug = baseSlug;
                    counter = 1;
                    success = false;
                    _b.label = 35;
                case 35:
                    if (!!success) return [3 /*break*/, 40];
                    _b.label = 36;
                case 36:
                    _b.trys.push([36, 38, , 39]);
                    return [4 /*yield*/, connection.query('UPDATE products SET slug = ? WHERE id = ?', [slug, product.id])];
                case 37:
                    _b.sent();
                    success = true;
                    return [3 /*break*/, 39];
                case 38:
                    err_1 = _b.sent();
                    if (err_1.code === 'ER_DUP_ENTRY') {
                        slug = "".concat(baseSlug, "-").concat(counter);
                        counter++;
                    }
                    else {
                        throw err_1;
                    }
                    return [3 /*break*/, 39];
                case 39: return [3 /*break*/, 35];
                case 40:
                    _i++;
                    return [3 /*break*/, 34];
                case 41: return [4 /*yield*/, connection.query('SELECT id, title FROM services WHERE slug IS NULL')];
                case 42:
                    servicesWithoutSlugs = (_b.sent())[0];
                    _a = 0, servicesWithoutSlugs_1 = servicesWithoutSlugs;
                    _b.label = 43;
                case 43:
                    if (!(_a < servicesWithoutSlugs_1.length)) return [3 /*break*/, 50];
                    service = servicesWithoutSlugs_1[_a];
                    baseSlug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    slug = baseSlug;
                    counter = 1;
                    success = false;
                    _b.label = 44;
                case 44:
                    if (!!success) return [3 /*break*/, 49];
                    _b.label = 45;
                case 45:
                    _b.trys.push([45, 47, , 48]);
                    return [4 /*yield*/, connection.query('UPDATE services SET slug = ? WHERE id = ?', [slug, service.id])];
                case 46:
                    _b.sent();
                    success = true;
                    return [3 /*break*/, 48];
                case 47:
                    err_2 = _b.sent();
                    if (err_2.code === 'ER_DUP_ENTRY') {
                        slug = "".concat(baseSlug, "-").concat(counter);
                        counter++;
                    }
                    else {
                        throw err_2;
                    }
                    return [3 /*break*/, 48];
                case 48: return [3 /*break*/, 44];
                case 49:
                    _a++;
                    return [3 /*break*/, 43];
                case 50:
                    console.log('Database tables verified/initialized.');
                    connection.release();
                    return [3 /*break*/, 52];
                case 51:
                    error_1 = _b.sent();
                    (0, logger_1.logError)('DATABASE_INITIALIZATION', error_1);
                    console.error('Error connecting to/initializing the database:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 52];
                case 52: return [2 /*return*/];
            }
        });
    });
}
