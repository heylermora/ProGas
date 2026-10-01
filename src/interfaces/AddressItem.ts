export type AddressCaptureSource = 'gps' | 'manual' | 'saved';

export interface TerritoryRef {
  code: string;
  name: string;
}

export interface AddressPosition {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface AddressItem {
  province: TerritoryRef;
  canton: TerritoryRef;
  district: TerritoryRef;
  locality: { id?: string; name: string; source?: string };
  exactAddress: string;
  additionalDirections?: string;
  position?: AddressPosition;
  captureSource: AddressCaptureSource;
  geocoding?: {
    provider: string;
    providerPlaceId?: string;
    confidence?: number;
    precision?: string;
    resolvedAt: string;
  };
  catalogVersion: string;
}

export interface CustomerAddressItem extends AddressItem {
  id: string;
  label: string;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

