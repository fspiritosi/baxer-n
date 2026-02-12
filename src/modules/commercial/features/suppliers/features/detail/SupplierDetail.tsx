import { checkPermission } from '@/shared/lib/permissions';
import { getSupplierById } from '../list/actions.server';
import { getSupplierAccountStatement } from './actions.server';
import { _SupplierDetailContent } from './components/_SupplierDetailContent';
import { _SupplierAccountStatement } from './components/_SupplierAccountStatement';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface SupplierDetailProps {
  supplierId: string;
}

export async function SupplierDetail({ supplierId }: SupplierDetailProps) {
  await checkPermission('commercial.suppliers', 'view');

  const [supplier, accountStatement] = await Promise.all([
    getSupplierById(supplierId),
    getSupplierAccountStatement(supplierId),
  ]);

  if (!supplier) {
    notFound();
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="general">Información General</TabsTrigger>
        <TabsTrigger value="account">Cuenta Corriente</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <_SupplierDetailContent supplier={supplier} />
      </TabsContent>

      <TabsContent value="account" className="mt-6">
        <_SupplierAccountStatement accountStatement={accountStatement} />
      </TabsContent>
    </Tabs>
  );
}
