import { getLavori } from '@/lib/actions';
import Tasks from '@/components/Tasks';

export default async function Page() {
  const lavori = await getLavori();
  return <Tasks lavori={lavori} />;
}
