import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';

export type BusinessCategoryGroup = { name: string; icon: string; categories: string[] };
export type BusinessCategorySettings = { groups: BusinessCategoryGroup[]; icons: Record<string, string> };
const definitions: [string, string, number[]][] = [
  ['Alimentos / Bebidas', '🍽️', [0, 1, 2, 3, 4, 5]],
  ['Compras', '🛍️', [6, 7, 8, 9]],
  ['Belleza y bienestar', '✨', [10, 11, 16]],
  ['Salud y mascotas', '🐾', [12, 13]],
  ['Hogar y agro', '🌱', [14, 15, 19]],
  ['Vehículos y talleres', '🔧', [17, 18]],
  ['Otros', '🏪', [20]],
];
export const defaultBusinessSettings = (categories: string[]): BusinessCategorySettings => ({
  groups: definitions.map(([name, icon, indexes]) => ({ name, icon, categories: categories.filter(category => indexes.some(index => BUSINESS_CATEGORIES[index] === category) || (name === 'Otros' && !BUSINESS_CATEGORIES.some(item => item === category))) })).filter(group => group.categories.length),
  icons: Object.fromEntries(BUSINESS_CATEGORIES.map((name, index) => [name, ['🍽️','🍔','🍕','☕','🍦','🍷','🛒','🛍️','💎','👟','💈','💇','🐾','💊','🔨','🌱','💪','🏍️','🔧','🛡️','✨'][index]])),
});
export const completeBusinessSettings = (categories: string[], settings?: BusinessCategorySettings): BusinessCategorySettings => {
  if (!settings || !Array.isArray(settings.groups)) return defaultBusinessSettings(categories);
  const assigned = new Set<string>();
  const groups = settings.groups.map(group => ({ ...group, categories: group.categories.filter(category => categories.includes(category) && !assigned.has(category) && Boolean(assigned.add(category))) }));
  const missing = categories.filter(category => !assigned.has(category));
  if (missing.length) groups.push({ name: 'Sin clasificar', icon: '🏪', categories: missing });
  return { groups, icons: settings.icons || {} };
};
