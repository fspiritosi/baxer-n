import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contabilidad',
};

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
