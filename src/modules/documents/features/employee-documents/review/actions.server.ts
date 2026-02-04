'use server';

import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';

// ============================================
// MUTATIONS
// ============================================

/**
 * Marca un documento como vencido (para uso en jobs/cron)
 */
export async function markDocumentAsExpired(id: string) {
  try {
    await prisma.employeeDocument.update({
      where: { id },
      data: { state: 'EXPIRED' },
    });

    logger.info('Employee document marked as expired', { data: { id } });
    return { success: true };
  } catch (error) {
    logger.error('Error marking employee document as expired', {
      data: { error, id },
    });
    throw error;
  }
}
