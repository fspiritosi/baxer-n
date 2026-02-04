'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Bug, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { logger } from '@/shared/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error para debugging
    logger.error('Dashboard error caught by error boundary', {
      data: {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      },
    });
  }, [error]);

  const errorInfo = {
    message: error.message || 'Error desconocido',
    digest: error.digest,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
  };

  const copyErrorDetails = async () => {
    const details = `
Error Report
============
Mensaje: ${errorInfo.message}
Digest: ${errorInfo.digest || 'N/A'}
Timestamp: ${errorInfo.timestamp}
URL: ${errorInfo.url}
User Agent: ${errorInfo.userAgent}
Stack: ${error.stack || 'N/A'}
    `.trim();

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      logger.error('Failed to copy error details');
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Algo salió mal</CardTitle>
          <CardDescription>
            Ha ocurrido un error inesperado. El equipo de desarrollo ha sido notificado.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 overflow-hidden">
            <p className="text-sm font-medium text-destructive break-words whitespace-pre-wrap">{errorInfo.message}</p>
            {errorInfo.digest && (
              <p className="mt-1 text-xs text-muted-foreground">
                Código de error: {errorInfo.digest}
              </p>
            )}
          </div>

          {/* Expandable details */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span className="text-sm text-muted-foreground">Detalles técnicos</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showDetails && (
              <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Información de debug
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={copyErrorDetails}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span className="ml-1 text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
                  </Button>
                </div>
                <div className="max-h-40 overflow-auto rounded bg-background p-2">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                    <code>
                      {JSON.stringify(
                        {
                          message: errorInfo.message,
                          digest: errorInfo.digest,
                          timestamp: errorInfo.timestamp,
                          url: errorInfo.url,
                        },
                        null,
                        2
                      )}
                    </code>
                  </pre>
                </div>
                {error.stack && (
                  <div className="max-h-48 overflow-auto rounded bg-background p-2">
                    <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/dashboard'}>
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Button>
            <Button className="flex-1" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              // TODO: Implementar envío de reporte
              // Por ahora solo copia los detalles
              copyErrorDetails();
            }}
          >
            <Bug className="mr-2 h-4 w-4" />
            Reportar error al equipo
          </Button>
        </CardFooter>
      </Card>

      {/* Timestamp footer */}
      <p className="mt-4 text-xs text-muted-foreground">
        {new Date().toLocaleString('es-AR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>
    </div>
  );
}
