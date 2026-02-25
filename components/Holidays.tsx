'use client';

import * as React from 'react';
import { addVacanza, updateVacanza, toggleVacanzaAttiva, deleteVacanza } from '@/lib/actions';
import { Palmtree, Plus, Trash2, Calendar, MapPin, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn, formatCurrency } from '@/lib/utils';

export default function HolidaysPage({ vacanze }: { vacanze: any[] }) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState({
    nome: '',
    data_inizio: new Date().toISOString().split('T')[0],
    data_fine: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    
    if (editingId) {
      await updateVacanza(editingId, formData.nome, formData.data_inizio, formData.data_fine);
    } else {
      await addVacanza(formData.nome, formData.data_inizio, formData.data_fine);
    }

    setFormData({
      nome: '',
      data_inizio: new Date().toISOString().split('T')[0],
      data_fine: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (v: any) => {
    setFormData({
      nome: v.nome,
      data_inizio: v.data_inizio,
      data_fine: v.data_fine || ''
    });
    setEditingId(v.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Vacanze</h1>
          <p className="text-zinc-500 mt-2">Organizza i tuoi viaggi e monitora le spese dedicate.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) setEditingId(null);
          }}
          className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={24} />
          <span className="font-bold hidden sm:inline">{editingId ? 'Modifica Vacanza' : 'Nuova Vacanza'}</span>
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
            <form onSubmit={handleSubmit} className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase ml-1">Nome Vacanza</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Esempio: Estate 2024 - Sardegna"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase ml-1">Data Inizio</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="date"
                      required
                      value={formData.data_inizio}
                      onChange={e => setFormData({...formData, data_inizio: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase ml-1">Data Fine (Opzionale)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="date"
                      value={formData.data_fine}
                      onChange={e => setFormData({...formData, data_fine: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-3 text-emerald-700 font-bold hover:text-emerald-900 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  {editingId ? 'Salva Modifiche' : 'Crea Vacanza'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vacanze.map((v) => (
          <div key={v.id} className={cn(
            "group relative bg-white p-8 rounded-[2rem] border transition-all overflow-hidden",
            v.attiva ? "border-emerald-200 shadow-lg shadow-emerald-50" : "border-zinc-100 opacity-70"
          )}>
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-3 rounded-2xl",
                v.attiva ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400"
              )}>
                <Palmtree size={32} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(v)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    v.attiva ? "text-emerald-600 hover:bg-emerald-50" : "text-zinc-400 hover:bg-zinc-50"
                  )}
                  title="Modifica"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => toggleVacanzaAttiva(v.id, !v.attiva)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    v.attiva ? "text-emerald-600 hover:bg-emerald-50" : "text-zinc-400 hover:bg-zinc-50"
                  )}
                  title={v.attiva ? "Segna come conclusa" : "Riapri vacanza"}
                >
                  {v.attiva ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                </button>
                <button 
                  onClick={() => deleteVacanza(v.id)}
                  className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-bold font-display text-zinc-900">{v.nome}</h3>
            <p className="text-emerald-600 font-bold mt-1">
              Totale speso: {formatCurrency(v.totaleSpeso)}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{formatDate(v.data_inizio)}</span>
              </div>
              {v.data_fine && (
                <>
                  <span>→</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{formatDate(v.data_fine)}</span>
                  </div>
                </>
              )}
            </div>

            {v.attiva === 1 && (
              <div className="absolute top-0 right-0 mt-8 mr-[-2rem] rotate-45 bg-emerald-500 text-white px-10 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                Attiva
              </div>
            )}
          </div>
        ))}
      </div>

      {vacanze.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <Palmtree size={48} className="mx-auto text-zinc-200 mb-4" />
          <p className="text-zinc-400 font-medium">Nessuna vacanza pianificata. Dove vorresti andare?</p>
        </div>
      )}
    </div>
  );
}
