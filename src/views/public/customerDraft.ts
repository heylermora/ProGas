export type CustomerDraftAddress = {
  province: string;
  canton: string;
  district: string;
  neighborhood: string;
  details: string;
  coordinates?: string;
  locationUrl?: string;
};

export type CustomerDraft = {
  nationalId?: string;
  phone?: string;
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
  return [address.province, address.canton, address.district, address.neighborhood, address.details]
    .filter(Boolean)
    .join(', ');
};
