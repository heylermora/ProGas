import { serviceAreaLocations } from 'data/costaRicaLocations';

export interface TerritoryOption { code: string; name: string }

export const normalizeTerritoryName = (value = '') => value
  .replace(/^(provincia|cant[oó]n|distrito)\s+(de|del)\s+/i, '')
  .replace(/\s+(province|provincia|canton|cant[oó]n|district|distrito)$/i, '')
  .trim();

const API = process.env.REACT_APP_TERRITORY_API_URL || 'https://ubicaciones.paginasweb.cr';
const code = (value: string | number) => String(value).padStart(2, '0');

const readOptions = (payload: unknown): TerritoryOption[] => {
  if (!payload || typeof payload !== 'object') return [];
  return Object.entries(payload as Record<string, unknown>)
    .map(([id, name]) => ({ code: code(id), name: String(name) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
};

const fetchOptions = async (path: string) => {
  const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('No se pudo consultar el catálogo territorial.');
  return readOptions(await response.json());
};

const fallbackProvinces = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón']
  .map((name, index) => ({ code: String(index + 1), name }));

const serviceAreaCantonCodes: Record<string, string> = {
  'San José/Acosta': '12',
  'San José/Aserrí': '06',
  'San José/Desamparados': '03',
  'San José/Mora': '07',
  'San José/Puriscal': '04',
  'San José/Tarrazú': '05',
};

const TerritoryService = {
  getProvinces: async () => {
    try { return await fetchOptions('/provincias.json'); }
    catch { return fallbackProvinces; }
  },
  getCantons: async (province: TerritoryOption) => {
    try { return await fetchOptions(`/provincia/${Number(province.code)}/cantones.json`); }
    catch {
      return Object.keys(serviceAreaLocations[province.name] || {}).map(name => ({ code: serviceAreaCantonCodes[`${province.name}/${name}`] || name, name }));
    }
  },
  getDistricts: async (province: TerritoryOption, canton: TerritoryOption) => {
    try { return await fetchOptions(`/provincia/${Number(province.code)}/canton/${Number(canton.code)}/distritos.json`); }
    catch {
      return Object.keys(serviceAreaLocations[province.name]?.[canton.name] || {}).map((name, index) => ({ code: code(index + 1), name }));
    }
  },
  getLocalities: (provinceName: string, cantonName: string, districtName: string) =>
    serviceAreaLocations[provinceName]?.[cantonName]?.[districtName] || [],
};

export default TerritoryService;
