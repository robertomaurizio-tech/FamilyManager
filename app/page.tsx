import { getSpese, getLavori, getListaSpesa, getVacanze } from '@/lib/actions';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShoppingCart, 
  CheckSquare, 
  Palmtree 
} from 'lucide-react';

export default async function Dashboard() {
  const { items: spese } = await getSpese(0, 1, 10);
  const lavori = await getLavori();
  const listaSpesa = await getListaSpesa();
  const vacanze = await getVacanze();

  const totalSpeseResult = await getSpese(0, 1, 10000); // Get all for total calculation or use a dedicated action
  const totalSpese = totalSpeseResult.items.reduce((acc, curr) => acc + curr.importo, 0);
  const speseMese = totalSpeseResult.items
    .filter(s => new Date(s.data).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + curr.importo, 0);
  
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
          title="Spese Totali" 
          value={formatCurrency(totalSpese)} 
          description="Tutte le spese registrate"
          icon={TrendingUp}
          trend="+12%"
          trendUp={true}
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
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display">Ultime Spese</h2>
              <button className="text-sm font-semibold text-zinc-500 hover:text-zinc-900">Vedi tutte</button>
            </div>
            <div className="space-y-4">
              {spese.slice(0, 5).map((spesa) => (
                <div key={spesa.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      <ReceiptIcon category={spesa.categoria} />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">
                        {spesa.note || spesa.categoria}
                        {spesa.id_vacanza > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase">
                            <Palmtree size={10} />
                            {vacanze.find(v => v.id === spesa.id_vacanza)?.nome}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{formatDate(spesa.data)} • {spesa.categoria}</p>
                    </div>
                  </div>
                  <p className="font-bold text-zinc-900">{formatCurrency(spesa.importo)}</p>
                </div>
              ))}
              {spese.length === 0 && (
                <p className="text-center text-zinc-400 py-8">Nessuna spesa registrata.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl">
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

          <section className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
             <h2 className="text-xl font-bold font-display mb-4">Prossimi Lavori</h2>
             <div className="space-y-3">
               {lavori.filter(l => !l.fatto).slice(0, 4).map(l => (
                 <div key={l.id} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-zinc-300" />
                   <span className="text-sm text-zinc-700">{l.lavoro}</span>
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
    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
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

function ReceiptIcon({ category }: { category: string }) {
  // Simple helper for icons based on category
  return <TrendingUp size={18} className="text-zinc-600" />;
}
