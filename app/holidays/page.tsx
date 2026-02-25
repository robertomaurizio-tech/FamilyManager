import { getVacanze } from '@/lib/actions';
import Holidays from '@/components/Holidays';

export default async function Page() {
  const vacanze = await getVacanze();
  return <Holidays vacanze={vacanze} />;
}
