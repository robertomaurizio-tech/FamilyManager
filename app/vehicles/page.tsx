import { getVeicoli } from '@/lib/actions';
import VehicleManager from '@/components/VehicleManager';

export const dynamic = 'force-dynamic';

export default async function VehiclesPage() {
  const initialVeicoli = await getVeicoli();
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <VehicleManager initialVeicoli={initialVeicoli} />
    </main>
  );
}
