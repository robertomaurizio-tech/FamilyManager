'use client';

import * as React from 'react';
import { useState } from 'react';
import { uploadCsvExpenses, deleteAllData } from '@/lib/actions';
import { UploadCloud, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [deleteMessage, setDeleteMessage] = useState('');

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
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-colors ${isDragOver ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white'}`}
        >
          <UploadCloud size={48} className="text-zinc-400 mb-4" />
          <p className="text-zinc-600 mb-2">Trascina qui il tuo file CSV o</p>
          <label className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all cursor-pointer">
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
