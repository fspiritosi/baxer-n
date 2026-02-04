import type { VehicleStatus } from '@/generated/prisma/enums';

export interface VehicleStatusInfo {
  status: VehicleStatus;
  missingDocuments: { id: string; name: string }[];
  expiredDocuments: { id: string; name: string }[];
  completedDocuments: { id: string; name: string }[];
}
