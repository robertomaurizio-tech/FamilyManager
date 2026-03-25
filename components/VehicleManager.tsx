'use client';

import * as React from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Wrench, 
  Car, 
  ChevronRight, 
  ChevronDown,
  Gauge,
  Euro,
  Edit2,
  History,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '@/components/Modal';
import { 
  getVeicoli,
  addVeicolo,
  updateVeicolo,
  deleteVeicolo,
  getManutenzioni,
  addManutenzione,
  updateManutenzione,
  deleteManutenzione
} from '@/lib/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Veicolo {
  id: number;
  nome: string;
  targa: string | null;
  tipo: string | null;
}

interface Manutenzione {
  id: number;
  id_veicolo: number;
  data: string;
  descrizione: string;
  km: number | null;
  costo: number | null;
}

export default function VehicleManager({ initialVeicoli }: { initialVeicoli: Veicolo[] }) {
  const [veicoli, setVeicoli] = React.useState<Veicolo[]>(initialVeicoli);
  const [selectedVeicolo, setSelectedVeicolo] = React.useState<Veicolo | null>(null);
  const [manutenzioni, setManutenzioni] = React.useState<Manutenzione[]>([]);
  
  const [showAddVeicolo, setShowAddVeicolo] = React.useState(false);
  const [editingVeicolo, setEditingVeicolo] = React.useState<Veicolo | null>(null);
  const [newVeicolo, setNewVeicolo] = React.useState({ nome: '', targa: '', tipo: 'auto' });
  
  const [showAddManutenzione, setShowAddManutenzione] = React.useState(false);
  const [editingManutenzione, setEditingManutenzione] = React.useState<Manutenzione | null>(null);
  const [newManutenzione, setNewManutenzione] = React.useState({ 
    descrizione: '', 
    data: format(new Date(), 'yyyy-MM-dd'), 
    km: '', 
    costo: '' 
  });

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const loadVeicoli = async () => {
    const data = await getVeicoli();
    setVeicoli(data);
  };

  const loadManutenzioni = async (idVeicolo: number) => {
    const data = await getManutenzioni(idVeicolo);
    setManutenzioni(data);
  };

  React.useEffect(() => {
    if (selectedVeicolo) {
      loadManutenzioni(selectedVeicolo.id);
    }
  }, [selectedVeicolo]);

  const handleAddVeicolo = async () => {
    if (!newVeicolo.nome) return;
    if (editingVeicolo) {
      await updateVeicolo(editingVeicolo.id, newVeicolo.nome, newVeicolo.targa, newVeicolo.tipo);
    } else {
      await addVeicolo(newVeicolo.nome, newVeicolo.targa, newVeicolo.tipo);
    }
    setNewVeicolo({ nome: '', targa: '', tipo: 'auto' });
    setEditingVeicolo(null);
    setShowAddVeicolo(false);
    loadVeicoli();
  };

  const handleEditVeicolo = (v: Veicolo) => {
    setEditingVeicolo(v);
    setNewVeicolo({ nome: v.nome, targa: v.targa || '', tipo: v.tipo || 'auto' });
    setShowAddVeicolo(true);
  };

  const handleDeleteVeicolo = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Veicolo',
      message: 'Sei sicuro di voler eliminare questo veicolo e tutte le sue manutenzioni?',
      type: 'danger',
      onConfirm: async () => {
        await deleteVeicolo(id);
        if (selectedVeicolo?.id === id) setSelectedVeicolo(null);
        loadVeicoli();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddManutenzione = async () => {
    if (!selectedVeicolo || !newManutenzione.descrizione) return;
    
    const km = newManutenzione.km ? parseInt(newManutenzione.km) : undefined;
    const costo = newManutenzione.costo ? parseFloat(newManutenzione.costo) : undefined;

    if (editingManutenzione) {
      await updateManutenzione(editingManutenzione.id, newManutenzione.data, newManutenzione.descrizione, km, costo);
    } else {
      await addManutenzione(selectedVeicolo.id, newManutenzione.data, newManutenzione.descrizione, km, costo);
    }

    setNewManutenzione({ 
      descrizione: '', 
      data: format(new Date(), 'yyyy-MM-dd'), 
      km: '', 
      costo: '' 
    });
    setEditingManutenzione(null);
    setShowAddManutenzione(false);
    loadManutenzioni(selectedVeicolo.id);
  };

  const handleEditManutenzione = (m: Manutenzione) => {
    setEditingManutenzione(m);
    setNewManutenzione({
      descrizione: m.descrizione,
      data: m.data,
      km: m.km?.toString() || '',
      costo: m.costo?.toString() || ''
    });
    setShowAddManutenzione(true);
  };

  const handleDeleteManutenzione = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Manutenzione',
      message: 'Sei sicuro di voler eliminare questa registrazione di manutenzione?',
      type: 'danger',
      onConfirm: async () => {
        await deleteManutenzione(id);
        if (selectedVeicolo) loadManutenzioni(selectedVeicolo.id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-zinc-900 flex items-center gap-2">
          <Car className="text-indigo-600" /> Veicoli
        </h2>
        <button 
          onClick={() => {
            setEditingVeicolo(null);
            setNewVeicolo({ nome: '', targa: '', tipo: 'auto' });
            setShowAddVeicolo(!showAddVeicolo);
          }}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showAddVeicolo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4 mb-6">
              <h3 className="font-bold text-zinc-900">{editingVeicolo ? 'Modifica Veicolo' : 'Aggiungi Nuovo Veicolo'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nome Veicolo</label>
                  <input 
                    type="text" 
                    placeholder="Es: Fiat Panda"
                    value={newVeicolo.nome}
                    onChange={e => setNewVeicolo({ ...newVeicolo, nome: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-100 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Targa (Opzionale)</label>
                  <input 
                    type="text" 
                    placeholder="Es: AA123BB"
                    value={newVeicolo.targa}
                    onChange={e => setNewVeicolo({ ...newVeicolo, targa: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-100 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tipo</label>
                  <select 
                    value={newVeicolo.tipo}
                    onChange={e => setNewVeicolo({ ...newVeicolo, tipo: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-100 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="auto">Auto</option>
                    <option value="moto">Moto</option>
                    <option value="furgone">Furgone</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAddVeicolo}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  {editingVeicolo ? 'Aggiorna' : 'Salva'}
                </button>
                <button 
                  onClick={() => setShowAddVeicolo(false)}
                  className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {veicoli.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVeicolo(v)}
              className={cn(
                "w-full p-4 rounded-3xl border transition-all text-left flex items-center justify-between group",
                selectedVeicolo?.id === v.id 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "bg-white border-zinc-100 text-zinc-900 hover:border-indigo-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  selectedVeicolo?.id === v.id ? "bg-white/20" : "bg-indigo-50 text-indigo-600"
                )}>
                  <Car size={24} />
                </div>
                <div>
                  <p className="font-bold">{v.nome}</p>
                  <p className={cn(
                    "text-xs",
                    selectedVeicolo?.id === v.id ? "text-indigo-100" : "text-zinc-400"
                  )}>{v.targa || 'Nessuna targa'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditVeicolo(v);
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                    selectedVeicolo?.id === v.id ? "hover:bg-white/20" : "hover:bg-zinc-100 text-zinc-400"
                  )}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVeicolo(v.id);
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                    selectedVeicolo?.id === v.id ? "hover:bg-white/20" : "hover:bg-zinc-100 text-zinc-400"
                  )}
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={20} className={cn(
                  "transition-transform",
                  selectedVeicolo?.id === v.id ? "translate-x-1" : "text-zinc-300"
                )} />
              </div>
            </button>
          ))}
          {veicoli.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
              <Car className="mx-auto text-zinc-300 mb-2" size={32} />
              <p className="text-zinc-400 text-sm">Nessun veicolo inserito</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedVeicolo ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">{selectedVeicolo.nome}</h3>
                    <p className="text-sm text-zinc-500">Cronologia Manutenzioni</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingManutenzione(null);
                      setNewManutenzione({ 
                        descrizione: '', 
                        data: format(new Date(), 'yyyy-MM-dd'), 
                        km: '', 
                        costo: '' 
                      });
                      setShowAddManutenzione(!showAddManutenzione);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={18} />
                    Nuova Manutenzione
                  </button>
                </div>

                <AnimatePresence>
                  {showAddManutenzione && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Descrizione</label>
                            <input 
                              type="text" 
                              placeholder="Es: Cambio Olio"
                              value={newManutenzione.descrizione}
                              onChange={e => setNewManutenzione({ ...newManutenzione, descrizione: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Data</label>
                            <input 
                              type="date" 
                              value={newManutenzione.data}
                              onChange={e => setNewManutenzione({ ...newManutenzione, data: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Chilometri (Opzionale)</label>
                            <input 
                              type="number" 
                              placeholder="Es: 50000"
                              value={newManutenzione.km}
                              onChange={e => setNewManutenzione({ ...newManutenzione, km: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Costo (Opzionale)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              placeholder="Es: 150.00"
                              value={newManutenzione.costo}
                              onChange={e => setNewManutenzione({ ...newManutenzione, costo: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleAddManutenzione}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                          >
                            {editingManutenzione ? 'Aggiorna' : 'Salva'}
                          </button>
                          <button 
                            onClick={() => setShowAddManutenzione(false)}
                            className="px-6 py-2 bg-white text-zinc-600 rounded-xl font-bold border border-zinc-200 hover:bg-zinc-50 transition-colors"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {manutenzioni.map((m, idx) => (
                    <div key={m.id} className="relative pl-8 pb-8 last:pb-0 group">
                      {idx !== manutenzioni.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-zinc-100" />
                      )}
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      </div>
                      
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 group-hover:border-indigo-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {format(new Date(m.data), 'dd MMM yyyy', { locale: it })}
                              </span>
                              <h4 className="font-bold text-zinc-900">{m.descrizione}</h4>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              {m.km && (
                                <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                                  <Gauge size={14} />
                                  <span>{m.km.toLocaleString()} km</span>
                                </div>
                              )}
                              {m.costo && (
                                <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                                  <Euro size={14} />
                                  <span>{m.costo.toFixed(2)} €</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleEditManutenzione(m)}
                              className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteManutenzione(m.id)}
                              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {manutenzioni.length === 0 && (
                    <div className="text-center py-12">
                      <History className="mx-auto text-zinc-200 mb-2" size={48} />
                      <p className="text-zinc-400">Nessuna manutenzione registrata</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-300 mb-4 shadow-sm">
                <Car size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Seleziona un veicolo</h3>
              <p className="text-zinc-400 text-sm max-w-xs">Scegli un veicolo dalla lista per visualizzare e gestire le sue manutenzioni.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
