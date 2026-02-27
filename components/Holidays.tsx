'use client';

import * as React from 'react';
import { addVacanza, updateVacanza, toggleVacanzaAttiva, deleteVacanza, getHolidayStats } from '@/lib/actions';
import { Palmtree, Plus, Trash2, Calendar, MapPin, CheckCircle2, XCircle, Edit2, BarChart2, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn, formatCurrency } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function HolidaysPage({ vacanze }: { vacanze: any[] }) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [statsHoliday, setStatsHoliday] = React.useState<any | null>(null);
  const [holidayStats, setHolidayStats] = React.useState<any[]>([]);
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);
  
  const [modalConfig, setModalConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: 'info' | 'success' | 'warning' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

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
      data_inizio: v.data_inizio.split(' ')[0],
      data_fine: v.data_fine ? v.data_fine.split(' ')[0] : ''
    });
    setEditingId(v.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStats = async (v: any) => {
    setStatsHoliday(v);
    setIsStatsLoading(true);
    try {
      const stats = await getHolidayStats(v.id);
      setHolidayStats(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Elimina Vacanza',
      message: 'Sei sicuro di voler eliminare questa vacanza? Tutte le spese associate rimarranno ma non saranno più collegate.',
      type: 'danger',
      onConfirm: () => deleteVacanza(id)
    });
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

      <div className="space-y-6">
        {vacanze.map((v) => (
          <div key={v.id} className={cn(
            "group relative bg-white p-8 rounded-[2.5rem] border transition-all overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6",
            v.attiva ? "border-emerald-200 shadow-lg shadow-emerald-50" : "border-zinc-100 opacity-70"
          )}>
            <div className="flex items-center gap-6 flex-1">
              <div className={cn(
                "p-4 rounded-3xl",
                v.attiva ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400"
              )}>
                <Palmtree size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-display text-indigo-600">{v.nome}</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
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
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Totale Speso</p>
                <p className="text-2xl font-bold text-emerald-600 font-display">
                  {formatCurrency(v.totaleSpeso)}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openStats(v)}
                  className={cn(
                    "p-3 rounded-2xl transition-colors",
                    v.attiva ? "text-indigo-600 hover:bg-indigo-50" : "text-zinc-400 hover:bg-zinc-50"
                  )}
                  title="Statistiche"
                >
                  <BarChart2 size={24} />
                </button>
                <button 
                  onClick={() => handleEdit(v)}
                  className={cn(
                    "p-3 rounded-2xl transition-colors",
                    v.attiva ? "text-emerald-600 hover:bg-emerald-50" : "text-zinc-400 hover:bg-zinc-50"
                  )}
                  title="Modifica"
                >
                  <Edit2 size={24} />
                </button>
                <button 
                  onClick={() => toggleVacanzaAttiva(v.id, !v.attiva)}
                  className={cn(
                    "p-3 rounded-2xl transition-colors",
                    v.attiva ? "text-emerald-600 hover:bg-emerald-50" : "text-zinc-400 hover:bg-zinc-50"
                  )}
                  title={v.attiva ? "Segna come conclusa" : "Riapri vacanza"}
                >
                  {v.attiva ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                </button>
                <button 
                  onClick={() => confirmDelete(v.id)}
                  className="p-3 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
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

      {/* Stats Modal */}
      <AnimatePresence>
        {statsHoliday && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatsHoliday(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <PieChart size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display">Statistiche Spese</h3>
                      <p className="text-zinc-500 text-sm">{statsHoliday.nome}</p>
                    </div>
                  </div>
                  <button onClick={() => setStatsHoliday(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                    <XCircle className="text-zinc-400" size={24} />
                  </button>
                </div>

                {isStatsLoading ? (
                  <div className="py-12 text-center text-zinc-400">Caricamento statistiche...</div>
                ) : (
                  <div className="space-y-4">
                    {holidayStats.map((stat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-zinc-600">{stat.categoria}</span>
                          <span className="text-indigo-600">{formatCurrency(stat.totale)}</span>
                        </div>
                        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.totale / statsHoliday.totaleSpeso) * 100}%` }}
                            className="h-full bg-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                    {holidayStats.length === 0 && (
                      <p className="text-center py-8 text-zinc-400 italic">Nessuna spesa registrata per questa vacanza.</p>
                    )}
                  </div>
                )}

                <div className="mt-10 pt-6 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Totale Complessivo</span>
                  <span className="text-3xl font-bold font-display text-emerald-600">{formatCurrency(statsHoliday.totaleSpeso)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
