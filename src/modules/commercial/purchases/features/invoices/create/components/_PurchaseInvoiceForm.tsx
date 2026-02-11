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
import { createPurchaseInvoice } from '../../list/actions.server';
import {
  purchaseInvoiceFormSchema,
  VOUCHER_TYPE_LABELS,
  type PurchaseInvoiceFormInput,
} from '../../shared/validators';
import moment from 'moment';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import type { SupplierSelectItem, ProductSelectItem } from '../../list/actions.server';

interface PurchaseInvoiceFormProps {
  suppliers: SupplierSelectItem[];
  products: ProductSelectItem[];
}

export function _PurchaseInvoiceForm({
  suppliers,
  products,
}: PurchaseInvoiceFormProps) {
  const router = useRouter();
  const [totals, setTotals] = useState({ subtotal: 0, vatAmount: 0, total: 0 });

  const form = useForm<PurchaseInvoiceFormInput>({
    resolver: zodResolver(purchaseInvoiceFormSchema),
    defaultValues: {
      supplierId: '',
      voucherType: 'FACTURA_A',
      pointOfSale: '',
      number: '',
      issueDate: new Date(),
      dueDate: undefined,
      cae: '',
      notes: '',
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
          if (line?.quantity && line?.unitCost && line?.vatRate) {
            const qty = parseFloat(line.quantity);
            const cost = parseFloat(line.unitCost);
            const vat = parseFloat(line.vatRate);

            const lineSubtotal = qty * cost;
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

  const onSubmit = async (data: PurchaseInvoiceFormInput) => {
    try {
      const invoice = await createPurchaseInvoice(data);
      toast.success('Factura de compra creada correctamente');
      router.push(`/dashboard/commercial/purchases/${invoice.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al crear la factura'
      );
    }
  };

  const addLine = () => {
    append({
      productId: undefined,
      description: '',
      quantity: '1',
      unitCost: '0',
      vatRate: '21',
    });
  };

  const fillProductData = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    form.setValue(`lines.${index}.description`, product.name);
    form.setValue(`lines.${index}.unitCost`, product.costPrice.toString());
    form.setValue(`lines.${index}.vatRate`, product.vatRate.toString());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del Comprobante */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Datos del Comprobante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proveedor */}
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.tradeName || supplier.businessName} - {supplier.taxId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Comprobante */}
            <FormField
              control={form.control}
              name="voucherType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Comprobante *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
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

            {/* Punto de Venta */}
            <FormField
              control={form.control}
              name="pointOfSale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Punto de Venta *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0001"
                      maxLength={4}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Número */}
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="00000123"
                      maxLength={8}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha de Emisión */}
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Emisión *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            moment(field.value).format('DD/MM/YYYY')
                          ) : (
                            <span>Selecciona una fecha</span>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date('2000-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha de Vencimiento */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            moment(field.value).format('DD/MM/YYYY')
                          ) : (
                            <span>Selecciona una fecha</span>
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

            {/* CAE */}
            <FormField
              control={form.control}
              name="cae"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>CAE (Código de Autorización Electrónica)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Opcional"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observaciones */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Observaciones adicionales..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Líneas de la Factura */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Líneas de la Factura</h3>
            <Button type="button" onClick={addLine} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Línea
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay líneas agregadas. Haz clic en "Agregar Línea" para empezar.
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium">Línea {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Producto (opcional) */}
                  <FormField
                    control={form.control}
                    name={`lines.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Producto</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            fillProductData(index, value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Opcional" />
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

                  {/* Descripción */}
                  <FormField
                    control={form.control}
                    name={`lines.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Descripción *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Descripción del ítem" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cantidad */}
                  <FormField
                    control={form.control}
                    name={`lines.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Costo Unitario */}
                  <FormField
                    control={form.control}
                    name={`lines.${index}.unitCost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Unitario *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Alícuota IVA */}
                  <FormField
                    control={form.control}
                    name={`lines.${index}.vatRate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IVA % *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
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
              </Card>
            ))}
          </div>
        </Card>

        {/* Totales */}
        {fields.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Totales</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA:</span>
                <span className="font-mono">${totals.vatAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="font-mono">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Factura'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
