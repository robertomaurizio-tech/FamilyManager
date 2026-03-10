import { getPersone } from '@/lib/actions';
import HealthManager from '@/components/HealthManager';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
  const persone = await getPersone();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Salute e Malattie</h1>
        <p className="text-zinc-500 mt-1">Gestisci la salute dei membri della famiglia e il registro delle malattie.</p>
      </div>
      
      <HealthManager initialPersone={persone} />
    </div>
  );
}
