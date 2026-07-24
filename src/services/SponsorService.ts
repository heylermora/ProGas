import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig';
import SponsorItem, { BusinessCategory, SponsorType } from 'interfaces/SponsorItem';

const COLLECTION = 'Sponsors';
export const SPONSOR_CAPACITY: Record<SponsorType, number> = { VIP: 4, Premium: 8, General: 12 };
const LEGACY_CATEGORY: Record<SponsorType, BusinessCategory> = { VIP: 'Restaurantes/Soda', Premium: 'Tiendas', General: 'Etc.' };

const normalize = (item: SponsorItem): SponsorItem => ({
  ...item,
  category: item.category || LEGACY_CATEGORY[item.type || 'General'],
  active: item.active !== false,
  order: Number(item.order ?? 0),
  links: Array.isArray(item.links) ? item.links.filter(Boolean) : [],
});

const SponsorService = {
  getAll: async () => {
    const data = await fetchAllData<SponsorItem>(COLLECTION, undefined, 50);
    return data.map(normalize).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  },
  getPublicByCategory: async (category: BusinessCategory) => {
    const data = await SponsorService.getAll();
    return data.filter((s) => s.active && s.category === category);
  },
  // Compatibilidad temporal con la tira anterior; las pantallas públicas nuevas usan categorías.
  getPublicByType: async (type: SponsorType, max: number) => SponsorService.getPublicByCategory(LEGACY_CATEGORY[type]).then((data) => data.slice(0, max)),
  get: async (key: string) => fetchDataById(COLLECTION, key) as Promise<SponsorItem>,
  create: async (newSponsor: Omit<SponsorItem, 'id'>) => addData(COLLECTION, newSponsor),
  edit: async (key: string, editedSponsor: SponsorItem) => updateData(COLLECTION, key, editedSponsor),
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
