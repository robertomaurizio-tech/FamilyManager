'use client';

import * as React from 'react';
import { addCategoria, updateCategoria, deleteCategoria } from '@/lib/actions';
import { Plus, Trash2, Edit2, Check, X, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CategoriesManager({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = React.useState(initialCategories);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState({ nome: '', colore: '#3b82f6' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    if (editingId) {
      await updateCategoria(editingId, formData.nome, formData.colore);
    } else {
      await addCategoria(formData.nome, formData.colore);
    }

    window.location.reload();
  };

  const startEdit = (cat: any) => {
    setFormData({ nome: cat.nome, colore: cat.colore });
    setEditingId(cat.id);
    setIsAdding(true);
  };

  const cancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ nome: '', colore: '#3b82f6' });
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Categorie Spese</h1>
          <p className="text-zinc-500 mt-2">Personalizza le categorie per le tue uscite.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={24} />
          <span className="font-bold hidden sm:inline">{editingId ? 'Modifica Categoria' : 'Nuova Categoria'}</span>
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome Categoria</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="Esempio: Ristorante, Auto, Regali..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Colore Identificativo</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={formData.colore}
                      onChange={e => setFormData({...formData, colore: e.target.value})}
                      className="w-16 h-12 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer"
                    />
                    <div className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl font-mono text-sm">
                      {formData.colore.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={cancel}
                  className="px-6 py-3 text-zinc-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingId ? 'Aggiorna' : 'Salva'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-2xl shadow-inner"
                style={{ backgroundColor: cat.colore }}
              />
              <span className="font-bold text-indigo-600">{cat.nome}</span>
            </div>
            <div className="flex gap-1 transition-opacity">
              <button 
                onClick={() => startEdit(cat)}
                className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-50 rounded-xl transition-all"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Eliminare questa categoria?')) {
                    await deleteCategoria(cat.id);
                    window.location.reload();
                  }
                }}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
