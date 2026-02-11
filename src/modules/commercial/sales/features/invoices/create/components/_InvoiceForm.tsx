'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { createInvoice } from '../../list/actions.server';
import { invoiceFormSchema, VOUCHER_TYPE_LABELS } from '../../shared/validators';
import { z } from 'zod';
import moment from 'moment';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

type FormInput = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  customers: Array<{ id: string; name: string; taxId: string | null; email: string | null }>;
  pointsOfSale: Array<{
    id: string;
    number: number;
    name: string;
    afipEnabled: boolean;
  }>;
  products: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    unitOfMeasure: string;
    salePrice: any;
    salePriceWithTax: any;
    vatRate: any;
    trackStock: boolean;
  }>;
}

export function InvoiceForm({ customers, pointsOfSale, products }: InvoiceFormProps) {
  const router = useRouter();
  const [totals, setTotals] = useState({ subtotal: 0, vatAmount: 0, total: 0 });

  const form = useForm<FormInput>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: '',
      pointOfSaleId: '',
      voucherType: 'FACTURA_B',
      issueDate: new Date(),
      dueDate: undefined,
      notes: '',
      internalNotes: '',
      lines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  // Recalcular totales cuando cambien las líneas
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.lines) {
        let subtotal = 0;
        let vatAmount = 0;

        value.lines.forEach((line) => {
          if (line?.quantity && line?.unitPrice && line?.vatRate) {
            const qty = parseFloat(line.quantity);
            const price = parseFloat(line.unitPrice);
            const vat = parseFloat(line.vatRate);

            const lineSubtotal = qty * price;
            const lineVat = lineSubtotal * (vat / 100);

            subtotal += lineSubtotal;
            vatAmount += lineVat;
          }
        });

        setTotals({
          subtotal: Math.round(subtotal * 100) / 100,
          vatAmount: Math.round(vatAmount * 100) / 100,
          total: Math.round((subtotal + vatAmount) * 100) / 100,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleAddLine = () => {
    append({
      productId: '',
      description: '',
      quantity: '1',
      unitPrice: '0',
      vatRate: '21',
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      form.setValue(`lines.${index}.description`, product.name);
      form.setValue(`lines.${index}.unitPrice`, product.salePrice.toString());
      form.setValue(`lines.${index}.vatRate`, product.vatRate.toString());
    }
  };

  const onSubmit = async (data: FormInput) => {
    try {
      if (data.lines.length === 0) {
        toast.error('Debe agregar al menos una línea a la factura');
        return;
      }

      await createInvoice(data);
      toast.success('Factura creada correctamente');
      router.push('/dashboard/commercial/invoices');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Encabezado de Factura */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Datos de la Factura</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                          {customer.taxId && ` - ${customer.taxId}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pointOfSaleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Punto de Venta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar punto de venta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pointsOfSale.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.number.toString().padStart(4, '0')} - {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voucherType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Comprobante</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(VOUCHER_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Emisión</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            moment(field.value).format('DD/MM/YYYY')
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Vencimiento (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            moment(field.value).format('DD/MM/YYYY')
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Líneas de Factura */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Líneas de Factura</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Línea
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Línea {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`lines.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Producto</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProductSelect(index, value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`lines.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" placeholder="1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`lines.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Unit.</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`lines.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Descripción del producto o servicio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`lines.${index}.vatRate`}
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel>Alícuota IVA (%)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0% (Exento)</SelectItem>
                          <SelectItem value="10.5">10.5%</SelectItem>
                          <SelectItem value="21">21%</SelectItem>
                          <SelectItem value="27">27%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay líneas agregadas. Haga clic en "Agregar Línea" para comenzar.
              </div>
            )}
          </div>
        </Card>

        {/* Totales */}
        {fields.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Totales</h3>
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">
                  ${totals.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span className="font-mono">
                  ${totals.vatAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="font-mono">
                  ${totals.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Notas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (visibles en la factura)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Condiciones de pago, agradecimientos, etc."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Internas (no visibles)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notas para uso interno" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/commercial/invoices')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creando...' : 'Crear Factura'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
