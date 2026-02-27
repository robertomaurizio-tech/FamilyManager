import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'family_manager.db');
const db = new Database(dbPath);

// Function to apply migrations
const applyMigrations = () => {
  const fs = require('fs');
  const cwd = process.cwd();
  console.log(`[DB INIT] Current working directory: ${cwd}`);
  try {
    const filesInCwd = fs.readdirSync(cwd);
    console.log(`[DB INIT] Files in CWD: ${filesInCwd.join(', ')}`);
  } catch (e) {
    console.error(`[DB INIT] Could not read CWD:`, e);
  }

  const migrationsDir = path.join(cwd, 'migrations');
  console.log(`[DB INIT] Looking for migrations in: ${migrationsDir}`);

  if (!fs.existsSync(migrationsDir)) {
    console.log('[DB INIT] Nessuna cartella migrations trovata, salto le migrazioni.');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter((file: string) => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    try {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      db.exec(sql);
      console.log(`Migrazione ${file} applicata con successo.`);
    } catch (error) {
      console.error(`Errore durante l'applicazione della migrazione ${file}:`, error);
    }
  }
};

applyMigrations();

// Seed default categories if empty
const catCount = db.prepare("SELECT COUNT(*) as count FROM categorie").get() as { count: number };
if (catCount.count === 0) {
  const defaults = [
    ['Alimentari', '#10b981'],
    ['Casa', '#3b82f6'],
    ['Bollette', '#ef4444'],
    ['Trasporti', '#f59e0b'],
    ['Salute', '#ec4899'],
    ['Svago', '#8b5cf6'],
    ['Altro', '#6b7280']
  ];
  const stmt = db.prepare("INSERT OR IGNORE INTO categorie (nome, colore) VALUES (?, ?)");
  defaults.forEach(d => stmt.run(d[0], d[1]));
}

export default db;
