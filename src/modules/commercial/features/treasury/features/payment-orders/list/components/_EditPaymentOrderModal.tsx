'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createPaymentOrderSchema, type CreatePaymentOrderFormData, PAYMENT_METHOD_LABELS } from '../../../../shared/validators';
import { getPaymentOrder } from '../../actions.server';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import moment from 'moment';

interface EditPaymentOrderModalProps {
  paymentOrderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentOrderModal({ paymentOrderId, open, onOpenChange }: EditPaymentOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreatePaymentOrderFormData>({
    resolver: zodResolver(createPaymentOrderSchema),
    defaultValues: {
      supplierId: '',
      date: new Date(),
      notes: null,
      items: [],
      payments: [],
      withholdings: [],
    },
  });

  useEffect(() => {
    if (open && paymentOrderId) {
      loadPaymentOrder();
    } else if (!open) {
      form.reset();
    }
  }, [open, paymentOrderId]);

  const loadPaymentOrder = async () => {
    if (!paymentOrderId) return;

    setLoading(true);
    try {
      const data = await getPaymentOrder(paymentOrderId);

      // Cargar datos en el formulario
      form.reset({
        supplierId: data.supplier.id,
        date: new Date(data.date),
        notes: data.notes,
        items: data.items.map(item => ({
          invoiceId: item.invoice.id,
          amount: item.amount.toString(),
        })),
        payments: data.payments.map(payment => ({
          paymentMethod: payment.paymentMethod,
          amount: payment.amount.toString(),
          cashRegisterId: payment.cashRegister?.code || null,
          bankAccountId: payment.bankAccount?.bankName || null,
          checkNumber: payment.checkNumber,
          cardLast4: payment.cardLast4,
          reference: payment.reference,
        })),
      });
    } catch (error) {
      toast.error('Error al cargar la orden de pago');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreatePaymentOrderFormData) => {
    toast.info('La funcionalidad de edición se implementará próximamente');
    // TODO: Implementar actualización de orden de pago
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="hidden" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Orden de Pago</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La funcionalidad de edición estará disponible próximamente. Por ahora, puedes eliminar esta orden y crear una nueva.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
