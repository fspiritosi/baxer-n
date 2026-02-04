'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Briefcase, Phone, User, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { _PhotoUpload } from '@/shared/components/_PhotoUpload';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

// Actions
import { updateEmployee, type EmployeeForEdit } from '../../edit/actions.server';
import { createEmployee } from '../actions.server';

// Actions for AutoFill (used with queryClient.fetchQuery)
import { getCollectiveAgreementsByUnion } from '@/modules/company/features/collective-agreements';
import { getJobCategoriesByAgreement } from '@/modules/company/features/job-categories';
import { getCitiesByProvince } from '@/shared/actions/geography';

// Catalog Hooks
import {
  useContractTypes,
  useJobPositions,
  useCostCenters,
  useUnions,
  useCollectiveAgreementsByUnion,
  useJobCategoriesByAgreement,
  useCountries,
  useProvinces,
  useCitiesByProvince,
} from '@/shared/hooks';

// ============================================
// SCHEMA DE VALIDACIÓN
// ============================================

const employeeSchema = z.object({
  // Datos Personales (Tab 1)
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  identityDocumentType: z.enum(['DNI', 'LE', 'LC', 'PASSPORT']),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  cuil: z.string().min(11, 'El CUIL debe tener al menos 11 caracteres'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  nationalityId: z.string().min(1, 'La nacionalidad es requerida'),
  gender: z.enum(['MALE', 'FEMALE', 'NOT_DECLARED']),
  maritalStatus: z
    .enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'DOMESTIC_PARTNERSHIP'])
    .optional(),
  educationLevel: z
    .enum(['PRIMARY', 'SECONDARY', 'TERTIARY', 'UNIVERSITY', 'POSTGRADUATE'])
    .optional(),

  // Datos de Contacto (Tab 2)
  street: z.string().min(1, 'La calle es requerida'),
  streetNumber: z.string().min(1, 'La altura es requerida'),
  provinceId: z.string().min(1, 'La provincia es requerida'),
  cityId: z.string().min(1, 'La ciudad es requerida'),
  postalCode: z.string().min(1, 'El código postal es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),

  // Datos Laborales (Tab 3)
  employeeNumber: z.string().min(1, 'El legajo es requerido'),
  hireDate: z.string().min(1, 'La fecha de ingreso es requerida'),
  jobPositionId: z.string().optional(),
  contractTypeId: z.string().optional(),
  workingHoursPerDay: z.string().optional(),
  unionId: z.string().optional(),
  agreementId: z.string().optional(),
  jobCategoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  costType: z.enum(['DIRECT', 'INDIRECT']).optional(),
  unionAffiliationStatus: z.enum(['AFFILIATED', 'NOT_AFFILIATED']).optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

// Campos por tab para validación de errores
const personalDataFields: (keyof EmployeeFormData)[] = [
  'firstName',
  'lastName',
  'identityDocumentType',
  'documentNumber',
  'cuil',
  'birthDate',
  'nationalityId',
  'gender',
  'maritalStatus',
  'educationLevel',
];

const contactDataFields: (keyof EmployeeFormData)[] = [
  'street',
  'streetNumber',
  'provinceId',
  'cityId',
  'postalCode',
  'phone',
  'email',
];

const workDataFields: (keyof EmployeeFormData)[] = [
  'employeeNumber',
  'hireDate',
  'jobPositionId',
  'contractTypeId',
  'workingHoursPerDay',
  'unionId',
  'agreementId',
  'jobCategoryId',
  'costCenterId',
  'costType',
  'unionAffiliationStatus',
];

interface Props {
  initialData?: EmployeeForEdit;
  nextEmployeeNumber?: string;
}

export function _EmployeeForm({
  initialData,
  nextEmployeeNumber,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  const [activeTab, setActiveTab] = useState('personal');
  const [photoKey, setPhotoKey] = useState<string | null>(initialData?.pictureKey ?? null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.pictureUrl ?? null);
  const isAutoFilling = useRef(false); // Flag para evitar reset durante autoFill
  const isInitialMount = useRef(true); // Flag para detectar carga inicial vs cambios del usuario

  const handlePhotoChange = (key: string | null, url: string | null) => {
    setPhotoKey(key);
    setPhotoUrl(url);
  };

  // ============================================
  // CATALOG HOOKS (Client-side fetching)
  // ============================================
  const { data: contractTypes = [], isLoading: loadingContractTypes } = useContractTypes();
  const { data: jobPositions = [], isLoading: loadingJobPositions } = useJobPositions();
  const { data: costCenters = [], isLoading: loadingCostCenters } = useCostCenters();
  const { data: unions = [], isLoading: loadingUnions } = useUnions();
  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      // Datos Personales
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      identityDocumentType: initialData?.identityDocumentType ?? 'DNI',
      documentNumber: initialData?.documentNumber ?? '',
      cuil: initialData?.cuil ?? '',
      birthDate: initialData?.birthDate
        ? new Date(initialData.birthDate).toISOString().split('T')[0]
        : '',
      nationalityId: initialData?.nationalityId?.toString() ?? '',
      gender: initialData?.gender ?? 'MALE',
      maritalStatus: initialData?.maritalStatus ?? undefined,
      educationLevel: initialData?.educationLevel ?? undefined,

      // Datos de Contacto
      street: initialData?.street ?? '',
      streetNumber: initialData?.streetNumber ?? '',
      provinceId: initialData?.provinceId?.toString() ?? '',
      cityId: initialData?.cityId?.toString() ?? '',
      postalCode: initialData?.postalCode ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',

      // Datos Laborales
      employeeNumber: initialData?.employeeNumber ?? nextEmployeeNumber ?? '',
      hireDate: initialData?.hireDate
        ? new Date(initialData.hireDate).toISOString().split('T')[0]
        : '',
      jobPositionId: initialData?.jobPositionId ?? '',
      contractTypeId: initialData?.contractTypeId ?? '',
      workingHoursPerDay: initialData?.workingHoursPerDay?.toString() ?? '',
      unionId: initialData?.jobCategory?.agreement?.union?.id ?? '',
      agreementId: initialData?.jobCategory?.agreement?.id ?? '',
      jobCategoryId: initialData?.jobCategoryId ?? '',
      costCenterId: initialData?.costCenterId ?? '',
      costType: initialData?.costType ?? undefined,
      unionAffiliationStatus: initialData?.unionAffiliationStatus ?? undefined,
    },
  });

  const provinceId = watch('provinceId');
  const unionId = watch('unionId');
  const agreementId = watch('agreementId');

  // ============================================
  // CASCADING SELECTS (using catalog hooks)
  // ============================================

  const provinceIdNum = provinceId ? parseInt(provinceId, 10) : NaN;
  const { data: cities = [], isLoading: loadingCities } = useCitiesByProvince(
    !isNaN(provinceIdNum) ? provinceIdNum : null
  );

  const { data: agreements = [], isLoading: loadingAgreements } = useCollectiveAgreementsByUnion(
    unionId || null
  );

  const { data: categories = [], isLoading: loadingCategories } = useJobCategoriesByAgreement(
    agreementId || null
  );

  // Marcar fin de carga inicial después del primer render
  useEffect(() => {
    // Pequeño delay para asegurar que los valores iniciales se establecieron
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Solo resetear si NO es la carga inicial y NO es autoFill
    if (!isInitialMount.current && !isAutoFilling.current && provinceId) {
      setValue('cityId', '');
    }
  }, [provinceId, setValue]);

  useEffect(() => {
    // Solo resetear si NO es la carga inicial y NO es autoFill
    if (!isInitialMount.current && !isAutoFilling.current && unionId) {
      setValue('agreementId', '');
      setValue('jobCategoryId', '');
    }
  }, [unionId, setValue]);

  useEffect(() => {
    // Solo resetear si NO es la carga inicial y NO es autoFill
    if (!isInitialMount.current && !isAutoFilling.current && agreementId) {
      setValue('jobCategoryId', '');
    }
  }, [agreementId, setValue]);

  // ============================================
  // TAB ERROR TRACKING
  // ============================================

  const hasPersonalErrors = personalDataFields.some((field) => !!errors[field]);
  const hasContactErrors = contactDataFields.some((field) => !!errors[field]);
  const hasWorkErrors = workDataFields.some((field) => !!errors[field]);

  // ============================================
  // MUTATIONS
  // ============================================

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Empleado creado exitosamente');
      router.push('/dashboard/employees');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear empleado');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateEmployee>[1]) =>
      updateEmployee(initialData!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Empleado actualizado exitosamente');
      // Redirigir al detalle del empleado recién editado
      router.push(`/dashboard/employees/${initialData!.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar empleado');
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    const payload = {
      employeeNumber: data.employeeNumber,
      identityDocumentType: data.identityDocumentType as 'DNI' | 'LE' | 'LC' | 'PASSPORT',
      documentNumber: data.documentNumber,
      cuil: data.cuil,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender || null,
      maritalStatus: data.maritalStatus || null,
      educationLevel: data.educationLevel || null,
      nationalityId: data.nationalityId ? parseInt(data.nationalityId, 10) : null,
      phone: data.phone,
      email: data.email || null,
      street: data.street,
      streetNumber: data.streetNumber,
      postalCode: data.postalCode || null,
      provinceId: parseInt(data.provinceId, 10),
      cityId: data.cityId ? parseInt(data.cityId, 10) : null,
      hireDate: new Date(data.hireDate),
      workingHoursPerDay: data.workingHoursPerDay ? parseInt(data.workingHoursPerDay, 10) : null,
      unionAffiliationStatus: data.unionAffiliationStatus || null,
      costType: data.costType || null,
      jobPositionId: data.jobPositionId || null,
      contractTypeId: data.contractTypeId || null,
      jobCategoryId: data.jobCategoryId || null,
      costCenterId: data.costCenterId || null,
      // Solo guardamos pictureKey - la URL se genera dinámicamente al consultar
      pictureKey: photoKey,
      pictureUrl: null, // No guardamos URLs presigned que expiran
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const onError = () => {
    if (hasPersonalErrors) {
      setActiveTab('personal');
    } else if (hasContactErrors) {
      setActiveTab('contact');
    } else if (hasWorkErrors) {
      setActiveTab('work');
    }
    toast.error('Por favor, corrige los errores en el formulario');
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ============================================
  // AUTO-FILL (Solo en desarrollo)
  // ============================================
  const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true';

  // Función para remover acentos de un string
  const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const handleAutoFill = async () => {
    // Activar flag para evitar que los useEffect reseteen valores
    isAutoFilling.current = true;

    // Generar datos fake
    const randomNum = Math.floor(Math.random() * 90000000) + 10000000;
    const randomCuil = `20${randomNum}${Math.floor(Math.random() * 10)}`;
    const nombres = [
      'Juan',
      'María',
      'Carlos',
      'Ana',
      'Pedro',
      'Laura',
      'Diego',
      'Sofía',
      'Martín',
      'Lucía',
    ];
    const apellidos = [
      'García',
      'Rodríguez',
      'Martínez',
      'López',
      'González',
      'Fernández',
      'Pérez',
      'Sánchez',
      'Romero',
      'Torres',
    ];
    const calles = [
      'Av. Corrientes',
      'Av. Santa Fe',
      'Av. Rivadavia',
      'Calle San Martín',
      'Calle Belgrano',
      'Av. Libertador',
    ];

    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    const calle = calles[Math.floor(Math.random() * calles.length)];

    // Generar fecha de nacimiento (entre 20 y 60 años)
    const today = new Date();
    const minAge = 20;
    const maxAge = 60;
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const birthYear = today.getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;

    // Generar fecha de ingreso (últimos 5 años)
    const hireYear = today.getFullYear() - Math.floor(Math.random() * 5);
    const hireMonth = Math.floor(Math.random() * 12) + 1;
    const hireDay = Math.floor(Math.random() * 28) + 1;
    const hireDate = `${hireYear}-${hireMonth.toString().padStart(2, '0')}-${hireDay.toString().padStart(2, '0')}`;

    // Datos personales
    setValue('firstName', nombre);
    setValue('lastName', apellido);
    setValue('identityDocumentType', 'DNI');
    setValue('documentNumber', randomNum.toString());
    setValue('cuil', randomCuil);
    setValue('birthDate', birthDate);
    setValue(
      'gender',
      ['MALE', 'FEMALE', 'NOT_DECLARED'][Math.floor(Math.random() * 3)] as
        | 'MALE'
        | 'FEMALE'
        | 'NOT_DECLARED'
    );
    setValue(
      'maritalStatus',
      ['SINGLE', 'MARRIED', 'DIVORCED'][
        Math.floor(Math.random() * 3)
      ] as EmployeeFormData['maritalStatus']
    );
    setValue(
      'educationLevel',
      ['PRIMARY', 'SECONDARY', 'TERTIARY', 'UNIVERSITY'][
        Math.floor(Math.random() * 4)
      ] as EmployeeFormData['educationLevel']
    );

    // Nacionalidad (Argentina - asumimos que tiene id 9 o buscamos el primero)
    const argentina = countries.find((c) => c.name === 'Argentina') || countries[0];
    if (argentina) {
      setValue('nationalityId', argentina.id.toString());
    }

    // Datos de contacto
    setValue('street', calle);
    setValue('streetNumber', Math.floor(Math.random() * 5000 + 100).toString());
    setValue('postalCode', `C${Math.floor(Math.random() * 9000 + 1000)}ABC`);
    setValue('phone', `11${Math.floor(Math.random() * 90000000 + 10000000)}`);

    // Email sin acentos para que sea válido
    const emailNombre = removeAccents(nombre.toLowerCase());
    const emailApellido = removeAccents(apellido.toLowerCase());
    setValue('email', `${emailNombre}.${emailApellido}@ejemplo.com`);

    // Provincia (Capital Federal - id 3)
    const capitalFederal = provinces.find((p) => p.name === 'Capital Federal') || provinces[0];
    if (capitalFederal) {
      setValue('provinceId', capitalFederal.id.toString());

      // Esperar a que se carguen las ciudades y seleccionar la primera
      try {
        const citiesData = await queryClient.fetchQuery({
          queryKey: ['cities', 'byProvince', capitalFederal.id.toString()],
          queryFn: () => getCitiesByProvince(capitalFederal.id),
        });
        if (citiesData && citiesData.length > 0) {
          setValue('cityId', citiesData[0].id.toString());
        }
      } catch {
        // Si falla, el usuario puede seleccionar manualmente
      }
    }

    // Datos laborales
    setValue('hireDate', hireDate);
    setValue('workingHoursPerDay', '8');
    setValue('unionAffiliationStatus', 'NOT_AFFILIATED');
    setValue('costType', 'DIRECT');

    // Seleccionar primer puesto y tipo de contrato si existen
    if (jobPositions.length > 0) {
      setValue('jobPositionId', jobPositions[0].id);
    }
    if (contractTypes.length > 0) {
      setValue('contractTypeId', contractTypes[0].id);
    }
    if (costCenters.length > 0) {
      setValue('costCenterId', costCenters[0].id);
    }

    // Sindicato, Convenio y Categoría (cascada)
    if (unions.length > 0) {
      const selectedUnion = unions[0];
      setValue('unionId', selectedUnion.id);

      try {
        // Cargar convenios del sindicato seleccionado
        const agreementsData = await queryClient.fetchQuery({
          queryKey: ['collectiveAgreements', 'byUnion', selectedUnion.id],
          queryFn: () => getCollectiveAgreementsByUnion(selectedUnion.id),
        });

        if (agreementsData && agreementsData.length > 0) {
          const selectedAgreement = agreementsData[0];
          setValue('agreementId', selectedAgreement.id);

          // Cargar categorías del convenio seleccionado
          const categoriesData = await queryClient.fetchQuery({
            queryKey: ['jobCategories', 'byAgreement', selectedAgreement.id],
            queryFn: () => getJobCategoriesByAgreement(selectedAgreement.id),
          });

          if (categoriesData && categoriesData.length > 0) {
            setValue('jobCategoryId', categoriesData[0].id);
          }
        }
      } catch {
        // Si falla, el usuario puede seleccionar manualmente
      }
    }

    // Desactivar flag después de un pequeño delay para asegurar que los useEffect no interfieran
    setTimeout(() => {
      isAutoFilling.current = false;
    }, 100);

    toast.success('Formulario auto-completado con datos de prueba');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      {/* Botón de auto-rellenar (solo en desarrollo) */}
      {isDev && !isEditing && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300"
          >
            DEV
          </Badge>
          <span className="text-sm text-amber-700 dark:text-amber-300">Modo desarrollo</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            className="ml-auto gap-2 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
          >
            <Wand2 className="h-4 w-4" />
            Auto-rellenar
          </Button>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        data-testid="employee-form-tabs"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="personal"
            className="relative gap-2"
            data-testid="employee-tab-personal"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Datos Personales</span>
            <span className="sm:hidden">Personal</span>
            {hasPersonalErrors && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                <AlertCircle className="h-3 w-3" />
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="relative gap-2"
            data-testid="employee-tab-contact"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Datos de Contacto</span>
            <span className="sm:hidden">Contacto</span>
            {hasContactErrors && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                <AlertCircle className="h-3 w-3" />
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="work" className="relative gap-2" data-testid="employee-tab-work">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Datos Laborales</span>
            <span className="sm:hidden">Laboral</span>
            {hasWorkErrors && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                <AlertCircle className="h-3 w-3" />
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* TAB 1: DATOS PERSONALES */}
        {/* ============================================ */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
              <CardDescription>
                Información personal y de identificación del empleado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Foto de perfil */}
              <div className="mb-6 flex justify-center">
                <_PhotoUpload
                  currentPhotoUrl={photoUrl}
                  currentPhotoKey={photoKey}
                  onPhotoChange={handlePhotoChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    data-testid="employee-firstname-input"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    data-testid="employee-lastname-input"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>

                {/* Tipo de Documento */}
                <div className="space-y-2">
                  <Label htmlFor="identityDocumentType">Tipo de Documento *</Label>
                  <Select
                    value={watch('identityDocumentType')}
                    onValueChange={(value) =>
                      setValue('identityDocumentType', value as 'DNI' | 'LE' | 'LC' | 'PASSPORT')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="LE">Libreta de Enrolamiento</SelectItem>
                      <SelectItem value="LC">Libreta Cívica</SelectItem>
                      <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de Documento */}
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de Documento *</Label>
                  <Input
                    id="documentNumber"
                    data-testid="employee-document-input"
                    {...register('documentNumber')}
                  />
                  {errors.documentNumber && (
                    <p className="text-sm text-destructive">{errors.documentNumber.message}</p>
                  )}
                </div>

                {/* CUIL */}
                <div className="space-y-2">
                  <Label htmlFor="cuil">CUIL *</Label>
                  <Input
                    id="cuil"
                    data-testid="employee-cuil-input"
                    placeholder="XX-XXXXXXXX-X"
                    {...register('cuil')}
                  />
                  {errors.cuil && <p className="text-sm text-destructive">{errors.cuil.message}</p>}
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                  <Input
                    id="birthDate"
                    data-testid="employee-birthdate-input"
                    type="date"
                    {...register('birthDate')}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-destructive">{errors.birthDate.message}</p>
                  )}
                </div>

                {/* Nacionalidad */}
                <div className="space-y-2">
                  <Label htmlFor="nationalityId">Nacionalidad *</Label>
                  <Select
                    value={watch('nationalityId') || ''}
                    onValueChange={(value) => setValue('nationalityId', value)}
                    disabled={loadingCountries}
                  >
                    <SelectTrigger data-testid="employee-nationality-select">
                      <SelectValue placeholder={loadingCountries ? 'Cargando...' : 'Seleccionar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.nationalityId && (
                    <p className="text-sm text-destructive">{errors.nationalityId.message}</p>
                  )}
                </div>

                {/* Género */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select
                    value={watch('gender') || ''}
                    onValueChange={(value) =>
                      setValue('gender', value as 'MALE' | 'FEMALE' | 'NOT_DECLARED')
                    }
                  >
                    <SelectTrigger data-testid="employee-gender-select">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Masculino</SelectItem>
                      <SelectItem value="FEMALE">Femenino</SelectItem>
                      <SelectItem value="NOT_DECLARED">No declarado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>

                {/* Estado Civil */}
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Estado Civil</Label>
                  <Select
                    value={watch('maritalStatus') || ''}
                    onValueChange={(value) =>
                      setValue('maritalStatus', value as EmployeeFormData['maritalStatus'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Soltero/a</SelectItem>
                      <SelectItem value="MARRIED">Casado/a</SelectItem>
                      <SelectItem value="DIVORCED">Divorciado/a</SelectItem>
                      <SelectItem value="WIDOWED">Viudo/a</SelectItem>
                      <SelectItem value="SEPARATED">Separado/a</SelectItem>
                      <SelectItem value="DOMESTIC_PARTNERSHIP">Concubinato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nivel de Estudios */}
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Nivel de Estudios</Label>
                  <Select
                    value={watch('educationLevel') || ''}
                    onValueChange={(value) =>
                      setValue('educationLevel', value as EmployeeFormData['educationLevel'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIMARY">Primario</SelectItem>
                      <SelectItem value="SECONDARY">Secundario</SelectItem>
                      <SelectItem value="TERTIARY">Terciario</SelectItem>
                      <SelectItem value="UNIVERSITY">Universitario</SelectItem>
                      <SelectItem value="POSTGRADUATE">Posgrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* TAB 2: DATOS DE CONTACTO */}
        {/* ============================================ */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
              <CardDescription>Dirección y datos de contacto del empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Calle */}
                <div className="space-y-2">
                  <Label htmlFor="street">Calle *</Label>
                  <Input id="street" data-testid="employee-street-input" {...register('street')} />
                  {errors.street && (
                    <p className="text-sm text-destructive">{errors.street.message}</p>
                  )}
                </div>

                {/* Altura */}
                <div className="space-y-2">
                  <Label htmlFor="streetNumber">Altura *</Label>
                  <Input
                    id="streetNumber"
                    data-testid="employee-streetnumber-input"
                    {...register('streetNumber')}
                  />
                  {errors.streetNumber && (
                    <p className="text-sm text-destructive">{errors.streetNumber.message}</p>
                  )}
                </div>

                {/* Provincia */}
                <div className="space-y-2">
                  <Label htmlFor="provinceId">Provincia *</Label>
                  <Select
                    value={watch('provinceId') || ''}
                    onValueChange={(value) => setValue('provinceId', value)}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingProvinces ? 'Cargando...' : 'Seleccionar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id.toString()}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provinceId && (
                    <p className="text-sm text-destructive">{errors.provinceId.message}</p>
                  )}
                </div>

                {/* Ciudad */}
                <div className="space-y-2">
                  <Label htmlFor="cityId">Ciudad *</Label>
                  <Select
                    value={watch('cityId') || ''}
                    onValueChange={(value) => setValue('cityId', value)}
                    disabled={!provinceId || loadingCities}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingCities
                            ? 'Cargando ciudades...'
                            : !provinceId
                              ? 'Seleccione provincia'
                              : 'Seleccionar'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cityId && (
                    <p className="text-sm text-destructive">{errors.cityId.message}</p>
                  )}
                </div>

                {/* Código Postal */}
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    data-testid="employee-postalcode-input"
                    {...register('postalCode')}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" data-testid="employee-phone-input" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* TAB 3: DATOS LABORALES */}
        {/* ============================================ */}
        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>Datos Laborales</CardTitle>
              <CardDescription>Información laboral y contractual del empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Legajo */}
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">Legajo *</Label>
                  <Input
                    id="employeeNumber"
                    data-testid="employee-number-input"
                    {...register('employeeNumber')}
                  />
                  {errors.employeeNumber && (
                    <p className="text-sm text-destructive">{errors.employeeNumber.message}</p>
                  )}
                </div>

                {/* Fecha de Ingreso */}
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Fecha de Ingreso *</Label>
                  <Input
                    id="hireDate"
                    data-testid="employee-hiredate-input"
                    type="date"
                    {...register('hireDate')}
                  />
                  {errors.hireDate && (
                    <p className="text-sm text-destructive">{errors.hireDate.message}</p>
                  )}
                </div>

                {/* Puesto de Trabajo */}
                <div className="space-y-2">
                  <Label htmlFor="jobPositionId">Puesto de Trabajo</Label>
                  <Select
                    value={watch('jobPositionId') || ''}
                    onValueChange={(value) => setValue('jobPositionId', value)}
                    disabled={loadingJobPositions}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingJobPositions ? 'Cargando...' : 'Seleccionar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {jobPositions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Contrato */}
                <div className="space-y-2">
                  <Label htmlFor="contractTypeId">Tipo de Contrato</Label>
                  <Select
                    value={watch('contractTypeId') || ''}
                    onValueChange={(value) => setValue('contractTypeId', value)}
                    disabled={loadingContractTypes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingContractTypes ? 'Cargando...' : 'Seleccionar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Horas Diarias */}
                <div className="space-y-2">
                  <Label htmlFor="workingHoursPerDay">Horas Diarias</Label>
                  <Input
                    id="workingHoursPerDay"
                    type="number"
                    min="1"
                    max="24"
                    {...register('workingHoursPerDay')}
                  />
                </div>

                {/* Centro de Costo */}
                <div className="space-y-2">
                  <Label htmlFor="costCenterId">Centro de Costo</Label>
                  <Select
                    value={watch('costCenterId') || ''}
                    onValueChange={(value) => setValue('costCenterId', value)}
                    disabled={loadingCostCenters}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCostCenters ? 'Cargando...' : 'Seleccionar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {costCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sindicato */}
                <div className="space-y-2">
                  <Label htmlFor="unionId">Sindicato</Label>
                  <Select
                    value={watch('unionId') || ''}
                    onValueChange={(value) => setValue('unionId', value)}
                    disabled={loadingUnions}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUnions ? 'Cargando...' : 'Seleccionar'} />
                    </SelectTrigger>
                    <SelectContent>
                      {unions.map((union) => (
                        <SelectItem key={union.id} value={union.id}>
                          {union.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Convenio Colectivo */}
                <div className="space-y-2">
                  <Label htmlFor="agreementId">Convenio Colectivo</Label>
                  <Select
                    value={watch('agreementId') || ''}
                    onValueChange={(value) => setValue('agreementId', value)}
                    disabled={!unionId || loadingAgreements}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingAgreements
                            ? 'Cargando...'
                            : !unionId
                              ? 'Seleccione sindicato'
                              : 'Seleccionar'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {agreements.map((agreement) => (
                        <SelectItem key={agreement.id} value={agreement.id}>
                          {agreement.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Categoría Laboral */}
                <div className="space-y-2">
                  <Label htmlFor="jobCategoryId">Categoría Laboral</Label>
                  <Select
                    value={watch('jobCategoryId') || ''}
                    onValueChange={(value) => setValue('jobCategoryId', value)}
                    disabled={!agreementId || loadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingCategories
                            ? 'Cargando...'
                            : !agreementId
                              ? 'Seleccione convenio'
                              : 'Seleccionar'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Afiliación Sindical */}
                <div className="space-y-2">
                  <Label htmlFor="unionAffiliationStatus">Afiliación Sindical</Label>
                  <Select
                    value={watch('unionAffiliationStatus') || ''}
                    onValueChange={(value) =>
                      setValue('unionAffiliationStatus', value as 'AFFILIATED' | 'NOT_AFFILIATED')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AFFILIATED">Afiliado</SelectItem>
                      <SelectItem value="NOT_AFFILIATED">No Afiliado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Costo */}
                <div className="space-y-2">
                  <Label htmlFor="costType">Tipo de Costo</Label>
                  <Select
                    value={watch('costType') || ''}
                    onValueChange={(value) => setValue('costType', value as 'DIRECT' | 'INDIRECT')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIRECT">Directo</SelectItem>
                      <SelectItem value="INDIRECT">Indirecto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isPending || isSubmitting}
          data-testid="employee-submit-button"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Actualizar Empleado' : 'Crear Empleado'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/employees')}
          data-testid="employee-cancel-button"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
