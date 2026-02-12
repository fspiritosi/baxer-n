'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { getPaymentOrder } from '../../actions.server';
import { PAYMENT_ORDER_STATUS_LABELS, PAYMENT_ORDER_STATUS_BADGES, PAYMENT_METHOD_LABELS } from '../../../../shared/validators';
import type { PaymentOrderWithDetails } from '../../../../shared/types';
import moment from 'moment';

interface PaymentOrderDetailModalProps {
  paymentOrderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentOrderDetailModal({ paymentOrderId, open, onOpenChange }: PaymentOrderDetailModalProps) {
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && paymentOrderId) {
      loadPaymentOrder();
    }
  }, [open, paymentOrderId]);

  const loadPaymentOrder = async () => {
    if (!paymentOrderId) return;

    setLoading(true);
    try {
      const data = await getPaymentOrder(paymentOrderId);
      setPaymentOrder(data);
    } catch (error) {
      console.error('Error al cargar orden de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Orden de Pago</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : paymentOrder ? (
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número</p>
                    <p className="font-medium">{paymentOrder.fullNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant={PAYMENT_ORDER_STATUS_BADGES[paymentOrder.status]}>
                      {PAYMENT_ORDER_STATUS_LABELS[paymentOrder.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{moment(paymentOrder.date).format('DD/MM/YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium text-lg">
                      ${paymentOrder.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-medium">
                    {paymentOrder.supplier.tradeName || paymentOrder.supplier.businessName}
                  </p>
                  {paymentOrder.supplier.taxId && (
                    <p className="text-sm text-muted-foreground">CUIT: {paymentOrder.supplier.taxId}</p>
                  )}
                </div>

                {paymentOrder.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observaciones</p>
                    <p className="text-sm">{paymentOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Facturas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facturas a Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.invoice.fullNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${item.invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Monto a pagar</p>
                        <p className="font-medium">
                          ${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Formas de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Formas de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentOrder.payments.map((payment) => {
                    let detail = '';
                    if (payment.cashRegister) {
                      detail = `Caja: ${payment.cashRegister.code} - ${payment.cashRegister.name}`;
                    } else if (payment.bankAccount) {
                      detail = `${payment.bankAccount.bankName} - ${payment.bankAccount.accountNumber}`;
                    } else if (payment.checkNumber) {
                      detail = `Cheque N° ${payment.checkNumber}`;
                    } else if (payment.cardLast4) {
                      detail = `Tarjeta **** ${payment.cardLast4}`;
                    } else if (payment.reference) {
                      detail = payment.reference;
                    }

                    return (
                      <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {PAYMENT_METHOD_LABELS[payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                          </p>
                          {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${payment.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
