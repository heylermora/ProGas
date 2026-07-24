export const BUSINESS_CATEGORIES = [
  'Restaurantes/Sodas', 'Comidas Rápidas', 'Pizzerías', 'Cafeterías', 'Heladerías',
  'Licoreras', 'Súperes/Pulperías', 'Tiendas', 'Joyerías', 'Zapaterías', 'Barberías',
  'Salones de Belleza', 'Veterinarias', 'Farmacias', 'Ferreterías', 'Agroinsumos',
  'Gimnasios', 'Moto Repuestos', 'Mecánicos', 'Fumigadoras', 'Otros',
] as const;

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];
export const DEFAULT_BUSINESS_CATEGORY: BusinessCategory = 'Otros';
// Conservado solo para leer registros históricos mientras se migran al centro comercial.
export type SponsorType = 'VIP' | 'Premium' | 'General';

interface SponsorItem {
  id: string;
  name: string;
  type?: SponsorType;
  category: BusinessCategory;
  active: boolean;
  order: number;
  logoUrl: string;
  videoUrl?: string;
  links: string[];
  description?: string;
}

export default SponsorItem;
