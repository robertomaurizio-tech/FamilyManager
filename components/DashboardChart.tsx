'use client';

import * as React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDashboardChartData } from '@/lib/actions';

export default function DashboardChart({ data: initialData }: { data: any[] }) {
  const router = useRouter();
  const [data, setData] = React.useState(initialData);
  const [offset, setOffset] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchNewData = async (newOffset: number) => {
    setIsLoading(true);
    try {
      const newData = await getDashboardChartData(newOffset);
      setData(newData);
      setOffset(newOffset);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (state: any) => {
    if (state && state.activeLabel) {
      router.push(`/expenses/month/${state.activeLabel}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 mb-2">
        <button
          onClick={() => fetchNewData(offset + 1)}
          disabled={isLoading}
          className="p-2 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50"
          title="Indietro"
        >
          <ChevronLeft size={20} className="text-zinc-600" />
        </button>
        <button
          onClick={() => fetchNewData(Math.max(0, offset - 1))}
          disabled={isLoading || offset === 0}
          className="p-2 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50"
          title="Avanti"
        >
          <ChevronRight size={20} className="text-zinc-600" />
        </button>
      </div>

      <div className={cn("h-[300px] w-full transition-opacity", isLoading ? "opacity-50" : "opacity-100")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip 
              cursor={{ fill: '#f4f4f5' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="normali" name="Normali" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="vacanza" name="Vacanza" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="extra" name="Extra" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-center text-zinc-400 mt-2 uppercase tracking-widest font-bold">Clicca su un mese per i dettagli</p>
      </div>
    </div>
  );
}

// Helper function since cn is not imported in the original but I used it
import { cn } from '@/lib/utils';
