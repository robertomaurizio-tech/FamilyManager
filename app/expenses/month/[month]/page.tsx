import { getMonthlyExpensesDetail, getCategorie } from '@/lib/actions';

export const dynamic = 'force-dynamic';

import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, Tag, Palmtree, ArrowLeft, Receipt, Star } from 'lucide-react';
import Link from 'next/link';

export default async function MonthlyDetailPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const detail = await getMonthlyExpensesDetail(month);
  const categorie = await getCategorie();

  const [year, monthNum] = month.split('-');
  const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <header className="flex items-start sm:items-center gap-3 sm:gap-4">
        <Link 
          href="/"
          className="p-2 sm:p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-colors shadow-sm flex-shrink-0"
        >
          <ArrowLeft size={20} className="sm:size-6" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight capitalize truncate">{monthName}</h1>
          <p className="text-zinc-500 mt-0.5 sm:mt-1 text-xs sm:text-base">Dettaglio analitico delle spese mensili.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Totale Mese</p>
          <p className="text-3xl font-mono font-bold">
            {formatCurrency(detail.expenses.reduce((acc, curr) => acc + curr.importo, 0))}
          </p>
        </div>
        <div className="bg-amber-500 text-white p-6 rounded-3xl shadow-xl">
          <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">Totale Extra</p>
          <p className="text-3xl font-mono font-bold">{formatCurrency(detail.extraTotal)}</p>
        </div>
        <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Totale Vacanze</p>
          <p className="text-3xl font-mono font-bold">
            {formatCurrency(detail.byVacanza.reduce((acc, curr) => acc + curr.totale, 0))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
            <Tag size={20} className="text-zinc-400" />
            Per Categoria
          </h2>
          <div className="space-y-4">
            {detail.byCategory.map((c, i) => {
              const catInfo = categorie.find(cat => cat.nome === c.categoria);
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: catInfo?.colore || '#e4e4e7' }}
                    />
                    <span className="font-medium text-zinc-700">{c.categoria}</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-600">{formatCurrency(c.totale)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
            <Palmtree size={20} className="text-zinc-400" />
            Per Vacanza
          </h2>
          <div className="space-y-4">
            {detail.byVacanza.map((v, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-medium text-zinc-700">{v.nome}</span>
                <span className="font-mono font-bold text-indigo-600">{formatCurrency(v.totale)}</span>
              </div>
            ))}
            {detail.byVacanza.length === 0 && (
              <p className="text-zinc-400 italic text-sm">Nessuna spesa associata a vacanze in questo mese.</p>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Receipt size={20} className="text-zinc-400" />
            Elenco Spese
          </h2>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">
            {detail.expenses.length} Transazioni
          </span>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Note</th>
                <th className="px-8 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Importo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {detail.expenses.map((spesa) => {
                const cat = categorie.find(c => c.nome === spesa.categoria);
                return (
                  <tr key={spesa.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-4 text-sm text-zinc-500">{formatDate(spesa.data)}</td>
                    <td className="px-8 py-4">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: cat?.colore || '#6b7280' }}
                      >
                        {spesa.categoria}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-indigo-600">{spesa.note || '-'}</span>
                        <div className="flex gap-2 mt-1">
                          {spesa.extra === 1 && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                              <Star size={8} /> Extra
                            </span>
                          )}
                          {spesa.vacanza_nome && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                              <Palmtree size={8} /> {spesa.vacanza_nome}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-indigo-600 text-right">
                      {formatCurrency(spesa.importo)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {detail.expenses.map((spesa) => {
            const cat = categorie.find(c => c.nome === spesa.categoria);
            return (
              <div key={spesa.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">{formatDate(spesa.data)}</span>
                  <span className="font-mono font-bold text-indigo-600">{formatCurrency(spesa.importo)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-indigo-600 truncate">{spesa.note || spesa.categoria}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: cat?.colore || '#6b7280' }}
                      >
                        {spesa.categoria}
                      </span>
                      {spesa.extra === 1 && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                          <Star size={8} /> Extra
                        </span>
                      )}
                      {spesa.vacanza_nome && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                          <Palmtree size={8} /> {spesa.vacanza_nome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
