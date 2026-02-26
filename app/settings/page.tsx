'use client';

import * as React from 'react';
import { useState } from 'react';
import { uploadCsvExpenses, deleteAllData, getCategorie, saveLoginSequence, getLoginSequence } from '@/lib/actions';
import CategoriesManager from '@/components/CategoriesManager';
import { UploadCloud, FileText, CheckCircle2, XCircle, Home, Heart, Star, Sun, Moon, Cloud, Lock, Key, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Category {
  id: number;
  nome: string;
  colore: string;
}

export default function SettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategorie();
      setCategories(cats);
    };
    fetchCategories();
  }, []);
  const [loginSequence, setLoginSequence] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchLoginSequence = async () => {
      const sequence = await getLoginSequence();
      setLoginSequence(sequence);
    };
    fetchLoginSequence();
  }, []);

  const availableIcons = [
    { name: 'Home', component: Home },
    { name: 'Heart', component: Heart },
    { name: 'Star', component: Star },
    { name: 'Sun', component: Sun },
    { name: 'Moon', component: Moon },
    { name: 'Cloud', component: Cloud },
    { name: 'Lock', component: Lock },
    { name: 'Key', component: Key },
    { name: 'Smile', component: Smile },
  ];

  const handleIconSelect = (iconName: string) => {
    if (loginSequence.length >= 4) return;
    setLoginSequence([...loginSequence, iconName]);
  };

  const handleSequenceReset = () => {
    setLoginSequence([]);
  };

  const handleSequenceSave = async () => {
    const result = await saveLoginSequence(loginSequence);
    if (result.success) {
      alert('Sequenza salvata!');
    } else {
      alert('Errore durante il salvataggio della sequenza.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleDeleteAllData = async () => {
    if (window.confirm('Sei sicuro di voler cancellare TUTTI i dati? Questa operazione è irreversibile!')) {
      setDeleteStatus('pending');
      setDeleteMessage('Cancellazione in corso...');
      try {
        const result = await deleteAllData();
        if (result.success) {
          setDeleteStatus('success');
          setDeleteMessage(result.message || 'Tutti i dati sono stati cancellati con successo!');
        } else {
          setDeleteStatus('error');
          setDeleteMessage(result.message || 'Errore durante la cancellazione dei dati.');
        }
      } catch (error: any) {
        setDeleteStatus('error');
        setDeleteMessage(`Errore: ${error.message || 'Qualcosa è andato storto.'}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Seleziona un file CSV prima di importare.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('Caricamento e importazione in corso...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      try {
        const result = await uploadCsvExpenses(csvContent);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Spese importate con successo!');
          setFile(null);
        } else {
          setStatus('error');
          setMessage(result.message || 'Errore durante l\'importazione delle spese.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(`Errore: ${error.message || 'Qualcosa è andato storto.'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-display font-bold tracking-tight">Impostazioni</h1>
        <p className="text-zinc-500 mt-2">Gestisci le impostazioni dell'applicazione.</p>
      </header>

      <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
        <h2 className="text-2xl font-display font-bold">Importa Spese da CSV</h2>
        <p className="text-zinc-600">Importa le tue spese da un file CSV. Assicurati che il file rispetti il seguente tracciato:</p>
        <pre className="bg-zinc-50 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-zinc-200">
          id,data,categoria,importo,note,id_vacanza,extra
        </pre>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-colors ${isDragOver ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 bg-white'}`}
        >
          <UploadCloud size={48} className="text-zinc-400 mb-4" />
          <p className="text-zinc-600 mb-2">Trascina qui il tuo file CSV o</p>
          <label className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all cursor-pointer">
            Scegli un file
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 text-zinc-700"
            >
              <FileText size={20} />
              <span>{file.name}</span>
            </motion.div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="w-full px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === 'uploading' ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <UploadCloud size={20} />
          )}
          {status === 'uploading' ? 'Importazione in corso...' : 'Importa Spese'}
        </button>

        <AnimatePresence>
          {status !== 'idle' && message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
            >
              {status === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <p className="text-sm font-medium">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
        <h2 className="text-2xl font-display font-bold">Gestione Categorie</h2>
        <CategoriesManager initialCategories={categories} />
      </section>

      <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
        <h2 className="text-2xl font-display font-bold">Configura Accesso con Icone</h2>
        <p className="text-zinc-600">Seleziona una sequenza di 4 icone per il tuo accesso sicuro. Ricorda l'ordine!</p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Sequenza Attuale</h3>
            <div className="mt-2 flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              {loginSequence.map((iconName, index) => {
                const Icon = availableIcons.find(i => i.name === iconName)?.component;
                return Icon ? <Icon key={index} size={24} className="text-indigo-600" /> : null;
              })}
              {loginSequence.length === 0 && <p className="text-sm text-zinc-400">Nessuna icona selezionata.</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Icone Disponibili</h3>
            <div className="mt-2 grid grid-cols-5 sm:grid-cols-9 gap-2">
              {availableIcons.map(icon => (
                <button 
                  key={icon.name} 
                  onClick={() => handleIconSelect(icon.name)}
                  disabled={loginSequence.length >= 4}
                  className="aspect-square flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:hover:bg-white"
                >
                  <icon.component size={24} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button onClick={handleSequenceReset} className="px-6 py-3 text-zinc-500 font-bold hover:text-indigo-600 transition-colors">Resetta</button>
            <button onClick={handleSequenceSave} disabled={loginSequence.length !== 4} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50">Salva Sequenza</button>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm space-y-6">
        <h2 className="text-2xl font-display font-bold text-rose-700">Zona Pericolosa</h2>
        <p className="text-rose-600">Questa azione cancellerà in modo permanente TUTTI i dati dal database. Procedi con cautela.</p>
        <button
          onClick={handleDeleteAllData}
          disabled={deleteStatus === 'pending'}
          className="w-full px-8 py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {deleteStatus === 'pending' ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <XCircle size={20} />
          )}
          {deleteStatus === 'pending' ? 'Cancellazione in corso...' : 'Cancella Tutti i Dati'}
        </button>

        <AnimatePresence>
          {deleteStatus !== 'idle' && deleteMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${deleteStatus === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
            >
              {deleteStatus === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <p className="text-sm font-medium">{deleteMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
