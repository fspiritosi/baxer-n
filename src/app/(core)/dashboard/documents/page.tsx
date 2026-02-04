import type { Metadata } from 'next';

import { DocumentsOverview } from '@/modules/documents';

export const metadata: Metadata = {
  title: 'Documentación',
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DocumentsPage({ searchParams }: Props) {
  const params = await searchParams;
  return <DocumentsOverview searchParams={params} />;
}
