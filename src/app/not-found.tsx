'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-muted-foreground">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Volver atrás
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 size-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
