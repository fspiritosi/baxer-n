'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';

import { updateCompanySingleMode } from '../actions.server';

interface SingleModeToggleProps {
  companyId: string;
  isSingleCompany: boolean;
  isOwner: boolean;
}

/**
 * Toggle para activar/desactivar el modo Single Company
 * Solo visible en modo DEV y para owners
 */
export function _SingleModeToggle({ companyId, isSingleCompany, isOwner }: SingleModeToggleProps) {
  const router = useRouter();
  const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true';

  const mutation = useMutation({
    mutationFn: (newValue: boolean) => updateCompanySingleMode(companyId, newValue),
    onSuccess: () => {
      toast.success(
        isSingleCompany
          ? 'Modo multi-empresa activado'
          : 'Modo empresa única activado'
      );
      router.refresh();
    },
    onError: () => {
      toast.error('Error al cambiar el modo');
    },
  });

  // Solo mostrar en DEV y si es owner
  if (!isDev || !isOwner) {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Modo Empresa Única</CardTitle>
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300"
          >
            DEV
          </Badge>
        </div>
        <CardDescription>
          Cuando está activo, los usuarios de esta empresa no verán el selector de empresas
          (solo aplica si tienen acceso únicamente a esta empresa)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="single-mode" className="flex flex-col gap-1">
            <span>Empresa única</span>
            <span className="font-normal text-xs text-muted-foreground">
              {isSingleCompany
                ? 'El selector de empresas está oculto'
                : 'El selector de empresas está visible'}
            </span>
          </Label>
          <div className="flex items-center gap-2">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch
              id="single-mode"
              checked={isSingleCompany}
              onCheckedChange={(checked) => mutation.mutate(checked)}
              disabled={mutation.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
