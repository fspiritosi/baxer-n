import type { Metadata } from 'next';

import { ContactsList } from '@/modules/commercial';

export const metadata: Metadata = {
  title: 'Contactos',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ContactsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <ContactsList searchParams={resolvedSearchParams} />;
}
