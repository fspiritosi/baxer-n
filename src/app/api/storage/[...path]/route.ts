import { NextRequest, NextResponse } from 'next/server';

import { isS3Provider } from '@/shared/config/storage.config';
import { getContentType } from '@/shared/config/storage.config';
import { localFileExists, readLocalFile } from '@/shared/lib/storage';
import { logger } from '@/shared/lib/logger';

/**
 * API Route para servir archivos del storage local
 *
 * GET /api/storage/[...path]
 *
 * NOTA: Esta ruta solo funciona cuando STORAGE_PROVIDER="local"
 * Con S3/MinIO/R2, los archivos se sirven directamente o con presigned URLs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Si usamos S3, esta ruta no debería usarse
    if (isS3Provider()) {
      return NextResponse.json(
        {
          error: 'Esta ruta solo está disponible con STORAGE_PROVIDER=local',
          hint: 'Use presigned URLs para acceder a archivos en S3/MinIO/R2',
        },
        { status: 400 }
      );
    }

    const { path: pathSegments } = await params;
    const key = pathSegments.join('/');

    // Validar que no haya path traversal
    if (key.includes('..') || key.startsWith('/')) {
      return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 });
    }

    // Verificar que el archivo existe
    const exists = await localFileExists(key);
    if (!exists) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Leer el archivo
    const file = await readLocalFile(key);
    const contentType = getContentType(key);

    // Determinar si es descarga o visualización
    const download = request.nextUrl.searchParams.get('download');
    const filename = key.split('/').pop() || 'file';

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Content-Length': file.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    // Si es descarga, agregar Content-Disposition
    if (download === 'true') {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(new Uint8Array(file), { headers });
  } catch (error) {
    logger.error('Error al servir archivo', { data: { error } });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
