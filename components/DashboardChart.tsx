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
  Cell
} from 'recharts';
import { useRouter } from 'next/navigation';

export default function DashboardChart({ data }: { data: any[] }) {
  const router = useRouter();

  const handleClick = (state: any) => {
    if (state && state.activeLabel) {
      router.push(`/expenses/month/${state.activeLabel}`);
    }
  };

  return (
    <div className="h-[300px] w-full mt-4">
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
          <Bar dataKey="normali" name="Normali" stackId="a" fill="#18181b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="vacanza" name="Vacanza" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="extra" name="Extra" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-center text-zinc-400 mt-2 uppercase tracking-widest font-bold">Clicca su un mese per i dettagli</p>
    </div>
  );
}
