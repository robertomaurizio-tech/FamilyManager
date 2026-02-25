'use client';

import * as React from 'react';
import { addSpesaSandro, paySpesaSandro, deleteSpesaSandro } from '@/lib/actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, Plus, Trash2, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SandroExpenses({ 
  initialItems, 
  initialTotal 
}: { 
  initialItems: any[], 
  initialTotal: number 
}) {
  const [items, setItems] = React.useState(initialItems);
  const [total, setTotal] = React.useState(initialTotal);
  const [isPending, setIsPending] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    data: new Date().toISOString().split('T')[0],
    descrizione: '',
    importo: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descrizione || !formData.importo) return;
    setIsPending(true);
    await addSpesaSandro(formData.data, formData.descrizione, parseFloat(formData.importo));
    // Refresh local state (or rely on revalidatePath if we were using server actions properly with transitions)
    // For simplicity in this demo, we'll just reload or expect the user to see the update on next load
    // but since we are using 'use client', let's just use window.location.reload() for now to keep it simple
    // or better, just clear form and let revalidatePath do its thing if the framework supports it well.
    window.location.reload();
  };

  const handlePay = async (id: number) => {
    await paySpesaSandro(id);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa spesa?')) {
      await deleteSpesaSandro(id);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Spese Sandro</h1>
          <p className="text-zinc-500 mt-2">Gestione spese per conto di Sandro</p>
        </div>
        <div className="p-4 bg-zinc-100 rounded-2xl">
          <User className="text-zinc-600" size={32} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} /> Nuova Spesa
            </h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="date"
                value={formData.data}
                onChange={e => setFormData({...formData, data: e.target.value})}
                className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
              <input
                type="text"
                placeholder="Descrizione"
                value={formData.descrizione}
                onChange={e => setFormData({...formData, descrizione: e.target.value})}
                className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Importo"
                  value={formData.importo}
                  onChange={e => setFormData({...formData, importo: e.target.value})}
                  className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50"
                >
                  <Plus size={24} />
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 px-2">
              <Clock size={20} /> Registro Spese
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.pagato ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {item.pagato ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{item.descrizione}</p>
                      <p className="text-xs text-zinc-500">{formatDate(item.data)} {item.pagato && `• Pagato il ${formatDate(item.data_pagamento)}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold ${item.pagato ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                      {formatCurrency(item.importo)}
                    </span>
                    <div className="flex gap-1">
                      {!item.pagato && (
                        <button
                          onClick={() => handlePay(item.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Segna come pagato"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center py-10 text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">Nessuna spesa registrata.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <Wallet className="mb-4 opacity-50" size={32} />
              <p className="text-zinc-400 font-medium uppercase tracking-wider text-xs">Totale da pagare</p>
              <h3 className="text-4xl font-mono font-bold mt-1">{formatCurrency(total)}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="font-bold mb-4">Riepilogo</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Spese totali</span>
                <span className="font-bold">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">In attesa</span>
                <span className="font-bold text-amber-600">{items.filter(i => !i.pagato).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Saldate</span>
                <span className="font-bold text-emerald-600">{items.filter(i => i.pagato).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
