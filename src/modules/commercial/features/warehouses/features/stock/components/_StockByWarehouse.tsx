'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ArrowLeftRight, Package, Settings } from 'lucide-react';
import type { Warehouse, WarehouseStock } from '../../../shared/types';
import { AdjustStockDialog } from './_AdjustStockDialog';
import { TransferStockDialog } from './_TransferStockDialog';
import { getWarehouseStocks } from '../../list/actions.server';
import { useQuery } from '@tanstack/react-query';

interface StockByWarehouseProps {
  warehouses: Warehouse[];
  defaultWarehouse?: Warehouse;
  defaultStock: WarehouseStock[];
}

export function StockByWarehouse({
  warehouses,
  defaultWarehouse,
  defaultStock,
}: StockByWarehouseProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    defaultWarehouse?.id || ''
  );
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<WarehouseStock | null>(null);

  const { data: stocks = defaultStock } = useQuery({
    queryKey: ['warehouse-stocks', selectedWarehouseId],
    queryFn: () => getWarehouseStocks(selectedWarehouseId),
    enabled: Boolean(selectedWarehouseId),
    initialData: selectedWarehouseId === defaultWarehouse?.id ? defaultStock : undefined,
  });

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  const handleAdjustClick = (stock: WarehouseStock) => {
    setSelectedStock(stock);
    setAdjustDialogOpen(true);
  };

  const handleTransferClick = (stock: WarehouseStock) => {
    setSelectedStock(stock);
    setTransferDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Warehouse Selector */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un almacén" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  <div className="flex items-center gap-2">
                    <span>{warehouse.name}</span>
                    <span className="text-muted-foreground">({warehouse.code})</span>
                    {!warehouse.isActive && (
                      <Badge variant="secondary" className="ml-2">Inactivo</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedWarehouse && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {stocks.length} producto{stocks.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* Stock Table */}
      {selectedWarehouseId ? (
        stocks.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Reservado</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => {
                  const product = stock.product;
                  const minStock = product?.minStock || 0;
                  const isBelowMin = stock.availableQty < minStock;

                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-mono text-sm">
                        {product?.code || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product?.name || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product?.unitOfMeasure || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {stock.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-600">
                        {stock.reservedQty.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {stock.availableQty.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {isBelowMin ? (
                          <Badge variant="destructive">
                            Bajo mínimo ({minStock})
                          </Badge>
                        ) : stock.availableQty === 0 ? (
                          <Badge variant="secondary">Sin stock</Badge>
                        ) : (
                          <Badge variant="default">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustClick(stock)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Ajustar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransferClick(stock)}
                          >
                            <ArrowLeftRight className="h-4 w-4 mr-1" />
                            Transferir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay stock en este almacén</p>
            <p className="text-sm text-muted-foreground">
              El almacén está vacío o no tiene productos registrados
            </p>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center py-12 text-muted-foreground border rounded-md">
          Selecciona un almacén para ver su stock
        </div>
      )}

      {/* Dialogs */}
      {selectedStock && (
        <>
          <AdjustStockDialog
            open={adjustDialogOpen}
            onOpenChange={setAdjustDialogOpen}
            stock={selectedStock}
            warehouseId={selectedWarehouseId}
          />
          <TransferStockDialog
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
            stock={selectedStock}
            warehouses={warehouses.filter(w => w.id !== selectedWarehouseId && w.isActive)}
            fromWarehouseId={selectedWarehouseId}
          />
        </>
      )}
    </div>
  );
}
