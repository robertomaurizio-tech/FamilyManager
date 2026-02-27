import fs from 'fs/promises';
import path from 'path';

export async function appendToLog(message: string) {
  try {
    const logFilePath = path.join(process.cwd(), 'log.txt');
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    await fs.appendFile(logFilePath, logMessage);
  } catch (error) {
    // In a real app, you'd want more robust error handling
    console.error('Failed to write to log file:', error);
  }
}
