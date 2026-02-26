'use client';

import * as React from 'react';
import { addArticolo, deleteArticolo, moveArticolo } from '@/lib/actions';
import { ShoppingCart, Plus, Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ShoppingList({ 
  listaSpesa, 
  storicoSpesa 
}: { 
  listaSpesa: any[], 
  storicoSpesa: { articolo: string }[] 
}) {
  const [input, setInput] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);

  const handleAdd = async (e?: React.FormEvent, value?: string) => {
    e?.preventDefault();
    const finalValue = value || input;
    if (!finalValue.trim()) return;
    setIsPending(true);
    await addArticolo(finalValue);
    setInput('');
    setIsPending(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Lista Spesa</h1>
          <p className="text-zinc-500 mt-2">Cosa dobbiamo comprare oggi?</p>
        </div>
        <div className="p-4 bg-zinc-100 rounded-2xl">
          <ShoppingCart className="text-zinc-600" size={32} />
        </div>
      </header>

      <div className="space-y-4">
        {storicoSpesa.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Più acquistati</p>
            <div className="flex flex-wrap gap-2">
              {storicoSpesa.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAdd(undefined, s.articolo)}
                  className="px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={12} />
                  {s.articolo}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Aggiungi un articolo..."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Aggiungi</span>
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {listaSpesa.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="group bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition-all"
            >
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => moveArticolo(item.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-zinc-300 hover:text-indigo-600 disabled:opacity-0 transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveArticolo(item.id, 'down')}
                  disabled={index === listaSpesa.length - 1}
                  className="p-1 text-zinc-300 hover:text-indigo-600 disabled:opacity-0 transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <span className="font-bold text-lg text-indigo-600">{item.articolo}</span>
              </div>

              <button
                onClick={() => deleteArticolo(item.id)}
                className="p-3 bg-zinc-50 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                title="Segna come comprato"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {listaSpesa.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <ShoppingCart size={48} className="mx-auto text-zinc-200 mb-4" />
          <p className="text-zinc-400 font-medium">La lista è vuota. Inizia ad aggiungere qualcosa!</p>
        </div>
      )}
    </div>
  );
}
