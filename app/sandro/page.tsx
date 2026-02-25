import { getSpeseSandro } from '@/lib/actions';
import SandroExpenses from '@/components/SandroExpenses';

export default async function Page() {
  const { items, totalNonPagato } = await getSpeseSandro();
  return <SandroExpenses initialItems={items} initialTotal={totalNonPagato} />;
}
