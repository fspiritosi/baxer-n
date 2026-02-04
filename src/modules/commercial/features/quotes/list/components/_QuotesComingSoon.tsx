'use client';

import { FileText, Clock } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function _QuotesComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Próximamente
          </Badge>
        </div>
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold">Presupuestos</h2>
        <p className="text-muted-foreground">
          Estamos trabajando en un módulo completo para la gestión de presupuestos.
          Pronto podrás crear, enviar y dar seguimiento a tus cotizaciones.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Funcionalidades planificadas</CardTitle>
          <CardDescription>Lo que podrás hacer cuando esté disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Crear presupuestos con productos y servicios
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Enviar presupuestos por email directamente
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Seguimiento de estado (enviado, aceptado, rechazado)
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Convertir presupuestos en pedidos
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Reportes y análisis de conversión
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
