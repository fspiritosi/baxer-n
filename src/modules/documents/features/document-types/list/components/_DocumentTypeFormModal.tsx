'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Truck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Gender, CostType, type DocumentAppliesTo } from '@/generated/prisma/enums';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

import {
  createDocumentType,
  type DocumentTypeListItem,
  updateDocumentType,
  getDocumentTypeWithConditions,
} from '../actions.server';
import { _ConditionsSection, type ConditionsState } from './_ConditionsSection';

// ============================================
// SCHEMA
// ============================================

const documentTypeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  appliesTo: z.enum(['EMPLOYEE', 'EQUIPMENT', 'COMPANY']),
  isMandatory: z.boolean(),
  hasExpiration: z.boolean(),
  isMonthly: z.boolean(),
  isPrivate: z.boolean(),
  isTermination: z.boolean(),
  isMultiResource: z.boolean(),
  description: z.string().optional(),
});

type DocumentTypeFormData = z.infer<typeof documentTypeSchema>;

// Estado inicial de condiciones
const initialConditions: ConditionsState = {
  jobPositionIds: [],
  contractTypeIds: [],
  jobCategoryIds: [],
  unionIds: [],
  collectiveAgreementIds: [],
  genders: [],
  costTypes: [],
  vehicleBrandIds: [],
  vehicleTypeIds: [],
};

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType?: DocumentTypeListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _DocumentTypeFormModal({ open, onOpenChange, documentType }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!documentType;

  // Estado para condiciones
  const [isConditional, setIsConditional] = useState(false);
  const [conditions, setConditions] = useState<ConditionsState>(initialConditions);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentTypeFormData>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: {
      name: '',
      appliesTo: 'EMPLOYEE',
      isMandatory: false,
      hasExpiration: false,
      isMonthly: false,
      isPrivate: false,
      isTermination: false,
      isMultiResource: false,
      description: '',
    },
  });

  // Query para cargar condiciones al editar
  const { data: documentTypeWithConditions, isLoading: isLoadingConditions } = useQuery({
    queryKey: ['documentType', 'conditions', documentType?.id],
    queryFn: () => getDocumentTypeWithConditions(documentType!.id),
    enabled: open && isEditing && !!documentType?.id,
    staleTime: 0,
  });

  // Reset form cuando cambia documentType o se abre el modal
  useEffect(() => {
    if (open) {
      if (documentType) {
        reset({
          name: documentType.name,
          appliesTo: documentType.appliesTo,
          isMandatory: documentType.isMandatory,
          hasExpiration: documentType.hasExpiration,
          isMonthly: documentType.isMonthly,
          isPrivate: documentType.isPrivate,
          isTermination: documentType.isTermination,
          isMultiResource: documentType.isMultiResource,
          description: documentType.description ?? '',
        });
      } else {
        reset({
          name: '',
          appliesTo: 'EMPLOYEE',
          isMandatory: false,
          hasExpiration: false,
          isMonthly: false,
          isPrivate: false,
          isTermination: false,
          isMultiResource: false,
          description: '',
        });
        // Reset condiciones para nuevo documento
        setIsConditional(false);
        setConditions(initialConditions);
      }
    }
  }, [open, documentType, reset]);

  // Watch appliesTo para usarlo en el componente
  const appliesTo = watch('appliesTo');

  // Reset isMultiResource cuando appliesTo cambia a COMPANY
  useEffect(() => {
    if (appliesTo === 'COMPANY') {
      setValue('isMultiResource', false);
    }
  }, [appliesTo, setValue]);

  // Cargar condiciones cuando se obtienen del servidor
  useEffect(() => {
    if (documentTypeWithConditions) {
      setIsConditional(documentTypeWithConditions.isConditional);
      setConditions({
        jobPositionIds: documentTypeWithConditions.conditionJobPositions.map((c) => c.jobPositionId),
        contractTypeIds: documentTypeWithConditions.conditionContractTypes.map((c) => c.contractTypeId),
        jobCategoryIds: documentTypeWithConditions.conditionJobCategories.map((c) => c.jobCategoryId),
        unionIds: documentTypeWithConditions.conditionUnions.map((c) => c.unionId),
        collectiveAgreementIds: documentTypeWithConditions.conditionCollectiveAgreements.map(
          (c) => c.collectiveAgreementId
        ),
        genders: documentTypeWithConditions.genders as Gender[],
        costTypes: documentTypeWithConditions.costTypes as CostType[],
        vehicleBrandIds: documentTypeWithConditions.conditionVehicleBrands.map((c) => c.vehicleBrandId),
        vehicleTypeIds: documentTypeWithConditions.conditionVehicleTypes.map((c) => c.vehicleTypeId),
      });
    }
  }, [documentTypeWithConditions]);

  const createMutation = useMutation({
    mutationFn: createDocumentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      toast.success('Tipo de documento creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear tipo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateDocumentType>[1]) =>
      updateDocumentType(documentType!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      toast.success('Tipo de documento actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar tipo');
    },
  });

  const onSubmit = (data: DocumentTypeFormData) => {
    // Construir payload con condiciones
    const conditionsPayload = {
      isConditional,
      conditions: isConditional ? conditions : initialConditions,
    };

    if (isEditing) {
      updateMutation.mutate({ ...data, ...conditionsPayload });
    } else {
      createMutation.mutate({ ...data, ...conditionsPayload });
    }
  };

  // Manejar cambios en condiciones
  const handleConditionsChange = (newConditions: Partial<ConditionsState>) => {
    setConditions((prev) => ({ ...prev, ...newConditions }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] flex-col sm:max-w-[600px]"
        data-testid="document-type-form-modal"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {isEditing ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del tipo de documento'
                : 'Configura un nuevo tipo de documento para tu empresa'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid gap-4 pr-2">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Licencia de conducir"
                data-testid="document-type-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="document-type-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Aplica a */}
            <div className="space-y-2">
              <Label>Aplica a *</Label>
              <Select
                value={watch('appliesTo')}
                onValueChange={(value) => setValue('appliesTo', value as DocumentAppliesTo)}
              >
                <SelectTrigger data-testid="document-type-applies-to-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Empleados
                    </div>
                  </SelectItem>
                  <SelectItem value="EQUIPMENT">
                    <div className="flex items-center">
                      <Truck className="mr-2 h-4 w-4" />
                      Equipos
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPANY">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      Empresa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opciones */}
            <div className="space-y-3">
              <Label>Opciones</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMandatory"
                    checked={watch('isMandatory')}
                    onCheckedChange={(checked) => setValue('isMandatory', checked === true)}
                    data-testid="document-type-mandatory-checkbox"
                  />
                  <Label htmlFor="isMandatory" className="font-normal text-sm">
                    Es obligatorio
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasExpiration"
                    checked={watch('hasExpiration')}
                    onCheckedChange={(checked) => setValue('hasExpiration', checked === true)}
                    data-testid="document-type-expiration-checkbox"
                  />
                  <Label htmlFor="hasExpiration" className="font-normal text-sm">
                    Tiene vencimiento
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMonthly"
                    checked={watch('isMonthly')}
                    onCheckedChange={(checked) => setValue('isMonthly', checked === true)}
                    data-testid="document-type-monthly-checkbox"
                  />
                  <Label htmlFor="isMonthly" className="font-normal text-sm">
                    Es mensual
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrivate"
                    checked={watch('isPrivate')}
                    onCheckedChange={(checked) => setValue('isPrivate', checked === true)}
                    data-testid="document-type-private-checkbox"
                  />
                  <Label htmlFor="isPrivate" className="font-normal text-sm">
                    Es privado
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTermination"
                    checked={watch('isTermination')}
                    onCheckedChange={(checked) => setValue('isTermination', checked === true)}
                    data-testid="document-type-termination-checkbox"
                  />
                  <Label htmlFor="isTermination" className="font-normal text-sm">
                    Documento de baja
                  </Label>
                </div>

                {appliesTo !== 'COMPANY' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isMultiResource"
                      checked={watch('isMultiResource')}
                      onCheckedChange={(checked) => setValue('isMultiResource', checked === true)}
                      data-testid="document-type-multi-resource-checkbox"
                    />
                    <Label htmlFor="isMultiResource" className="font-normal text-sm">
                      Es multirrecurso (cubre a todos)
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción opcional"
                rows={2}
                data-testid="document-type-description-input"
              />
            </div>

            {/* Sección de Condiciones */}
            <_ConditionsSection
              appliesTo={appliesTo}
              isConditional={isConditional}
              onIsConditionalChange={setIsConditional}
              conditions={conditions}
              onConditionsChange={handleConditionsChange}
              disabled={isPending || isLoadingConditions}
            />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-testid="document-type-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="document-type-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
