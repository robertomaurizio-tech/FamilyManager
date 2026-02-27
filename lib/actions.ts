'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';

interface CsvRow {
  id: string;
  data: string;
  categoria: string;
  importo: string;
  note: string;
  id_vacanza: string;
  extra: string;
  user?: string; // Ignored
  tipo?: string; // Ignored
}

// --- LAVORI ---
export async function getLavori() {
  return db.prepare('SELECT * FROM lavori ORDER BY id DESC').all() as any[];
}

export async function addLavoro(lavoro: string) {
  db.prepare('INSERT INTO lavori (lavoro, fatto) VALUES (?, 0)').run(lavoro);
  revalidatePath('/tasks');
}

export async function toggleLavoro(id: number, fatto: boolean) {
  db.prepare('UPDATE lavori SET fatto = ? WHERE id = ?').run(fatto ? 1 : 0, id);
  revalidatePath('/tasks');
}

export async function deleteLavoro(id: number) {
  db.prepare('DELETE FROM lavori WHERE id = ?').run(id);
  revalidatePath('/tasks');
}

// --- LISTA SPESA ---
export async function getListaSpesa() {
  return db.prepare('SELECT * FROM lista_spesa ORDER BY ordine ASC, id DESC').all() as any[];
}

export async function getStoricoSpesa() {
  return db.prepare(`
    SELECT articolo 
    FROM storico_spesa 
    WHERE articolo NOT IN (SELECT articolo FROM lista_spesa)
    ORDER BY conteggio DESC 
    LIMIT 10
  `).all() as { articolo: string }[];
}

export async function addArticolo(articolo: string) {
  const maxOrder = db.prepare('SELECT MAX(ordine) as maxOrder FROM lista_spesa').get() as { maxOrder: number | null };
  const nextOrder = (maxOrder?.maxOrder || 0) + 1;
  db.prepare('INSERT INTO lista_spesa (articolo, ordine) VALUES (?, ?)').run(articolo, nextOrder);
  revalidatePath('/shopping-list');
}

export async function moveArticolo(id: number, direction: 'up' | 'down') {
  const current = db.prepare('SELECT * FROM lista_spesa WHERE id = ?').get(id) as any;
  if (!current) return;

  const other = direction === 'up'
    ? db.prepare('SELECT * FROM lista_spesa WHERE ordine < ? ORDER BY ordine DESC LIMIT 1').get(current.ordine) as any
    : db.prepare('SELECT * FROM lista_spesa WHERE ordine > ? ORDER BY ordine ASC LIMIT 1').get(current.ordine) as any;

  if (other) {
    const tempOrder = current.ordine;
    db.prepare('UPDATE lista_spesa SET ordine = ? WHERE id = ?').run(other.ordine, current.id);
    db.prepare('UPDATE lista_spesa SET ordine = ? WHERE id = ?').run(tempOrder, other.id);
  }
  revalidatePath('/shopping-list');
}

export async function deleteArticolo(id: number) {
  const item = db.prepare('SELECT articolo FROM lista_spesa WHERE id = ?').get(id) as { articolo: string };
  if (item) {
    // Increment count in history when "bought"
    const existing = db.prepare('SELECT id FROM storico_spesa WHERE articolo = ?').get(item.articolo);
    if (existing) {
      db.prepare('UPDATE storico_spesa SET conteggio = conteggio + 1 WHERE articolo = ?').run(item.articolo);
    } else {
      db.prepare('INSERT INTO storico_spesa (articolo, conteggio) VALUES (?, 1)').run(item.articolo);
    }
  }
  db.prepare('DELETE FROM lista_spesa WHERE id = ?').run(id);
  revalidatePath('/shopping-list');
}

// --- SPESE ---
export async function getSpese(idVacanza: number = 0, page: number = 1, limit: number = 10, search: string = '') {
  const offset = (page - 1) * limit;
  const searchPattern = `%${search}%`;
  
  let query = 'SELECT * FROM spese WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as count FROM spese WHERE 1=1';
  const params: any[] = [];

  if (idVacanza > 0) {
    query += ' AND id_vacanza = ?';
    countQuery += ' AND id_vacanza = ?';
    params.push(idVacanza);
  }

  if (search) {
    query += ' AND (note LIKE ? OR categoria LIKE ?)';
    countQuery += ' AND (note LIKE ? OR categoria LIKE ?)';
    params.push(searchPattern, searchPattern);
  }

  query += ' ORDER BY data DESC LIMIT ? OFFSET ?';
  const items = db.prepare(query).all(...params, limit, offset) as any[];
  const total = db.prepare(countQuery).get(...params) as { count: number };
  
  return { items, total: total.count };
}

export async function addSpesa(data: string, categoria: string, importo: number, note: string, idVacanza: number = 0, extra: boolean = false) {
  db.prepare('INSERT INTO spese (data, categoria, importo, note, id_vacanza, extra) VALUES (?, ?, ?, ?, ?, ?)')
    .run(data, categoria, importo, note, idVacanza, extra ? 1 : 0);
  revalidatePath('/expenses');
  revalidatePath('/');
}

export async function updateSpesa(id: number, data: string, categoria: string, importo: number, note: string, idVacanza: number = 0, extra: boolean = false) {
  db.prepare('UPDATE spese SET data = ?, categoria = ?, importo = ?, note = ?, id_vacanza = ?, extra = ? WHERE id = ?')
    .run(data, categoria, importo, note, idVacanza, extra ? 1 : 0, id);
  revalidatePath('/expenses');
  revalidatePath('/');
}

export async function deleteSpesa(id: number) {
  db.prepare('DELETE FROM spese WHERE id = ?').run(id);
  revalidatePath('/expenses');
  revalidatePath('/');
}

// --- VACANZE ---
export async function getVacanze() {
  const vacanze = db.prepare('SELECT * FROM vacanze ORDER BY data_inizio DESC').all() as any[];
  return vacanze.map(v => {
    const total = db.prepare('SELECT SUM(importo) as total FROM spese WHERE id_vacanza = ?').get(v.id) as { total: number | null };
    return { ...v, totaleSpeso: total.total || 0 };
  });
}

export async function getActiveVacanze() {
  const vacanze = db.prepare('SELECT * FROM vacanze WHERE attiva = 1 ORDER BY data_inizio DESC').all() as any[];
  return vacanze.map(v => {
    const total = db.prepare('SELECT SUM(importo) as total FROM spese WHERE id_vacanza = ?').get(v.id) as { total: number | null };
    return { ...v, totaleSpeso: total.total || 0 };
  });
}

export async function getActiveVacanza() {
  return db.prepare('SELECT * FROM vacanze WHERE attiva = 1 ORDER BY data_inizio DESC LIMIT 1').get() as any;
}

export async function addVacanza(nome: string, dataInizio: string, dataFine?: string) {
  db.prepare('INSERT INTO vacanze (nome, attiva, data_inizio, data_fine) VALUES (?, 1, ?, ?)')
    .run(nome, dataInizio, dataFine || null);
  revalidatePath('/holidays');
}

export async function updateVacanza(id: number, nome: string, dataInizio: string, dataFine?: string) {
  db.prepare('UPDATE vacanze SET nome = ?, data_inizio = ?, data_fine = ? WHERE id = ?')
    .run(nome, dataInizio, dataFine || null, id);
  revalidatePath('/holidays');
}

export async function toggleVacanzaAttiva(id: number, attiva: boolean) {
  db.prepare('UPDATE vacanze SET attiva = ? WHERE id = ?').run(attiva ? 1 : 0, id);
  revalidatePath('/holidays');
}

export async function deleteVacanza(id: number) {
  db.prepare('DELETE FROM vacanze WHERE id = ?').run(id);
  revalidatePath('/holidays');
}

// --- SPESE SANDRO ---
export async function getSpeseSandro() {
  const items = db.prepare('SELECT * FROM spese_sandro ORDER BY data DESC').all() as any[];
  const total = db.prepare('SELECT SUM(importo) as total FROM spese_sandro WHERE pagato = 0').get() as { total: number | null };
  return { items, totalNonPagato: total.total || 0 };
}

export async function addSpesaSandro(data: string, descrizione: string, importo: number) {
  db.prepare('INSERT INTO spese_sandro (data, descrizione, importo) VALUES (?, ?, ?)')
    .run(data, descrizione, importo);
  revalidatePath('/sandro');
}

export async function paySpesaSandro(id: number) {
  const now = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE spese_sandro SET pagato = 1, data_pagamento = ? WHERE id = ?').run(now, id);
  revalidatePath('/sandro');
}

export async function payAllSpeseSandro() {
  const now = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE spese_sandro SET pagato = 1, data_pagamento = ? WHERE pagato = 0').run(now);
  revalidatePath('/sandro');
}

export async function getPagamentiSandro() {
  return db.prepare(`
    SELECT data_pagamento, SUM(importo) as totale 
    FROM spese_sandro 
    WHERE pagato = 1 
    GROUP BY data_pagamento 
    ORDER BY data_pagamento DESC
  `).all() as { data_pagamento: string, totale: number }[];
}

export async function deleteSpesaSandro(id: number) {
  db.prepare('DELETE FROM spese_sandro WHERE id = ?').run(id);
  revalidatePath('/sandro');
}

// Helper to ensure category exists
async function ensureCategoryExists(categoryName: string) {
  const existingCategory = db.prepare('SELECT id FROM categorie WHERE nome = ?').get(categoryName) as { id: number } | undefined;
  if (!existingCategory) {
    // Insert a default color if category doesn't exist
    db.prepare('INSERT INTO categorie (nome, colore) VALUES (?, ?)')
      .run(categoryName, '#6b7280'); // Default gray color
    revalidatePath('/categories');
    revalidatePath('/expenses');
  }
}

// Helper to ensure holiday exists and update dates
async function ensureHolidayExists(id: number, nome: string, dataSpesa: string) {
  const existingHoliday = db.prepare('SELECT data_inizio, data_fine FROM vacanze WHERE id = ?').get(id) as { data_inizio: string, data_fine: string } | undefined;
  
  if (existingHoliday) {
    let newStartDate = existingHoliday.data_inizio;
    let newEndDate = existingHoliday.data_fine;

    if (dataSpesa < newStartDate) {
      newStartDate = dataSpesa;
    }
    if (dataSpesa > newEndDate) {
      newEndDate = dataSpesa;
    }
    
    db.prepare('UPDATE vacanze SET data_inizio = ?, data_fine = ? WHERE id = ?')
      .run(newStartDate, newEndDate, id);
  } else {
    db.prepare('INSERT INTO vacanze (id, nome, attiva, data_inizio, data_fine) VALUES (?, ?, 1, ?, ?)')
      .run(id, nome, dataSpesa, dataSpesa);
  }
  revalidatePath('/holidays');
  revalidatePath('/expenses');
}

export async function uploadCsvData(vacanzeCsv: string, speseCsv: string) {
  try {
    // Import vacanze
    const vacanzeRecords = parse(vacanzeCsv, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      trim: true,
    }) as { id: string; nome: string; attiva: string }[];

    for (const record of vacanzeRecords) {
      const existing = db.prepare('SELECT id FROM vacanze WHERE id = ?').get(record.id);
      if (existing) {
        db.prepare('UPDATE vacanze SET nome = ?, attiva = ? WHERE id = ?').run(record.nome, parseInt(record.attiva), record.id);
      } else {
        db.prepare('INSERT INTO vacanze (id, nome, attiva) VALUES (?, ?, ?)').run(record.id, record.nome, parseInt(record.attiva));
      }
    }

    // Import spese
    const speseRecords = parse(speseCsv, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      trim: true,
    }) as CsvRow[];

    for (const record of speseRecords) {
      const importoNum = parseFloat(record.importo);
      if (isNaN(importoNum)) continue;

      await ensureCategoryExists(record.categoria);

      const idVacanza = record.id_vacanza && record.id_vacanza !== '0' ? parseInt(record.id_vacanza) : 0;
      const extra = record.extra === '1' || record.extra.toLowerCase() === 'true';

      const existingExpense = db.prepare('SELECT id FROM spese WHERE id = ?').get(parseInt(record.id));
      if (existingExpense) {
        db.prepare('UPDATE spese SET data = ?, categoria = ?, importo = ?, note = ?, id_vacanza = ?, extra = ? WHERE id = ?')
          .run(record.data, record.categoria, importoNum, record.note, idVacanza, extra ? 1 : 0, parseInt(record.id));
      } else {
        db.prepare('INSERT INTO spese (id, data, categoria, importo, note, id_vacanza, extra) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(parseInt(record.id), record.data, record.categoria, importoNum, record.note, idVacanza, extra ? 1 : 0);
      }
    }

    // Update holiday dates based on expenses
    const holidayDates = db.prepare(`
      SELECT id_vacanza, MIN(data) as min_data, MAX(data) as max_data
      FROM spese
      WHERE id_vacanza > 0
      GROUP BY id_vacanza
    `).all() as { id_vacanza: number; min_data: string; max_data: string }[];

    for (const holiday of holidayDates) {
      db.prepare('UPDATE vacanze SET data_inizio = ?, data_fine = ? WHERE id = ?')
        .run(holiday.min_data, holiday.max_data, holiday.id_vacanza);
    }

    revalidatePath('/expenses');
    revalidatePath('/holidays');
    revalidatePath('/');

    return { success: true, message: 'Dati importati con successo!' };
  } catch (error: any) {
    console.error('Errore durante l\'importazione CSV:', error);
    return { success: false, message: `Errore durante l\'importazione: ${error.message}` };
  }
}

// --- IMPOSTAZIONI ---
export async function deleteAllData() {
  try {
    db.prepare('DELETE FROM lavori').run();
    db.prepare('DELETE FROM lista_spesa').run();
    db.prepare('DELETE FROM storico_spesa').run();
    db.prepare('DELETE FROM spese').run();
    db.prepare('DELETE FROM vacanze').run();
    db.prepare('DELETE FROM spese_sandro').run();
    db.prepare('DELETE FROM categorie').run();

    revalidatePath('/');
    revalidatePath('/expenses');
    revalidatePath('/holidays');
    revalidatePath('/shopping-list');
    revalidatePath('/tasks');
    revalidatePath('/sandro');
    revalidatePath('/categories');

    return { success: true, message: 'Tutti i dati sono stati cancellati con successo!' };
  } catch (error: any) {
    console.error('Errore durante la cancellazione dei dati:', error);
    return { success: false, message: `Errore durante la cancellazione dei dati: ${error.message}` };
  }
}

// --- CATEGORIE ---
export async function getCategorie() {
  return db.prepare('SELECT * FROM categorie ORDER BY nome ASC').all() as any[];
}

export async function addCategoria(nome: string, colore: string) {
  db.prepare('INSERT INTO categorie (nome, colore) VALUES (?, ?)').run(nome, colore);
  revalidatePath('/categories');
  revalidatePath('/expenses');
}

export async function updateCategoria(id: number, nome: string, colore: string) {
  db.prepare('UPDATE categorie SET nome = ?, colore = ? WHERE id = ?').run(nome, colore, id);
  revalidatePath('/categories');
  revalidatePath('/expenses');
}

export async function deleteCategoria(id: number) {
  db.prepare('DELETE FROM categorie WHERE id = ?').run(id);
  revalidatePath('/categories');
  revalidatePath('/expenses');
}

export async function saveLoginSequence(sequence: string[]) {
  try {
    const sequenceJson = JSON.stringify(sequence);
    db.prepare(`
      INSERT INTO impostazioni (chiave, valore) VALUES ('login_sequence', ?)
      ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore
    `).run(sequenceJson);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to save login sequence:', error);
    return { success: false, message: 'Failed to save login sequence.' };
  }
}

export async function getLoginSequence() {
  try {
    const result = db.prepare('SELECT valore FROM impostazioni WHERE chiave = ?').get('login_sequence') as { valore: string } | undefined;
    if (result) {
      return JSON.parse(result.valore);
    }
    return ['Star', 'Heart', 'Sun', 'Moon']; // Default sequence
  } catch (error) {
    console.error('Failed to get login sequence:', error);
    return ['Star', 'Heart', 'Sun', 'Moon']; // Default on error
  }
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticateUser() {
  try {
    cookies().set('auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 86400, // 1 day
      partitioned: true,
    });
  } catch (error) {
    console.error('Failed to set auth cookie:', error);
    // Handle error appropriately
    return { success: false, message: 'Authentication failed.' };
  }

  redirect('/');
}

// --- DASHBOARD & ANALYTICS ---
export async function getDashboardChartData() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // Mesi da 1 a 12

  const monthsToFetch = [];
  for (let i = 0; i < 6; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    monthsToFetch.unshift(`${year}-${String(month).padStart(2, '0')}`);
  }

  const data = db.prepare(`
    SELECT 
      strftime('%Y-%m', data) as month,
      SUM(CASE WHEN extra = 0 AND id_vacanza = 0 THEN importo ELSE 0 END) as normali,
      SUM(CASE WHEN extra = 1 THEN importo ELSE 0 END) as extra,
      SUM(CASE WHEN id_vacanza > 0 AND extra = 0 THEN importo ELSE 0 END) as vacanza
    FROM spese
    WHERE month IN (${monthsToFetch.map(m => `'${m}'`).join(',')})
    GROUP BY month
    ORDER BY month ASC
  `).all() as any[];

  // Fill in missing months with zero values
  const fullData = monthsToFetch.map(month => {
    const existing = data.find(d => d.month === month);
    return existing || { month, normali: 0, extra: 0, vacanza: 0 };
  });
  
  return fullData;
}

export async function getCurrentMonthExpensesTotal() {
  const today = new Date();
  const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const result = db.prepare(`
    SELECT SUM(importo) as total
    FROM spese
    WHERE strftime('%Y-%m', data) = ?
  `).get(currentMonthYear) as { total: number | null };

  return result.total || 0;
}

export async function getMonthlyAverage() {
  const result = db.prepare(`
    SELECT AVG(monthly_total) as average
    FROM (
      SELECT SUM(importo) as monthly_total
      FROM spese
      GROUP BY strftime('%Y-%m', data)
    )
  `).get() as { average: number | null };
  
  return result.average || 0;
}

export async function getMonthlyExpensesDetail(month: string) {
  // month format: YYYY-MM
  const expenses = db.prepare(`
    SELECT s.*, v.nome as vacanza_nome
    FROM spese s
    LEFT JOIN vacanze v ON s.id_vacanza = v.id
    WHERE strftime('%Y-%m', s.data) = ?
    ORDER BY s.data DESC
  `).all(month) as any[];

  const byCategory = db.prepare(`
    SELECT categoria, SUM(importo) as totale
    FROM spese
    WHERE strftime('%Y-%m', data) = ?
    GROUP BY categoria
  `).all(month) as any[];

  const byVacanza = db.prepare(`
    SELECT v.nome, SUM(s.importo) as totale
    FROM spese s
    JOIN vacanze v ON s.id_vacanza = v.id
    WHERE strftime('%Y-%m', s.data) = ?
    GROUP BY v.nome
  `).all(month) as any[];

  const extraTotal = db.prepare(`
    SELECT SUM(importo) as totale
    FROM spese
    WHERE strftime('%Y-%m', data) = ? AND extra = 1
  `).get(month) as { totale: number | null };

  return {
    expenses,
    byCategory,
    byVacanza,
    extraTotal: extraTotal.totale || 0
  };
}
