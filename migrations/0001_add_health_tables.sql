CREATE TABLE IF NOT EXISTS persone (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  eta INTEGER,
  foto TEXT -- Base64 or URL
);

CREATE TABLE IF NOT EXISTS malattie (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_persona INTEGER NOT NULL,
  nome_malattia TEXT NOT NULL,
  data_inizio TEXT NOT NULL,
  data_fine TEXT,
  note_medico TEXT,
  FOREIGN KEY (id_persona) REFERENCES persone(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS farmaci_malattia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_malattia INTEGER NOT NULL,
  nome_farmaco TEXT NOT NULL,
  dosaggio TEXT,
  frequenza TEXT,
  durata TEXT,
  FOREIGN KEY (id_malattia) REFERENCES malattie(id) ON DELETE CASCADE
);
