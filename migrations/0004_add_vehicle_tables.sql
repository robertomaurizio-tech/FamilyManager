CREATE TABLE IF NOT EXISTS veicoli (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  targa TEXT,
  tipo TEXT -- auto, moto, etc.
);

CREATE TABLE IF NOT EXISTS manutenzioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_veicolo INTEGER NOT NULL,
  data TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  km INTEGER,
  costo REAL,
  FOREIGN KEY (id_veicolo) REFERENCES veicoli(id) ON DELETE CASCADE
);
