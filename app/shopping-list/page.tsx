import { getListaSpesa, getStoricoSpesa } from '@/lib/actions';
import ShoppingList from '@/components/ShoppingList';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const listaSpesa = await getListaSpesa();
  const storicoSpesa = await getStoricoSpesa();
  return <ShoppingList listaSpesa={listaSpesa} storicoSpesa={storicoSpesa} />;
}
