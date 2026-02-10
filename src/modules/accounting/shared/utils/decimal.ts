/**
 * Convierte un Decimal de Prisma a number para comparaciones
 */
export function toNumber(decimal: any): number {
  if (typeof decimal === 'number') return decimal;
  if (typeof decimal === 'string') return Number(decimal);
  return Number(decimal.toString());
}

/**
 * Compara dos Decimals
 */
export function isEqual(a: any, b: any): boolean {
  return Math.abs(toNumber(a) - toNumber(b)) < 0.01;
}

/**
 * Suma un array de Decimals
 */
export function sum(decimals: any[]): number {
  return decimals.reduce((acc, curr) => acc + toNumber(curr), 0);
}
