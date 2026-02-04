'use client';

import { Check, ChevronsUpDown, User, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Label } from '@/shared/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useDebounce } from '@/shared/hooks/useDebounce';

import type { EmployeeForUploadSearch, EquipmentForUploadSearch } from '../actions.server';
import type { EntityType } from './_EntityTypeSelector';

// ============================================
// TIPOS
// ============================================

export type SelectedEntity =
  | { type: 'EMPLOYEE'; id: string; data: EmployeeForUploadSearch }
  | { type: 'EQUIPMENT'; id: string; data: EquipmentForUploadSearch }
  | { type: 'COMPANY'; id: string };

interface Props {
  entityType: EntityType;
  value: SelectedEntity | null;
  onValueChange: (value: SelectedEntity | null) => void;
  searchEmployees: (query: string) => Promise<EmployeeForUploadSearch[]>;
  searchEquipment: (query: string) => Promise<EquipmentForUploadSearch[]>;
  companyId: string;
  disabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function _EntitySearchCombobox({
  entityType,
  value,
  onValueChange,
  searchEmployees,
  searchEquipment,
  companyId,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<EmployeeForUploadSearch[]>([]);
  const [equipment, setEquipment] = useState<EquipmentForUploadSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Effect to perform search when debounced query changes
  useEffect(() => {
    if (entityType === 'COMPANY') return;

    const performSearch = async () => {
      setIsLoading(true);
      try {
        if (entityType === 'EMPLOYEE') {
          const results = await searchEmployees(debouncedQuery);
          setEmployees(results);
        } else if (entityType === 'EQUIPMENT') {
          const results = await searchEquipment(debouncedQuery);
          setEquipment(results);
        }
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, entityType, searchEmployees, searchEquipment]);

  // Auto-select company when COMPANY type is selected
  useEffect(() => {
    if (entityType === 'COMPANY' && (!value || value.type !== 'COMPANY')) {
      onValueChange({ type: 'COMPANY', id: companyId });
    }
  }, [entityType, companyId, value, onValueChange]);

  // Reset selection when entity type changes
  useEffect(() => {
    if (value && value.type !== entityType) {
      onValueChange(null);
    }
  }, [entityType, value, onValueChange]);

  // For COMPANY type, just show a message
  if (entityType === 'COMPANY') {
    return (
      <div className="space-y-2">
        <Label>Entidad seleccionada</Label>
        <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/50">
          <Check className="h-4 w-4 text-primary" />
          <span className="text-sm">Se usará la empresa activa</span>
        </div>
      </div>
    );
  }

  const getDisplayText = () => {
    if (!value) return 'Seleccionar...';

    if (value.type === 'EMPLOYEE') {
      const emp = value.data;
      return `${emp.firstName} ${emp.lastName} - Leg. ${emp.employeeNumber || 'S/N'}`;
    }

    if (value.type === 'EQUIPMENT') {
      const eq = value.data;
      const identifier = eq.domain || eq.internNumber || 'Sin identificar';
      const details = [eq.brand?.name, eq.model?.name].filter(Boolean).join(' ');
      return details ? `${identifier} - ${details}` : identifier;
    }

    return 'Seleccionar...';
  };

  const items = entityType === 'EMPLOYEE' ? employees : equipment;

  return (
    <div className="space-y-2">
      <Label>{entityType === 'EMPLOYEE' ? 'Empleado' : 'Equipo'}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Buscar ${entityType === 'EMPLOYEE' ? 'empleado' : 'equipo'}...`}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Buscando...
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>
                  {searchQuery
                    ? 'No se encontraron resultados'
                    : `Ingresa un término para buscar ${entityType === 'EMPLOYEE' ? 'empleados' : 'equipos'}`}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {entityType === 'EMPLOYEE' &&
                    employees.map((emp) => (
                      <CommandItem
                        key={emp.id}
                        value={emp.id}
                        onSelect={() => {
                          onValueChange({ type: 'EMPLOYEE', id: emp.id, data: emp });
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-8 w-8">
                            {emp.pictureUrl ? (
                              <AvatarImage src={emp.pictureUrl} alt="" />
                            ) : null}
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Leg. {emp.employeeNumber || 'S/N'} · DNI {emp.documentNumber || 'S/N'}
                            </p>
                          </div>
                          {value?.type === 'EMPLOYEE' && value.id === emp.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CommandItem>
                    ))}

                  {entityType === 'EQUIPMENT' &&
                    equipment.map((eq) => (
                      <CommandItem
                        key={eq.id}
                        value={eq.id}
                        onSelect={() => {
                          onValueChange({ type: 'EQUIPMENT', id: eq.id, data: eq });
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-8 w-8">
                            {eq.pictureUrl ? (
                              <AvatarImage src={eq.pictureUrl} alt="" />
                            ) : null}
                            <AvatarFallback>
                              <Truck className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {eq.domain || eq.internNumber || 'Sin identificar'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {[eq.brand?.name, eq.model?.name, eq.type?.name]
                                .filter(Boolean)
                                .join(' · ') || 'Sin detalles'}
                            </p>
                          </div>
                          {value?.type === 'EQUIPMENT' && value.id === eq.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
