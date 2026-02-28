import { getSpese, getLavori, getListaSpesa, getVacanze, getCategorie, getMonthlyAverage, getDashboardChartData, getCurrentMonthExpensesTotal } from '@/lib/actions';

export const dynamic = 'force-dynamic';

import { formatCurrency, formatDate, cn } from '@/lib/utils';
import DashboardChart from '@/components/DashboardChart';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShoppingCart, 
  CheckSquare, 
  Palmtree,
  Tag,
  BarChart3
} from 'lucide-react';

export default async function Dashboard() {
  const { items: spese } = await getSpese(0, 1, 10);
  const lavori = await getLavori();
  const listaSpesa = await getListaSpesa();
  const vacanze = await getVacanze();
  const categorie = await getCategorie();
  const monthlyAverage = await getMonthlyAverage();
  const chartData = await getDashboardChartData();
  const speseMese = await getCurrentMonthExpensesTotal();
  
  const lavoriDaFare = lavori.filter(l => !l.fatto).length;
  const articoliSpesa = listaSpesa.length;
  const vacanzeAttive = vacanze.filter(v => v.attiva).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mt-2">Bentornato! Ecco il riepilogo della tua casa.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Spesa Media" 
          value={formatCurrency(monthlyAverage)} 
          description="Media mensile storica"
          icon={TrendingUp}
        />
        <StatCard 
          title="Spese Mese" 
          value={formatCurrency(speseMese)} 
          description="Spese nel mese corrente"
          icon={ArrowUpRight}
        />
        <StatCard 
          title="Lavori" 
          value={lavoriDaFare.toString()} 
          description="Lavori ancora da completare"
          icon={CheckSquare}
        />
        <StatCard 
          title="Lista Spesa" 
          value={articoliSpesa.toString()} 
          description="Articoli da acquistare"
          icon={ShoppingCart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-zinc-400" size={20} />
              <h2 className="text-xl font-bold font-display">Andamento Spese</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-6">Confronto mensile tra spese normali, vacanze ed extra.</p>
            <DashboardChart data={chartData} />
          </section>

          <section className="bg-zinc-50 rounded-3xl p-4 sm:p-6 border border-zinc-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display">Ultime Spese</h2>
              <Link href="/expenses" className="text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors">
                Vedi tutte
              </Link>
            </div>
            <div className="space-y-4">
              {spese.slice(0, 5).map((spesa) => {
                const cat = categorie.find(c => c.nome === spesa.categoria);
                return (
                  <div key={spesa.id} className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                      <div 
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: cat?.colore || '#f4f4f5' }}
                      >
                        <Tag size={18} className="text-white drop-shadow-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-indigo-600 truncate">
                          {spesa.note || spesa.categoria}
                        </p>
                        <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{formatDate(spesa.data)} • {spesa.categoria}</p>
                      </div>
                    </div>
                    <p className="font-bold text-indigo-600 flex-shrink-0 ml-2">{formatCurrency(spesa.importo)}</p>
                  </div>
                );
              })}
              {spese.length === 0 && (
                <p className="text-center text-zinc-400 py-8">Nessuna spesa registrata.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-indigo-600 text-white rounded-3xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Palmtree className="text-emerald-400" />
              <h2 className="text-xl font-bold font-display">Vacanze Attive</h2>
            </div>
            <div className="space-y-4">
              {vacanze.filter(v => v.attiva).map(v => (
                <div key={v.id} className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <p className="font-bold">{v.nome}</p>
                  <p className="text-xs text-white/60 mt-1">Iniziata il {formatDate(v.data_inizio)}</p>
                </div>
              ))}
              {vacanzeAttive === 0 && (
                <p className="text-sm text-white/40 italic">Nessuna vacanza attiva al momento.</p>
              )}
            </div>
          </section>

          <section className="bg-zinc-50 rounded-3xl p-4 sm:p-6 border border-zinc-100">
             <h2 className="text-xl font-bold font-display mb-4">Prossimi Lavori</h2>
             <div className="space-y-3">
               {lavori.filter(l => !l.fatto).slice(0, 4).map(l => (
                 <div key={l.id} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-zinc-300 flex-shrink-0" />
                   <span className="text-sm text-zinc-700 truncate">{l.lavoro}</span>
                 </div>
               ))}
               {lavoriDaFare === 0 && (
                 <p className="text-sm text-zinc-400 italic">Tutto fatto! Ottimo lavoro.</p>
               )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, trend, trendUp }: any) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-zinc-50 rounded-xl">
          <Icon size={20} className="text-zinc-600" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold mt-1 font-display">{value}</p>
      <p className="text-xs text-zinc-400 mt-2">{description}</p>
    </div>
  );
}
