export const BUSINESS_NAME_REQUIRED = 'Ingrese el nombre del negocio.';

export function normalizeBusinessName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function requireBusinessName(value: unknown): string {
  const name = normalizeBusinessName(value);
  if (!name) throw new Error(BUSINESS_NAME_REQUIRED);
  return name;
}
