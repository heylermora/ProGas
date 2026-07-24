export const BUSINESS_CATEGORIES = [
  'Restaurantes/Soda', 'Comidas Rápidas', 'Pizzerías', 'Cafeterías', 'Heladerías',
  'Licoreras', 'Súper/Pulperías', 'Tiendas', 'Joyería', 'Zapatería', 'Barberías',
  'Salones de Belleza', 'Veterinarias', 'Farmacias', 'Ferreterías', 'Agro insumos',
  'Gimnasios', 'Moto Repuestos', 'Mecánicos', 'Fumigadora', 'Etc.',
] as const;

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];
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
