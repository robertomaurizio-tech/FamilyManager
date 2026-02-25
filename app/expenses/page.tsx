import { getSpese, getVacanze, getActiveVacanza } from '@/lib/actions';
import Expenses from '@/components/Expenses';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; idVacanza?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const idVacanza = parseInt(params.idVacanza || '0');
  
  const { items, total } = await getSpese(idVacanza, page);
  const vacanze = await getVacanze();
  const activeVacanza = await getActiveVacanza();
  
  return (
    <Expenses 
      spese={items} 
      total={total} 
      vacanze={vacanze} 
      activeVacanza={activeVacanza}
      currentPage={page}
      currentVacanzaId={idVacanza}
    />
  );
}
