'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
  return db.prepare('SELECT articolo FROM storico_spesa ORDER BY articolo ASC').all() as { articolo: string }[];
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
    // Add to history when "bought" (deleted from active list)
    db.prepare('INSERT OR IGNORE INTO storico_spesa (articolo) VALUES (?)').run(item.articolo);
  }
  db.prepare('DELETE FROM lista_spesa WHERE id = ?').run(id);
  revalidatePath('/shopping-list');
}

// --- SPESE ---
export async function getSpese(idVacanza: number = 0, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  if (idVacanza > 0) {
    const items = db.prepare('SELECT * FROM spese WHERE id_vacanza = ? ORDER BY data DESC LIMIT ? OFFSET ?').all(idVacanza, limit, offset) as any[];
    const total = db.prepare('SELECT COUNT(*) as count FROM spese WHERE id_vacanza = ?').get(idVacanza) as { count: number };
    return { items, total: total.count };
  }
  const items = db.prepare('SELECT * FROM spese ORDER BY data DESC LIMIT ? OFFSET ?').all(limit, offset) as any[];
  const total = db.prepare('SELECT COUNT(*) as count FROM spese').get() as { count: number };
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

export async function getActiveVacanza() {
  return db.prepare('SELECT * FROM vacanze WHERE attiva = 1 ORDER BY data_inizio DESC LIMIT 1').get() as any;
}

export async function addVacanza(nome: string, dataInizio: string, dataFine?: string) {
  db.prepare('INSERT INTO vacanze (nome, attiva, data_inizio, data_fine) VALUES (?, 1, ?, ?)')
    .run(nome, dataInizio, dataFine || null);
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

export async function deleteSpesaSandro(id: number) {
  db.prepare('DELETE FROM spese_sandro WHERE id = ?').run(id);
  revalidatePath('/sandro');
}
