'use client';

import type { SupplierAccountStatement } from '../actions.server';
import { _AccountStatementSummaryCard } from './_AccountStatementSummaryCard';
import { _PurchaseInvoicesAccountTable } from './_PurchaseInvoicesAccountTable';
import { _PaymentOrdersAccountTable } from './_PaymentOrdersAccountTable';

interface SupplierAccountStatementProps {
  accountStatement: SupplierAccountStatement;
}

export function _SupplierAccountStatement({ accountStatement }: SupplierAccountStatementProps) {
  const { invoices, payments, summary } = accountStatement;

  return (
    <div className="space-y-6">
      {/* Resumen de Saldos */}
      <_AccountStatementSummaryCard
        totalInvoiced={summary.totalInvoiced}
        totalPaid={summary.totalPaid}
        totalBalance={summary.totalBalance}
      />

      {/* Facturas de Compra */}
      <_PurchaseInvoicesAccountTable invoices={invoices} />

      {/* Órdenes de Pago */}
      <_PaymentOrdersAccountTable payments={payments} />
    </div>
  );
}
