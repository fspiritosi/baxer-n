import { z } from 'zod';
import { pointOfSaleFormSchema, createPointOfSaleSchema } from './validators';

// Tipos inferidos desde Zod
export type PointOfSaleFormData = z.infer<typeof pointOfSaleFormSchema>;
export type CreatePointOfSaleInput = z.infer<typeof createPointOfSaleSchema>;
