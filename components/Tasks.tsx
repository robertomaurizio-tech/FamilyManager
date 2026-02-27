'use client';

import * as React from 'react';
import { addLavoro, toggleLavoro, deleteLavoro } from '@/lib/actions';
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function TasksPage({ lavori }: { lavori: any[] }) {
  const [input, setInput] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsPending(true);
    await addLavoro(input);
    setInput('');
    setIsPending(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">Lavori</h1>
          <p className="text-zinc-500 mt-1 sm:mt-2 text-sm sm:text-base">Cose da fare in casa e manutenzione.</p>
        </div>
        <div className="p-3 sm:p-4 bg-zinc-100 rounded-2xl w-fit">
          <CheckSquare className="text-zinc-600" size={24} />
        </div>
      </header>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nuovo lavoro da fare..."
          className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
        >
          <Plus size={20} />
          <span>Aggiungi</span>
        </button>
      </form>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {lavori.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className={cn(
                "group p-4 sm:p-5 rounded-3xl border transition-all flex items-center justify-between gap-3",
                item.fatto 
                  ? "bg-zinc-50 border-zinc-100 opacity-60" 
                  : "bg-white border-zinc-200 shadow-sm hover:border-zinc-400"
              )}
            >
              <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => toggleLavoro(item.id, !item.fatto)}>
                <div className={cn(
                  "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors",
                  item.fatto ? "bg-emerald-500 text-white" : "border-2 border-zinc-200 text-transparent"
                )}>
                  <CheckCircle2 size={16} />
                </div>
                <span className={cn(
                  "font-medium text-base sm:text-lg truncate",
                  item.fatto ? "line-through text-zinc-400" : "text-indigo-600"
                )}>
                  {item.lavoro}
                </span>
              </div>
              <button
                onClick={() => deleteLavoro(item.id)}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {lavori.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <CheckSquare size={48} className="mx-auto text-zinc-200 mb-4" />
          <p className="text-zinc-400 font-medium">Nessun lavoro in lista. Relax!</p>
        </div>
      )}
    </div>
  );
}
