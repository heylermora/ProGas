import { AddressItem } from 'interfaces/AddressItem';

export const formatDeliveryAddress = (address?: AddressItem) => {
  if (!address) return '';
  return [
    address.province?.name,
    address.canton?.name,
    address.district?.name,
    address.locality?.name,
    address.exactAddress,
    address.additionalDirections,
  ].filter(Boolean).join(', ');
};

export const legacyCoordinates = (coordinates = '') => {
  const [latitude, longitude] = coordinates.split(',').map(Number);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : undefined;
};
