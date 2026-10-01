import { AddressItem, CustomerAddressItem } from './AddressItem';

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
    additionalDirections?: string;
    coordinates?: string;
    locationUrl?: string;
    canonical?: AddressItem;
    savedAddressId?: string;
  };
  addresses?: CustomerAddressItem[];
  defaultAddressId?: string;
}

export default ClientItem;
