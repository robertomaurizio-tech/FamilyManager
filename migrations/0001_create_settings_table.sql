CREATE TABLE IF NOT EXISTS impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT NOT NULL
);

INSERT INTO impostazioni (chiave, valore) VALUES ('login_sequence', '["Star","Heart","Sun","Moon"]') ON CONFLICT(chiave) DO NOTHING;
