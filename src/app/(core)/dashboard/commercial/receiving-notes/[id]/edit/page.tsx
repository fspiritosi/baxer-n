import { EditReceivingNote } from '@/modules/commercial/features/purchases/features/receiving-notes/edit';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReceivingNotePage({ params }: PageProps) {
  const { id } = await params;
  return <EditReceivingNote noteId={id} />;
}
