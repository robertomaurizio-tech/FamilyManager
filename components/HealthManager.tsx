'use client';

import * as React from 'react';
import { 
  Plus, 
  UserPlus, 
  Trash2, 
  Calendar, 
  Stethoscope, 
  Pill, 
  ChevronRight, 
  ChevronDown,
  Clock,
  Info,
  Camera,
  CheckSquare,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '@/components/Modal';
import { 
  addPersona, 
  deletePersona, 
  getMalattie, 
  addMalattia, 
  updateMalattia,
  deleteMalattia, 
  getFarmaciMalattia, 
  addFarmacoMalattia, 
  updateFarmacoMalattia,
  deleteFarmacoMalattia,
  updatePersonaFoto
} from '@/lib/actions';
import { cn } from '@/lib/utils';
import { format, differenceInYears } from 'date-fns';
import { it } from 'date-fns/locale';

interface Persona {
  id: number;
  nome: string;
  data_nascita: string | null;
  foto: string | null;
}

interface Malattia {
  id: number;
  id_persona: number;
  nome_malattia: string;
  data_inizio: string;
  data_fine: string | null;
  note_medico: string | null;
}

interface Farmaco {
  id: number;
  id_malattia: number;
  nome_farmaco: string;
  dosaggio: string | null;
  data: string | null;
  ora: string | null;
}

export default function HealthManager({ initialPersone }: { initialPersone: Persona[] }) {
  const [persone, setPersone] = React.useState<Persona[]>(initialPersone);
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null);
  const [malattie, setMalattie] = React.useState<Malattia[]>([]);
  const [expandedMalattia, setExpandedMalattia] = React.useState<number | null>(null);
  const [farmaci, setFarmaci] = React.useState<Record<number, Farmaco[]>>({});
  
  const [showAddPersona, setShowAddPersona] = React.useState(false);
  const [newPersona, setNewPersona] = React.useState({ nome: '', dataNascita: '', foto: '' });
  
  const [showAddMalattia, setShowAddMalattia] = React.useState(false);
  const [newMalattia, setNewMalattia] = React.useState({ 
    nome: '', 
    dataInizio: format(new Date(), 'yyyy-MM-dd'), 
    dataFine: '', 
    note: '' 
  });

  const [newFarmaco, setNewFarmaco] = React.useState({
    nome: '',
    dosaggio: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    ora: format(new Date(), 'HH:mm')
  });

  const [editingMalattia, setEditingMalattia] = React.useState<Malattia | null>(null);
  const [editingFarmaco, setEditingFarmaco] = React.useState<Farmaco | null>(null);
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

  const loadMalattie = React.useCallback(async (idPersona: number) => {
    const data = await getMalattie(idPersona);
    setMalattie(data);
  }, []);

  const loadFarmaci = React.useCallback(async (idMalattia: number) => {
    const data = await getFarmaciMalattia(idMalattia);
    setFarmaci(prev => ({ ...prev, [idMalattia]: data }));
  }, []);

  // Load illnesses when a person is selected
  React.useEffect(() => {
    if (selectedPersona) {
      loadMalattie(selectedPersona.id);
    } else {
      setMalattie([]);
      setExpandedMalattia(null);
    }
  }, [selectedPersona, loadMalattie]);

  // Load medications when an illness is expanded
  React.useEffect(() => {
    if (expandedMalattia && !farmaci[expandedMalattia]) {
      loadFarmaci(expandedMalattia);
    }
  }, [expandedMalattia, farmaci, loadFarmaci]);

  const handleAddPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersona.nome) return;
    await addPersona(newPersona.nome, newPersona.dataNascita, newPersona.foto);
    setNewPersona({ nome: '', dataNascita: '', foto: '' });
    setShowAddPersona(false);
    // Refresh persone list (in a real app we'd get the updated list from server)
    window.location.reload();
  };

  const handleUpdatePhoto = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updatePersonaFoto(id, base64);
        // Update local state
        setPersone(prev => prev.map(p => p.id === id ? { ...p, foto: base64 } : p));
        if (selectedPersona?.id === id) {
          setSelectedPersona(prev => prev ? { ...prev, foto: base64 } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    try {
      return differenceInYears(new Date(), new Date(dob));
    } catch (e) {
      return null;
    }
  };

  const handleDeletePersona = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Membro',
      message: 'Sei sicuro di voler eliminare questa persona e tutti i suoi dati sanitari? Questa azione non può essere annullata.',
      type: 'danger',
      onConfirm: async () => {
        await deletePersona(id);
        if (selectedPersona?.id === id) setSelectedPersona(null);
        window.location.reload();
      }
    });
  };

  const handleAddMalattia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersona || !newMalattia.nome) return;
    
    if (editingMalattia) {
      await updateMalattia(
        editingMalattia.id,
        newMalattia.nome,
        newMalattia.dataInizio,
        newMalattia.dataFine || undefined,
        newMalattia.note || undefined
      );
      setEditingMalattia(null);
    } else {
      await addMalattia(
        selectedPersona.id, 
        newMalattia.nome, 
        newMalattia.dataInizio, 
        newMalattia.dataFine || undefined, 
        newMalattia.note || undefined
      );
    }

    setNewMalattia({ 
      nome: '', 
      dataInizio: format(new Date(), 'yyyy-MM-dd'), 
      dataFine: '', 
      note: '' 
    });
    setShowAddMalattia(false);
    loadMalattie(selectedPersona.id);
  };

  const handleEditMalattia = (m: Malattia) => {
    setEditingMalattia(m);
    setNewMalattia({
      nome: m.nome_malattia,
      dataInizio: m.data_inizio,
      dataFine: m.data_fine || '',
      note: m.note_medico || ''
    });
    setShowAddMalattia(true);
  };

  const handleDeleteMalattia = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Evento',
      message: 'Sei sicuro di voler eliminare questo evento malattia? Tutti i farmaci associati verranno rimossi.',
      type: 'danger',
      onConfirm: async () => {
        await deleteMalattia(id);
        if (selectedPersona) loadMalattie(selectedPersona.id);
      }
    });
  };

  const handleAddFarmaco = async (idMalattia: number) => {
    if (!newFarmaco.nome) return;
    
    if (editingFarmaco) {
      await updateFarmacoMalattia(
        editingFarmaco.id,
        newFarmaco.nome,
        newFarmaco.dosaggio,
        newFarmaco.data,
        newFarmaco.ora
      );
      setEditingFarmaco(null);
    } else {
      await addFarmacoMalattia(
        idMalattia,
        newFarmaco.nome,
        newFarmaco.dosaggio,
        newFarmaco.data,
        newFarmaco.ora
      );
    }

    setNewFarmaco({ 
      nome: '', 
      dosaggio: '', 
      data: format(new Date(), 'yyyy-MM-dd'), 
      ora: format(new Date(), 'HH:mm') 
    });
    loadFarmaci(idMalattia);
  };

  const handleEditFarmaco = (f: Farmaco) => {
    setEditingFarmaco(f);
    setNewFarmaco({
      nome: f.nome_farmaco,
      dosaggio: f.dosaggio || '',
      data: f.data || format(new Date(), 'yyyy-MM-dd'),
      ora: f.ora || format(new Date(), 'HH:mm')
    });
  };

  const handleDeleteFarmaco = async (idFarmaco: number, idMalattia: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Farmaco',
      message: 'Sei sicuro di voler eliminare questa somministrazione?',
      type: 'danger',
      onConfirm: async () => {
        await deleteFarmacoMalattia(idFarmaco);
        loadFarmaci(idMalattia);
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPersona(prev => ({ ...prev, foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* People Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {persone.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p)}
            className={cn(
              "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all",
              selectedPersona?.id === p.id 
                ? "border-indigo-600 bg-indigo-50 shadow-md" 
                : "border-zinc-100 bg-white hover:border-zinc-200"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-zinc-100 mb-3 overflow-hidden flex items-center justify-center border border-zinc-200 relative group/photo">
              {p.foto ? (
                <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
              ) : (
                <UserPlus size={24} className="text-zinc-400" />
              )}
              
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpdatePhoto(p.id, e)} />
              </label>
            </div>
            <span className="font-bold text-zinc-900 truncate w-full text-center">{p.nome}</span>
            <span className="text-xs text-zinc-500">{calculateAge(p.data_nascita)} anni</span>
            
            {selectedPersona?.id === p.id && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeletePersona(p.id); }}
                className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </button>
        ))}
        
        <button
          onClick={() => setShowAddPersona(true)}
          className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-50 mb-3 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Plus size={24} className="text-zinc-400 group-hover:text-indigo-600" />
          </div>
          <span className="font-medium text-zinc-500 group-hover:text-indigo-600">Aggiungi</span>
        </button>
      </div>

      {/* Add Persona Modal */}
      <AnimatePresence>
        {showAddPersona && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Nuovo Membro Famiglia</h2>
                <button onClick={() => setShowAddPersona(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleAddPersona} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <label className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300 group-hover:border-indigo-500 transition-colors">
                      {newPersona.foto ? (
                        <img src={newPersona.foto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={32} className="text-zinc-400 group-hover:text-indigo-500" />
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-lg">
                      <Plus size={14} />
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={newPersona.nome}
                    onChange={(e) => setNewPersona({ ...newPersona, nome: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Esempio: Marco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Data di Nascita</label>
                  <input
                    type="date"
                    required
                    value={newPersona.dataNascita}
                    onChange={(e) => setNewPersona({ ...newPersona, dataNascita: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Salva Membro
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Person Content */}
      {selectedPersona && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Stethoscope className="text-indigo-600" />
              Registro Malattie di {selectedPersona.nome}
            </h2>
            <button
              onClick={() => setShowAddMalattia(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus size={18} />
              Nuovo Evento
            </button>
          </div>

          {/* Add Malattia Form */}
          <AnimatePresence>
            {showAddMalattia && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingMalattia ? 'Modifica Evento' : 'Nuovo Evento'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddMalattia(false);
                    setEditingMalattia(null);
                  }} 
                  className="p-2 hover:bg-zinc-100 rounded-full"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Patologia / Sintomo</label>
                      <input
                        type="text"
                        required
                        value={newMalattia.nome}
                        onChange={(e) => setNewMalattia({ ...newMalattia, nome: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Esempio: Influenza, Mal di gola..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Data Inizio</label>
                      <input
                        type="date"
                        required
                        value={newMalattia.dataInizio}
                        onChange={(e) => setNewMalattia({ ...newMalattia, dataInizio: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Data Fine (Opzionale)</label>
                      <input
                        type="date"
                        value={newMalattia.dataFine}
                        onChange={(e) => setNewMalattia({ ...newMalattia, dataFine: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Note del Medico</label>
                      <textarea
                        value={newMalattia.note}
                        onChange={(e) => setNewMalattia({ ...newMalattia, note: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                        placeholder="Prescrizioni, consigli, diagnosi..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddMalattia}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                      {editingMalattia ? 'Aggiorna Evento' : 'Salva Evento'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMalattia(false);
                        setEditingMalattia(null);
                      }}
                      className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Illness List */}
          <div className="space-y-4">
            {malattie.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <Stethoscope size={48} className="mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-500">Nessun evento registrato per {selectedPersona.nome}</p>
              </div>
            ) : (
              malattie.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
                    onClick={() => setExpandedMalattia(expandedMalattia === m.id ? null : m.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        m.data_fine ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {m.data_fine ? <CheckSquare size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900">{m.nome_malattia}</h3>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(m.data_inizio), 'd MMM yyyy', { locale: it })}
                          {m.data_fine && ` - ${format(new Date(m.data_fine), 'd MMM yyyy', { locale: it })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditMalattia(m); }}
                        className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteMalattia(m.id); }}
                        className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      {expandedMalattia === m.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedMalattia === m.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-zinc-100 bg-zinc-50/50"
                      >
                        <div className="p-4 space-y-6">
                          {/* Doctor Notes */}
                          {m.note_medico && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                <Info size={14} />
                                Note del Medico
                              </h4>
                              <p className="text-sm text-zinc-700 bg-white p-3 rounded-xl border border-zinc-100">
                                {m.note_medico}
                              </p>
                            </div>
                          )}

                          {/* Medications Section */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                              <Pill size={14} />
                              Farmaci e Trattamento
                            </h4>
                            
                            <div className="space-y-2">
                              {farmaci[m.id]?.map((f) => (
                                <div key={f.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-100 group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                      <Pill size={16} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-zinc-900">{f.nome_farmaco}</p>
                                      <p className="text-xs text-zinc-500">
                                        {f.dosaggio} • {f.data ? format(new Date(f.data), 'd MMM', { locale: it }) : ''} alle {f.ora}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => handleEditFarmaco(f)}
                                      className="p-1.5 text-zinc-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteFarmaco(f.id, m.id)}
                                      className="p-1.5 text-zinc-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Add Farmaco Form */}
                              <div className="bg-indigo-50/50 p-4 rounded-xl border border-dashed border-indigo-200 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Nome Farmaco"
                                    value={newFarmaco.nome}
                                    onChange={(e) => setNewFarmaco({ ...newFarmaco, nome: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Dosaggio (es. 1 compressa)"
                                    value={newFarmaco.dosaggio}
                                    onChange={(e) => setNewFarmaco({ ...newFarmaco, dosaggio: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="date"
                                    value={newFarmaco.data}
                                    onChange={(e) => setNewFarmaco({ ...newFarmaco, data: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="time"
                                    value={newFarmaco.ora}
                                    onChange={(e) => setNewFarmaco({ ...newFarmaco, ora: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddFarmaco(m.id)}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Plus size={16} />
                                    {editingFarmaco ? 'Aggiorna Farmaco' : 'Aggiungi Farmaco'}
                                  </button>
                                  {editingFarmaco && (
                                    <button
                                      onClick={() => {
                                        setEditingFarmaco(null);
                                        setNewFarmaco({ 
                                          nome: '', 
                                          dosaggio: '', 
                                          data: format(new Date(), 'yyyy-MM-dd'), 
                                          ora: format(new Date(), 'HH:mm') 
                                        });
                                      }}
                                      className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
                                    >
                                      Annulla
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
