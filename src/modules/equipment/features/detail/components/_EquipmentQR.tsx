'use client';

import { Check, Copy, Download, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface Props {
  vehicleId: string;
  internNumber: string | null;
  domain: string | null;
}

export function _EquipmentQR({ vehicleId, internNumber, domain }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Generar la URL pública del equipo
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/eq/${vehicleId}`
    : `/eq/${vehicleId}`;

  // Identificador para mostrar en el QR
  const identifier = internNumber || domain || 'Equipo';

  // Descargar como PNG
  const handleDownload = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await toPng(qrRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 3, // Alta resolución
      });

      const link = document.createElement('a');
      link.download = `qr-equipo-${identifier.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('QR descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el QR');
    }
  };

  // Imprimir
  const handlePrint = () => {
    if (!qrRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR - ${identifier}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
            }
            .identifier {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .url {
              font-size: 12px;
              color: #6b7280;
              margin-top: 16px;
              word-break: break-all;
            }
            @media print {
              body { padding: 0; }
              .qr-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="identifier">${identifier}</div>
            ${qrRef.current.innerHTML}
            <div class="url">${publicUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Copiar URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('URL copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar la URL');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código QR</CardTitle>
        <CardDescription>
          Escanea este código para acceder a la información pública del equipo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <div
            ref={qrRef}
            className="bg-white p-6 rounded-lg border shadow-sm"
          >
            <QRCode
              value={publicUrl}
              size={200}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <p className="text-sm text-muted-foreground text-center font-medium">
            {identifier}
          </p>
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <code className="text-xs flex-1 truncate">{publicUrl}</code>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopyUrl}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar PNG
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          Este QR permite acceder a información básica del equipo sin necesidad de iniciar sesión
        </p>
      </CardContent>
    </Card>
  );
}
