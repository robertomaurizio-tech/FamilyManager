import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'family_manager.db');
const db = new Database(dbPath);

// Initialize tables based on the provided schema
db.exec(`
  CREATE TABLE IF NOT EXISTS lavori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lavoro TEXT NOT NULL,
    fatto INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS lista_spesa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    articolo TEXT NOT NULL,
    ordine INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS storico_spesa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    articolo TEXT NOT NULL UNIQUE,
    conteggio INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS categorie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    colore TEXT NOT NULL DEFAULT '#000000'
  );

  CREATE TABLE IF NOT EXISTS spese (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    categoria TEXT NOT NULL,
    importo INTEGER NOT NULL,
    note TEXT NOT NULL,
    id_vacanza INTEGER NOT NULL DEFAULT 0,
    extra INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS vacanze (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    attiva INTEGER NOT NULL DEFAULT 1,
    data_inizio TEXT NOT NULL,
    data_fine TEXT
  );

  CREATE TABLE IF NOT EXISTS spese_sandro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    descrizione TEXT NOT NULL,
    importo REAL NOT NULL,
    pagato INTEGER NOT NULL DEFAULT 0,
    data_pagamento TEXT
  );
`);

// Migration: Add ordine column to lista_spesa if it doesn't exist
try {
  db.prepare("ALTER TABLE lista_spesa ADD COLUMN ordine INTEGER DEFAULT 0").run();
} catch (e) {
  // Column already exists or other error
}

// Ensure all items have a unique order if they are currently duplicate or zero
const duplicates = db.prepare("SELECT ordine, COUNT(*) as count FROM lista_spesa GROUP BY ordine HAVING count > 1").all();
if (duplicates.length > 0) {
  db.prepare("UPDATE lista_spesa SET ordine = id").run();
}

// Migration: Add conteggio column to storico_spesa if it doesn't exist
try {
  db.prepare("ALTER TABLE storico_spesa ADD COLUMN conteggio INTEGER DEFAULT 1").run();
} catch (e) {}

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
