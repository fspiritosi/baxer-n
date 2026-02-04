import type { EmployeeStatus } from '@/generated/prisma/enums';

export interface EmployeeStatusInfo {
  status: EmployeeStatus;
  missingDocuments: { id: string; name: string }[];
  expiredDocuments: { id: string; name: string }[];
  completedDocuments: { id: string; name: string }[];
}
