'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';

/**
 * Verifica si el usuario tiene acceso a una company
 */
export async function userHasAccessToCompany(companyId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  try {
    const membership = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId,
      },
      include: {
        company: {
          select: { isActive: true },
        },
      },
    });

    return membership?.isActive && membership?.company?.isActive;
  } catch {
    return false;
  }
}
