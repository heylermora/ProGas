import { AddressItem } from 'interfaces/AddressItem';
import { formatDeliveryAddress } from 'utils/address';

export type CustomerDraftAddress = {
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

export type CustomerDraft = {
  nationalId?: string;
  phone?: string;
  clientRecordId?: string;
  isExistingClient?: boolean;
  name?: string;
  nickname?: string;
  address?: CustomerDraftAddress;
};

const KEY = 'gasMemoCustomerDraft';

export const getCustomerDraft = (): CustomerDraft => {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

export const saveCustomerDraft = (next: CustomerDraft) => {
  const current = getCustomerDraft();
  window.sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...next }));
};

export const addressToText = (address?: CustomerDraftAddress) => {
  if (!address) return '';
  if (address.canonical) return formatDeliveryAddress(address.canonical);
  return [address.province, address.canton, address.district, address.neighborhood, address.details, address.additionalDirections]
    .filter(Boolean)
    .join(', ');
};
