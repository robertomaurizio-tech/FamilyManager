'use client';

import * as React from 'react';
import { addSpesa, deleteSpesa, updateSpesa } from '@/lib/actions';
import { Receipt, Plus, Trash2, Filter, Calendar, Tag, Euro, ChevronLeft, ChevronRight, Edit2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import Modal from '@/components/Modal';

export default function ExpensesPage({ 
  spese, 
  total, 
  vacanze, 
  activeVacanza,
  activeVacanzeList,
  categorie,
  currentPage,
  currentVacanzaId,
  currentSearch
}: { 
  spese: any[], 
  total: number, 
  vacanze: any[],
  activeVacanza: any,
  activeVacanzeList: any[],
  categorie: any[],
  currentPage: number,
  currentVacanzaId: number,
  currentSearch: string
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState(currentSearch);
  
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
    importo: '',
    categoria: categorie[0]?.nome || 'Alimentari',
    note: '',
    data: new Date().toISOString().split('T')[0],
    id_vacanza: activeVacanza ? activeVacanza.id.toString() : '0',
    extra: false
  });

  const totalPages = Math.ceil(total / 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const importoNum = parseFloat(formData.importo);
    if (isNaN(importoNum)) return;

    if (editingId) {
      await updateSpesa(
        editingId,
        formData.data,
        formData.categoria,
        importoNum,
        formData.note,
        parseInt(formData.id_vacanza),
        formData.extra
      );
    } else {
      await addSpesa(
        formData.data,
        formData.categoria,
        importoNum,
        formData.note,
        parseInt(formData.id_vacanza),
        formData.extra
      );
    }
    
    setFormData({
      importo: '',
      categoria: 'Alimentari',
      note: '',
      data: new Date().toISOString().split('T')[0],
      id_vacanza: activeVacanza ? activeVacanza.id.toString() : '0',
      extra: false
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (spesa: any) => {
    // Extract yyyy-MM-dd from date string (which might be yyyy-MM-dd HH:mm:ss)
    const formattedDate = spesa.data.split(' ')[0];
    
    setFormData({
      importo: spesa.importo.toString(),
      categoria: spesa.categoria,
      note: spesa.note,
      data: formattedDate,
      id_vacanza: spesa.id_vacanza.toString(),
      extra: spesa.extra === 1
    });
    setEditingId(spesa.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Elimina Spesa',
      message: 'Sei sicuro di voler eliminare questa spesa?',
      type: 'danger',
      onConfirm: () => deleteSpesa(id)
    });
  };

  const handlePageChange = (page: number) => {
    router.push(`/expenses?page=${page}&idVacanza=${currentVacanzaId}&q=${search}`);
  };

  const handleVacanzaFilter = (id: string) => {
    router.push(`/expenses?page=1&idVacanza=${id}&q=${search}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/expenses?page=1&idVacanza=${currentVacanzaId}&q=${search}`);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Spese</h1>
          <p className="text-zinc-500 mt-2">Monitora le uscite della tua famiglia.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) setEditingId(null);
          }}
          className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={24} />
          <span className="font-bold hidden sm:inline">{editingId ? 'Modifica Spesa' : 'Nuova Spesa'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
          <Filter size={20} className="text-zinc-400 flex-shrink-0" />
          <span className="text-sm font-bold text-zinc-500 uppercase flex-shrink-0">Filtra per Vacanza:</span>
          <select
            value={currentVacanzaId.toString()}
            onChange={e => handleVacanzaFilter(e.target.value)}
            className="flex-1 min-w-[120px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="0">Tutte le spese</option>
            {vacanze.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
          <Search size={20} className="text-zinc-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cerca per nota o categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button type="submit" className="hidden">Cerca</button>
        </form>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Importo (€)</label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.importo}
                      onChange={e => setFormData({...formData, importo: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <select
                      value={formData.categoria}
                      onChange={e => setFormData({...formData, categoria: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {categorie.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="date"
                      required
                      value={formData.data}
                      onChange={e => setFormData({...formData, data: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Note / Descrizione</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                    placeholder="Esempio: Spesa settimanale Conad"
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Associa a Vacanza</label>
                  <select
                    value={formData.id_vacanza}
                    onChange={e => setFormData({...formData, id_vacanza: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                  >
                    <option value="0">Nessuna</option>
                    {vacanze.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.extra}
                    onChange={e => setFormData({...formData, extra: e.target.checked})}
                    className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" 
                  />
                  <span className="text-sm font-medium text-zinc-700">Spesa Extra</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-3 text-zinc-500 font-bold hover:text-indigo-600 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingId ? 'Aggiorna Spesa' : 'Salva Spesa'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Vacanza</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Importo</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {spese.map((spesa) => (
                <tr key={spesa.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(spesa.data)}</td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: categorie.find(c => c.nome === spesa.categoria)?.colore || '#6b7280' }}
                    >
                      {spesa.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                    {spesa.note}
                    {spesa.extra === 1 && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Extra</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {vacanze.find(v => v.id === spesa.id_vacanza)?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-right">
                    {formatCurrency(spesa.importo)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(spesa)}
                        className="p-2 text-zinc-300 hover:text-indigo-600 transition-colors"
                        title="Modifica"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(spesa.id)}
                        className="p-2 text-zinc-300 hover:text-rose-600 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-zinc-100">
          {spese.map((spesa) => (
            <div key={spesa.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">{formatDate(spesa.data)}</p>
                  <p className="font-bold text-indigo-600">{spesa.note || spesa.categoria}</p>
                  <div className="flex flex-wrap gap-2">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: categorie.find(c => c.nome === spesa.categoria)?.colore || '#6b7280' }}
                    >
                      {spesa.categoria}
                    </span>
                    {spesa.extra === 1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Extra</span>}
                    {spesa.id_vacanza > 0 && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        {vacanze.find(v => v.id === spesa.id_vacanza)?.nome}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{formatCurrency(spesa.importo)}</p>
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      onClick={() => handleEdit(spesa)}
                      className="p-2 text-zinc-400 hover:text-indigo-600"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(spesa.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {spese.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            Nessuna spesa registrata.
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Pagina <span className="font-bold text-indigo-600">{currentPage}</span> di <span className="font-bold text-indigo-600">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

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
