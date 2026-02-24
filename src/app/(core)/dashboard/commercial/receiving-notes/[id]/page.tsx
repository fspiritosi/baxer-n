import { ReceivingNoteDetail } from '@/modules/commercial/features/purchases/features/receiving-notes/detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReceivingNoteDetailPage({ params }: Props) {
  const { id } = await params;
  return <ReceivingNoteDetail noteId={id} />;
}
