'use server';

import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';

// ============================================
// MUTATIONS
// ============================================

/**
 * Marca un documento de empresa como vencido (para uso en jobs/cron)
 */
export async function markCompanyDocumentAsExpired(id: string) {
  try {
    await prisma.companyDocument.update({
      where: { id },
      data: { state: 'EXPIRED' },
    });

    logger.info('Company document marked as expired', { data: { id } });
    return { success: true };
  } catch (error) {
    logger.error('Error marking company document as expired', {
      data: { error, id },
    });
    throw error;
  }
}
