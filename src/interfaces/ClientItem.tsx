interface ClientItem {
  id: string;
  nationalId: string;
  name: string;
  nickname?: string;
  phone: string;
  telefono?: string;
  active?: boolean;
  address?: {
    province?: string;
    canton?: string;
    district?: string;
    neighborhood?: string;
    details?: string;
    coordinates?: string;
    locationUrl?: string;
  };
}

export default ClientItem;
