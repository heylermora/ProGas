import { fetchDataById, upsertData } from 'apiConfig';

const COLLECTION = 'SponsorDisplaySettings';
const DOCUMENT_ID = 'public-strip';

export const defaultSponsorDisplaySettings = {
  availableTitle: 'Tu marca aquí',
  availableDescription: 'Llegá a clientes locales mientras hacen su pedido.',
};

const SponsorDisplaySettingsService = {
  get: async () => {
    try {
      const data = await fetchDataById(COLLECTION, DOCUMENT_ID);
      return { ...defaultSponsorDisplaySettings, ...data };
    } catch (error) {
      // La primera vez todavía no existe configuración: el sitio conserva su mensaje por defecto.
      return defaultSponsorDisplaySettings;
    }
  },
  save: async (settings: typeof defaultSponsorDisplaySettings) => upsertData(COLLECTION, DOCUMENT_ID, {
    availableTitle: settings.availableTitle.trim() || defaultSponsorDisplaySettings.availableTitle,
    availableDescription: settings.availableDescription.trim() || defaultSponsorDisplaySettings.availableDescription,
  }),
};

export default SponsorDisplaySettingsService;
