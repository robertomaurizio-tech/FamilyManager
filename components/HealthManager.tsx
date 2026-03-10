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
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  addPersona, 
  deletePersona, 
  getMalattie, 
  addMalattia, 
  deleteMalattia, 
  getFarmaciMalattia, 
  addFarmacoMalattia, 
  deleteFarmacoMalattia 
} from '@/lib/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Persona {
  id: number;
  nome: string;
  eta: number;
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
  frequenza: string | null;
  durata: string | null;
}

export default function HealthManager({ initialPersone }: { initialPersone: Persona[] }) {
  const [persone, setPersone] = React.useState<Persona[]>(initialPersone);
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null);
  const [malattie, setMalattie] = React.useState<Malattia[]>([]);
  const [expandedMalattia, setExpandedMalattia] = React.useState<number | null>(null);
  const [farmaci, setFarmaci] = React.useState<Record<number, Farmaco[]>>({});
  
  const [showAddPersona, setShowAddPersona] = React.useState(false);
  const [newPersona, setNewPersona] = React.useState({ nome: '', eta: '', foto: '' });
  
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
    frequenza: '',
    durata: ''
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
    await addPersona(newPersona.nome, parseInt(newPersona.eta) || 0, newPersona.foto);
    setNewPersona({ nome: '', eta: '', foto: '' });
    setShowAddPersona(false);
    // Refresh persone list (in a real app we'd get the updated list from server)
    window.location.reload();
  };

  const handleDeletePersona = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa persona e tutti i suoi dati sanitari?')) return;
    await deletePersona(id);
    if (selectedPersona?.id === id) setSelectedPersona(null);
    window.location.reload();
  };

  const handleAddMalattia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersona || !newMalattia.nome) return;
    await addMalattia(
      selectedPersona.id, 
      newMalattia.nome, 
      newMalattia.dataInizio, 
      newMalattia.dataFine || undefined, 
      newMalattia.note || undefined
    );
    setNewMalattia({ 
      nome: '', 
      dataInizio: format(new Date(), 'yyyy-MM-dd'), 
      dataFine: '', 
      note: '' 
    });
    setShowAddMalattia(false);
    loadMalattie(selectedPersona.id);
  };

  const handleDeleteMalattia = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento malattia?')) return;
    await deleteMalattia(id);
    if (selectedPersona) loadMalattie(selectedPersona.id);
  };

  const handleAddFarmaco = async (idMalattia: number) => {
    if (!newFarmaco.nome) return;
    await addFarmacoMalattia(
      idMalattia,
      newFarmaco.nome,
      newFarmaco.dosaggio,
      newFarmaco.frequenza,
      newFarmaco.durata
    );
    setNewFarmaco({ nome: '', dosaggio: '', frequenza: '', durata: '' });
    loadFarmaci(idMalattia);
  };

  const handleDeleteFarmaco = async (idFarmaco: number, idMalattia: number) => {
    await deleteFarmacoMalattia(idFarmaco);
    loadFarmaci(idMalattia);
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
            <div className="w-16 h-16 rounded-full bg-zinc-100 mb-3 overflow-hidden flex items-center justify-center border border-zinc-200">
              {p.foto ? (
                <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
              ) : (
                <UserPlus size={24} className="text-zinc-400" />
              )}
            </div>
            <span className="font-bold text-zinc-900 truncate w-full text-center">{p.nome}</span>
            <span className="text-xs text-zinc-500">{p.eta} anni</span>
            
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
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Età</label>
                  <input
                    type="number"
                    value={newPersona.eta}
                    onChange={(e) => setNewPersona({ ...newPersona, eta: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Esempio: 35"
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
                      Salva Evento
                    </button>
                    <button
                      onClick={() => setShowAddMalattia(false)}
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
                                        {f.dosaggio} • {f.frequenza} • {f.durata}
                                      </p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteFarmaco(f.id, m.id)}
                                    className="p-1.5 text-zinc-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={14} />
                                  </button>
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
                                    type="text"
                                    placeholder="Frequenza (es. ogni 8 ore)"
                                    value={newFarmaco.frequenza}
                                    onChange={(e) => setNewFarmaco({ ...newFarmaco, frequenza: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Durata (es. 5 giorni)"
                                    value={newFarmaco.durata}
                                    onChange={(e) => setNewFarmaco({ ...newFarmaco, durata: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-indigo-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <button
                                  onClick={() => handleAddFarmaco(m.id)}
                                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Plus size={16} />
                                  Aggiungi Farmaco
                                </button>
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
    </div>
  );
}
