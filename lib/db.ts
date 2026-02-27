import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'family_manager.db');
const db = new Database(dbPath);

// Function to apply migrations
const applyMigrations = () => {
  const fs = require('fs');
  const migrationsDir = path.join(process.cwd(), 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('Nessuna cartella migrations trovata, salto le migrazioni.');
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
  const stmt = db.prepare("INSERT INTO categorie (nome, colore) VALUES (?, ?)");
  defaults.forEach(d => stmt.run(d[0], d[1]));
}

export default db;
