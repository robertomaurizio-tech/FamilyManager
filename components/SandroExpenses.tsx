'use client';

import * as React from 'react';
import { addSpesaSandro, paySpesaSandro, deleteSpesaSandro, payAllSpeseSandro } from '@/lib/actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, Plus, Trash2, CheckCircle2, Clock, Wallet, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Modal from '@/components/Modal';

export default function SandroExpenses({ 
  initialItems, 
  initialTotal,
  pagamenti
}: { 
  initialItems: any[], 
  initialTotal: number,
  pagamenti: { data_pagamento: string, totale: number }[]
}) {
  const [items, setItems] = React.useState(initialItems);
  const [total, setTotal] = React.useState(initialTotal);
  const [isPending, setIsPending] = React.useState(false);
  const [expandedPayment, setExpandedPayment] = React.useState<string | null>(null);
  
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
    data: new Date().toISOString().split('T')[0],
    descrizione: '',
    importo: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descrizione || !formData.importo) return;
    setIsPending(true);
    await addSpesaSandro(formData.data, formData.descrizione, parseFloat(formData.importo));
    window.location.reload();
  };

  const handlePay = async (id: number) => {
    await paySpesaSandro(id);
    window.location.reload();
  };

  const handlePayAll = async () => {
    setModalConfig({
      isOpen: true,
      title: 'Salda Tutto',
      message: 'Sei sicuro di voler segnare tutte le spese come pagate in data odierna?',
      type: 'warning',
      onConfirm: async () => {
        await payAllSpeseSandro();
        window.location.reload();
      }
    });
  };

  const handleDelete = async (id: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Elimina Spesa',
      message: 'Sei sicuro di voler eliminare questa spesa?',
      type: 'danger',
      onConfirm: async () => {
        await deleteSpesaSandro(id);
        window.location.reload();
      }
    });
  };

  const pendingItems = items.filter(i => !i.pagato);

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
            <form onSubmit={handleAdd} className="flex flex-col lg:flex-row gap-4">
              <input
                type="date"
                value={formData.data}
                onChange={e => setFormData({...formData, data: e.target.value})}
                className="w-full lg:w-40 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Descrizione"
                value={formData.descrizione}
                onChange={e => setFormData({...formData, descrizione: e.target.value})}
                className="flex-1 min-w-0 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                required
              />
              <div className="flex gap-2 w-full lg:w-auto">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Importo"
                  value={formData.importo}
                  onChange={e => setFormData({...formData, importo: e.target.value})}
                  className="w-full lg:w-32 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 bg-zinc-900 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  <Plus size={20} />
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock size={20} /> Spese in Sospeso
              </h2>
              {pendingItems.length > 0 && (
                <button
                  onClick={handlePayAll}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 size={16} />
                  Paga Tutto
                </button>
              )}
            </div>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-600">{item.descrizione}</p>
                      <p className="text-xs text-zinc-500">{formatDate(item.data)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-indigo-600">
                      {formatCurrency(item.importo)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePay(item.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Segna come pagato"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingItems.length === 0 && (
                <p className="text-center py-10 text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">Nessuna spesa in sospeso.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="text-lg font-bold flex items-center gap-2 px-2">
              <CreditCard size={20} /> Storico Pagamenti
            </h2>
            <div className="space-y-3">
              {pagamenti.map((p, idx) => {
                const isExpanded = expandedPayment === p.data_pagamento;
                const paymentExpenses = items.filter(item => item.data_pagamento === p.data_pagamento);
                
                return (
                  <div 
                    key={idx}
                    className="bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden"
                  >
                    <button 
                      onClick={() => setExpandedPayment(isExpanded ? null : p.data_pagamento)}
                      className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-indigo-600">Totale Pagato</p>
                          <p className="text-xs text-zinc-500">Data saldo: {formatDate(p.data_pagamento)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-mono font-bold text-emerald-700 text-lg">
                          {formatCurrency(p.totale)}
                        </span>
                        {isExpanded ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-zinc-200 bg-white"
                        >
                          <div className="p-4 space-y-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Dettaglio Spese</p>
                            {paymentExpenses.map((exp) => (
                              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-zinc-700 truncate">{exp.descrizione}</p>
                                  <p className="text-[10px] text-zinc-400">{formatDate(exp.data)}</p>
                                </div>
                                <span className="text-sm font-mono font-bold text-zinc-600 ml-4">
                                  {formatCurrency(exp.importo)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {pagamenti.length === 0 && (
                <p className="text-center py-10 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl">Nessun pagamento registrato.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden sticky top-8">
            <div className="relative z-10">
              <Wallet className="mb-4 opacity-50" size={32} />
              <p className="text-zinc-400 font-medium uppercase tracking-wider text-xs">Totale da pagare</p>
              <h3 className="text-4xl font-mono font-bold mt-1">{formatCurrency(total)}</h3>
              {pendingItems.length > 0 && (
                <button
                  onClick={handlePayAll}
                  className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Salda tutto ora
                </button>
              )}
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
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
