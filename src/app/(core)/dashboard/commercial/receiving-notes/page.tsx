import { ReceivingNotesList } from '@/modules/commercial/features/purchases/features/receiving-notes/list';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function ReceivingNotesPage({ searchParams }: Props) {
  const params = await searchParams;
  return <ReceivingNotesList searchParams={params} />;
}
