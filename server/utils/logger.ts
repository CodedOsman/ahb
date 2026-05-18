import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE_PATH = path.resolve(__dirname, '..', '..', 'server-errors.log');

export function logError(context: string, error: any) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';

  const logEntry = `[${timestamp}] [CONTEXT: ${context}]\nERROR: ${errorMessage}\nSTACK: ${errorStack}\n----------------------------------------\n`;

  console.error(`[ERROR LOGGED] ${context}:`, errorMessage);

  try {
    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf-8');
  } catch (fsErr) {
    console.error('Failed to write to error log file:', fsErr);
  }
}
