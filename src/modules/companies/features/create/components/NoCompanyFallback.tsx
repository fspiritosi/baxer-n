import { Building2 } from 'lucide-react';
import { APP_NAME } from '@/shared/config/instance';
import { _CreateCompanyForm } from '../components/_CreateCompanyForm';

/**
 * Fallback que se muestra cuando el usuario no tiene ninguna empresa
 * Server Component que renderiza el formulario de crear empresa
 */
export function NoCompanyFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Bienvenido a {APP_NAME}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Para comenzar a gestionar tus recursos, empleados y operaciones, primero necesitas
          crear o unirte a una empresa.
        </p>
      </div>

      <_CreateCompanyForm isFirstCompany />
    </div>
  );
}
