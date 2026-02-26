import { getSpese, getVacanze, getActiveVacanza, getCategorie, getActiveVacanze } from '@/lib/actions';
import Expenses from '@/components/Expenses';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; idVacanza?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const idVacanza = parseInt(params.idVacanza || '0');
  const search = params.q || '';
  
  const { items, total } = await getSpese(idVacanza, page, 10, search);
  const vacanze = await getVacanze(); // Keep for other uses if needed, or remove if only active are ever used
  const activeVacanza = await getActiveVacanza();
  const activeVacanzeList = await getActiveVacanze(); // Nuova chiamata per le vacanze attive
  const categorie = await getCategorie();
  
  return (
    <Expenses 
      spese={items} 
      total={total} 
      vacanze={vacanze} 
      activeVacanza={activeVacanza}
      activeVacanzeList={activeVacanzeList} // Passa le vacanze attive
      categorie={categorie}
      currentPage={page}
      currentVacanzaId={idVacanza}
      currentSearch={search}
    />
  );
}
