import { getCategorie } from '@/lib/actions';
import CategoriesManager from '@/components/CategoriesManager';

export default async function Page() {
  const categories = await getCategorie();
  return <CategoriesManager initialCategories={categories} />;
}
