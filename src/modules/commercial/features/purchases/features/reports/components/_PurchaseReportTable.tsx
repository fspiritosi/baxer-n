'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import moment from 'moment';
import { VOUCHER_TYPE_LABELS, PURCHASE_INVOICE_STATUS_LABELS } from '../../invoices/shared/validators';
import { supplierTaxConditionLabels } from '@/shared/utils/mappers';

// Tipo de datos por período
interface PurchasesByPeriodData {
  invoices: Array<{
    id: string;
    fullNumber: string;
    voucherType: string;
    issueDate: Date;
    subtotal: number;
    vatAmount: number;
    total: number;
    status: string;
    supplier: { businessName: string };
  }>;
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    count: number;
  };
}

// Tipo de datos por proveedor
interface PurchasesBySupplierData {
  purchasesBySupplier: Array<{
    supplierId: string;
    supplierName: string;
    taxId: string;
    invoiceCount: number;
    subtotal: number;
    vatAmount: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    supplierCount: number;
  };
}

// Tipo de datos por producto
interface PurchasesByProductData {
  purchasesByProduct: Array<{
    productId: string | null;
    productCode: string;
    productName: string;
    unitOfMeasure: string;
    quantity: number;
    subtotal: number;
    vatAmount: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    productCount: number;
  };
}

// Tipo de datos libro IVA
interface VATPurchaseBookData {
  vatBook: Array<{
    id: string;
    fullNumber: string;
    voucherType: string;
    issueDate: Date;
    supplierName: string;
    supplierTaxId: string;
    supplierTaxCondition: string;
    subtotal: number;
    vatAmount: number;
    total: number;
    cae: string | null;
    vatByRate: Array<{
      rate: number;
      base: number;
      amount: number;
    }>;
  }>;
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
    invoiceCount: number;
  };
  vatSummary: Array<{
    rate: number;
    base: number;
    amount: number;
  }>;
}

type ReportData =
  | PurchasesByPeriodData
  | PurchasesBySupplierData
  | PurchasesByProductData
  | VATPurchaseBookData
  | null;

interface Props {
  reportType: 'period' | 'supplier' | 'product' | 'vat' | null;
  data: ReportData;
  startDate?: Date;
  endDate?: Date;
}

export function _PurchaseReportTable({ reportType, data, startDate, endDate }: Props) {
  if (!data || !reportType) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Selecciona un tipo de reporte y genera para ver los resultados
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderPeriodReport = (data: PurchasesByPeriodData) => {
    const invoices = data.invoices || [];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Compras por Período</CardTitle>
          <CardDescription>
            {startDate && endDate && (
              <>
                {moment(startDate).format('DD/MM/YYYY')} - {moment(endDate).format('DD/MM/YYYY')}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay compras en el período seleccionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Nro. Comprobante</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Proveedor</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right">IVA</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3">{moment(inv.issueDate).format('DD/MM/YYYY')}</td>
                      <td className="py-3 font-mono">{inv.fullNumber}</td>
                      <td className="py-3">
                        {VOUCHER_TYPE_LABELS[inv.voucherType as keyof typeof VOUCHER_TYPE_LABELS]}
                      </td>
                      <td className="py-3">{inv.supplier.businessName}</td>
                      <td className="py-3 text-right font-mono">
                        ${Number(inv.subtotal).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono">
                        ${Number(inv.vatAmount).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold">
                        ${Number(inv.total).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline">
                          {PURCHASE_INVOICE_STATUS_LABELS[inv.status as keyof typeof PURCHASE_INVOICE_STATUS_LABELS]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 font-semibold">
                  <tr>
                    <td className="pt-3" colSpan={4}>
                      TOTALES ({data.totals?.count || 0} facturas)
                    </td>
                    <td className="pt-3 text-right">${(data.totals?.subtotal || 0).toFixed(2)}</td>
                    <td className="pt-3 text-right">
                      ${(data.totals?.vatAmount || 0).toFixed(2)}
                    </td>
                    <td className="pt-3 text-right">${(data.totals?.total || 0).toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSupplierReport = (data: PurchasesBySupplierData) => {
    const suppliers = data.purchasesBySupplier || [];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Compras por Proveedor</CardTitle>
          <CardDescription>
            {startDate && endDate && (
              <>
                {moment(startDate).format('DD/MM/YYYY')} - {moment(endDate).format('DD/MM/YYYY')}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay compras en el período seleccionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Proveedor</th>
                    <th className="pb-3">CUIT</th>
                    <th className="pb-3 text-right">Cant. Facturas</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right">IVA</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.supplierId}>
                      <td className="py-3">{supplier.supplierName}</td>
                      <td className="py-3 font-mono">{supplier.taxId || '-'}</td>
                      <td className="py-3 text-right">{supplier.invoiceCount}</td>
                      <td className="py-3 text-right font-mono">
                        ${supplier.subtotal.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono">${supplier.vatAmount.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-semibold">
                        ${supplier.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 font-semibold">
                  <tr>
                    <td className="pt-3" colSpan={3}>
                      TOTALES ({data.totals?.supplierCount || 0} proveedores)
                    </td>
                    <td className="pt-3 text-right">
                      ${(data.totals?.subtotal || 0).toFixed(2)}
                    </td>
                    <td className="pt-3 text-right">
                      ${(data.totals?.vatAmount || 0).toFixed(2)}
                    </td>
                    <td className="pt-3 text-right">${(data.totals?.total || 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProductReport = (data: PurchasesByProductData) => {
    const products = data.purchasesByProduct || [];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Compras por Producto</CardTitle>
          <CardDescription>
            {startDate && endDate && (
              <>
                {moment(startDate).format('DD/MM/YYYY')} - {moment(endDate).format('DD/MM/YYYY')}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay compras en el período seleccionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Producto</th>
                    <th className="pb-3 text-right">Cantidad</th>
                    <th className="pb-3">UM</th>
                    <th className="pb-3 text-right">Subtotal</th>
                    <th className="pb-3 text-right">IVA</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product, idx) => (
                    <tr key={product.productId || `line-${idx}`}>
                      <td className="py-3 font-mono">{product.productCode}</td>
                      <td className="py-3">{product.productName}</td>
                      <td className="py-3 text-right font-mono">{product.quantity.toFixed(3)}</td>
                      <td className="py-3">{product.unitOfMeasure}</td>
                      <td className="py-3 text-right font-mono">${product.subtotal.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono">${product.vatAmount.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-semibold">
                        ${product.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 font-semibold">
                  <tr>
                    <td className="pt-3" colSpan={4}>
                      TOTALES ({data.totals?.productCount || 0} productos)
                    </td>
                    <td className="pt-3 text-right">${(data.totals?.subtotal || 0).toFixed(2)}</td>
                    <td className="pt-3 text-right">
                      ${(data.totals?.vatAmount || 0).toFixed(2)}
                    </td>
                    <td className="pt-3 text-right">${(data.totals?.total || 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderVATReport = (data: VATPurchaseBookData) => {
    const vatBook = data.vatBook || [];
    const vatSummary = data.vatSummary || [];

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Libro IVA Compras</CardTitle>
            <CardDescription>
              {startDate && endDate && (
                <>
                  {moment(startDate).format('DD/MM/YYYY')} - {moment(endDate).format('DD/MM/YYYY')}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vatBook.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay compras en el período seleccionado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Comprobante</th>
                      <th className="pb-3">Proveedor</th>
                      <th className="pb-3">CUIT</th>
                      <th className="pb-3">Cond. IVA</th>
                      <th className="pb-3 text-right">Neto</th>
                      <th className="pb-3 text-right">IVA</th>
                      <th className="pb-3 text-right">Total</th>
                      <th className="pb-3">CAE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vatBook.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-3">{moment(inv.issueDate).format('DD/MM/YYYY')}</td>
                        <td className="py-3 font-mono text-xs">{inv.fullNumber}</td>
                        <td className="py-3">{inv.supplierName}</td>
                        <td className="py-3 font-mono text-xs">{inv.supplierTaxId || '-'}</td>
                        <td className="py-3 text-xs">
                          {supplierTaxConditionLabels[inv.supplierTaxCondition as keyof typeof supplierTaxConditionLabels] || inv.supplierTaxCondition}
                        </td>
                        <td className="py-3 text-right font-mono">${inv.subtotal.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono">${inv.vatAmount.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono font-semibold">
                          ${inv.total.toFixed(2)}
                        </td>
                        <td className="py-3 font-mono text-xs">{inv.cae || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 font-semibold">
                    <tr>
                      <td className="pt-3" colSpan={5}>
                        TOTALES ({data.totals?.invoiceCount || 0} facturas)
                      </td>
                      <td className="pt-3 text-right">
                        ${(data.totals?.subtotal || 0).toFixed(2)}
                      </td>
                      <td className="pt-3 text-right">
                        ${(data.totals?.vatAmount || 0).toFixed(2)}
                      </td>
                      <td className="pt-3 text-right">${(data.totals?.total || 0).toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen por alícuota */}
        {vatSummary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen IVA por Alícuota</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3">Alícuota</th>
                    <th className="pb-3 text-right">Base Imponible</th>
                    <th className="pb-3 text-right">Impuesto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vatSummary.map((vat) => (
                    <tr key={vat.rate}>
                      <td className="py-3 font-semibold">{vat.rate}%</td>
                      <td className="py-3 text-right font-mono">${vat.base.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono">${vat.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 font-semibold">
                  <tr>
                    <td className="pt-3">TOTAL</td>
                    <td className="pt-3 text-right">
                      ${vatSummary.reduce((sum, v) => sum + v.base, 0).toFixed(2)}
                    </td>
                    <td className="pt-3 text-right">
                      ${vatSummary.reduce((sum, v) => sum + v.amount, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  switch (reportType) {
    case 'period':
      return renderPeriodReport(data as PurchasesByPeriodData);
    case 'supplier':
      return renderSupplierReport(data as PurchasesBySupplierData);
    case 'product':
      return renderProductReport(data as PurchasesByProductData);
    case 'vat':
      return renderVATReport(data as VATPurchaseBookData);
    default:
      return null;
  }
}
