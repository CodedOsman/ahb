"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = logError;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var LOG_FILE_PATH = path_1.default.resolve(__dirname, '..', '..', 'server-errors.log');
function logError(context, error) {
    var timestamp = new Date().toISOString();
    var errorMessage = error instanceof Error ? error.message : String(error);
    var errorStack = error instanceof Error ? error.stack : '';
    var logEntry = "[".concat(timestamp, "] [CONTEXT: ").concat(context, "]\nERROR: ").concat(errorMessage, "\nSTACK: ").concat(errorStack, "\n----------------------------------------\n");
    console.error("[ERROR LOGGED] ".concat(context, ":"), errorMessage);
    try {
        fs_1.default.appendFileSync(LOG_FILE_PATH, logEntry, 'utf-8');
    }
    catch (fsErr) {
        console.error('Failed to write to error log file:', fsErr);
    }
}
