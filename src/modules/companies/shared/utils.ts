import { revalidatePath } from 'next/cache';

export async function revalidateCompanyRoutes(companyId?: string) {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/companies');

  if (companyId) {
    revalidatePath(`/dashboard/companies/${companyId}`);
    revalidatePath(`/dashboard/companies/${companyId}/edit`);
  }
};
