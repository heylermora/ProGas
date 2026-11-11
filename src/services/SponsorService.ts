import { normalizeBusinessName, requireBusinessName } from 'utils/businessName';
import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig';
import CategoryService from './CategoryService';
import { findCategory, resolveCategory } from 'utils/categories';
import SponsorItem, { BusinessCategory, DEFAULT_BUSINESS_CATEGORY, SponsorType } from 'interfaces/SponsorItem';

const COLLECTION = 'Sponsors';
export const SPONSOR_CAPACITY: Record<SponsorType, number> = { VIP: 4, Premium: 8, General: 12 };
const LEGACY_CATEGORY: Record<SponsorType, BusinessCategory> = { VIP: 'Restaurantes/Sodas', Premium: 'Tiendas', General: DEFAULT_BUSINESS_CATEGORY };
const CATEGORY_ALIASES: Record<string, BusinessCategory> = {
  'Restaurantes/Soda': 'Restaurantes/Sodas',
  'Súper/Pulperías': 'Súperes/Pulperías',
  Joyería: 'Joyerías',
  Zapatería: 'Zapaterías',
  'Agro insumos': 'Agroinsumos',
  Fumigadora: 'Fumigadoras',
  'Etc.': DEFAULT_BUSINESS_CATEGORY,
};

const normalize = (item: SponsorItem): SponsorItem => ({
  ...item,
  name: normalizeBusinessName(item.name),
  category: CATEGORY_ALIASES[item.category] || item.category || LEGACY_CATEGORY[item.type || 'General'] || DEFAULT_BUSINESS_CATEGORY,
  active: item.active !== false,
  order: Number(item.order ?? 0),
  links: Array.isArray(item.links) ? item.links.filter(Boolean) : [],
});

const SponsorService = {
  getAll: async () => {
    // El mapa pagina visualmente por sectores; usamos un límite amplio para no ocultar
    // negocios activos por el límite genérico de 50 documentos de la utilidad compartida.
    const data = await fetchAllData<SponsorItem>(COLLECTION, undefined, 500);
    const normalized = data.map(normalize);
    const catalog = await CategoryService.getCatalog('sponsors', normalized.map(item => item.category));
    return normalized.map(item => resolveCategory(item, catalog)).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  },
  getPublicByCategory: async (category: BusinessCategory) => {
    const data = await SponsorService.getAll();
    const catalog = await CategoryService.getCatalog('sponsors');
    const target = findCategory(catalog, category);
    return data.filter(s => s.active && (target ? s.categoryId === target.id : s.category === category));
  },
  // Compatibilidad temporal con la tira anterior; las pantallas públicas nuevas usan categorías.
  getPublicByType: async (type: SponsorType, max: number) => SponsorService.getPublicByCategory(LEGACY_CATEGORY[type]).then((data) => data.slice(0, max)),
  get: async (key: string) => CategoryService.resolveItem('sponsors', normalize(await fetchDataById(COLLECTION, key) as SponsorItem)),
  nextOrder: async (category: BusinessCategory) => {
    const all = await SponsorService.getAll();
    const target = findCategory(await CategoryService.getCatalog('sponsors'), category);
    const items = all.filter(item => target ? item.categoryId === target.id : item.category === category);
    return Math.max(0, ...items.map(item => Number.isFinite(item.order) ? item.order : 0)) + 1;
  },
  create: async (newSponsor: Omit<SponsorItem, 'id'>) => {
    const payload = await CategoryService.resolveItem('sponsors', { ...newSponsor, name: requireBusinessName(newSponsor.name) });
    return addData(COLLECTION, { ...payload, order: await SponsorService.nextOrder(payload.category) });
  },
  edit: async (key: string, editedSponsor: SponsorItem) => updateData(COLLECTION, key, await CategoryService.resolveItem('sponsors', { ...editedSponsor, name: requireBusinessName(editedSponsor.name) })),
  enforceCapacity: async (type: SponsorType) => {
    const sponsorsOfType = (await SponsorService.getAll())
      .filter((sponsor) => sponsor.type === type)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    const capacity = SPONSOR_CAPACITY[type];

    await Promise.all(sponsorsOfType.map((sponsor, index) => {
      const active = index < capacity;
      return sponsor.active === active ? Promise.resolve() : SponsorService.edit(sponsor.id, { ...sponsor, active });
    }));
  },
  delete: async (key: string) => deleteData(COLLECTION, key),
};

export default SponsorService;
