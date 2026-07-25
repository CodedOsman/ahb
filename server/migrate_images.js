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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var db_1 = __importDefault(require("./db"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
var UPLOADS_DIR = process.env.PUBLIC_DIR
    ? path_1.default.join(process.env.PUBLIC_DIR, 'uploads')
    : path_1.default.join(__dirname, '../client/public/uploads'); // fallback for local dev
// Ensure directories exist
var ensureDir = function (dir) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
var tablesToMigrate = [
    { table: 'services', type: 'service' },
    { table: 'products', type: 'product' },
    { table: 'hero_slides', type: 'hero-slide' },
    { table: 'client_photos', type: 'client-photo' },
    { table: 'categories', type: 'category' }
];
function migrateImages() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, tablesToMigrate_1, _a, table, type, typeDir, rows, _b, rows_1, row, matches, extension, base64Data, buffer, filename, filePath, newUrl, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Starting image migration...');
                    console.log("Uploads directory: ".concat(UPLOADS_DIR));
                    ensureDir(UPLOADS_DIR);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 9, , 10]);
                    _i = 0, tablesToMigrate_1 = tablesToMigrate;
                    _c.label = 2;
                case 2:
                    if (!(_i < tablesToMigrate_1.length)) return [3 /*break*/, 8];
                    _a = tablesToMigrate_1[_i], table = _a.table, type = _a.type;
                    console.log("Processing table: ".concat(table));
                    typeDir = path_1.default.join(UPLOADS_DIR, type);
                    ensureDir(typeDir);
                    return [4 /*yield*/, db_1.default.query("SELECT id, image_url FROM ".concat(table, " WHERE image_url LIKE 'data:image/%'"))];
                case 3:
                    rows = (_c.sent())[0];
                    console.log("Found ".concat(rows.length, " images to migrate in ").concat(table));
                    _b = 0, rows_1 = rows;
                    _c.label = 4;
                case 4:
                    if (!(_b < rows_1.length)) return [3 /*break*/, 7];
                    row = rows_1[_b];
                    if (!row.image_url)
                        return [3 /*break*/, 6];
                    matches = row.image_url.match(/^data:image\/(.+);base64,(.+)$/);
                    if (!matches || matches.length !== 3) {
                        console.log("Skipping invalid base64 format for ID ".concat(row.id, " in ").concat(table));
                        return [3 /*break*/, 6];
                    }
                    extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                    base64Data = matches[2];
                    buffer = Buffer.from(base64Data, 'base64');
                    filename = "".concat(row.id, ".").concat(extension);
                    filePath = path_1.default.join(typeDir, filename);
                    // Save file
                    fs_1.default.writeFileSync(filePath, buffer);
                    console.log("Saved: ".concat(filePath));
                    newUrl = "/uploads/".concat(type, "/").concat(filename);
                    return [4 /*yield*/, db_1.default.query("UPDATE ".concat(table, " SET image_url = ? WHERE id = ?"), [newUrl, row.id])];
                case 5:
                    _c.sent();
                    console.log("Updated DB: ".concat(newUrl, " for ID ").concat(row.id));
                    _c.label = 6;
                case 6:
                    _b++;
                    return [3 /*break*/, 4];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log('Migration completed successfully.');
                    process.exit(0);
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _c.sent();
                    console.error('Migration failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
migrateImages();
