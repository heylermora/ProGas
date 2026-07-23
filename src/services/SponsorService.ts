import { fetchAllData, fetchDataById, addData, updateData, deleteData } from 'apiConfig';
import SponsorItem, { SponsorType } from 'interfaces/SponsorItem';

const COLLECTION = 'Sponsors';
export const SPONSOR_CAPACITY: Record<SponsorType, number> = { VIP: 4, Premium: 8, General: 12 };

const normalize = (item: SponsorItem): SponsorItem => ({
  ...item,
  active: item.active !== false,
  order: Number(item.order ?? 0),
  links: Array.isArray(item.links) ? item.links.filter(Boolean) : [],
});

const SponsorService = {
  getAll: async () => {
    const data = await fetchAllData<SponsorItem>(COLLECTION, undefined, 50);
    return data.map(normalize).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  },
  getPublicByType: async (type: SponsorType, max: number) => {
    const data = await SponsorService.getAll();
    return data.filter((s) => s.active && s.type === type).slice(0, max);
  },
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
