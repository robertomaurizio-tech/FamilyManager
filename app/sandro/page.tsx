import { getSpeseSandro, getPagamentiSandro } from '@/lib/actions';
import SandroExpenses from '@/components/SandroExpenses';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { items, totalNonPagato } = await getSpeseSandro();
  const pagamenti = await getPagamentiSandro();
  return (
    <SandroExpenses 
      initialItems={items} 
      initialTotal={totalNonPagato} 
      pagamenti={pagamenti}
    />
  );
}
