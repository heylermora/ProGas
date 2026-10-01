export const coordinatesToText = (latitude?: number, longitude?: number) => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return '';
  return `${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`;
};

export const mapsSearchUrl = (query = '') => {
  const encoded = encodeURIComponent(query);
  return encoded ? `https://www.google.com/maps/search/?api=1&query=${encoded}` : '';
};

export const mapsEmbedUrl = (query = '') => {
  const encoded = encodeURIComponent(query);
  return encoded ? `https://maps.google.com/maps?q=${encoded}&z=17&output=embed` : '';
};

export const wazeUrl = (query = '') => {
  const encoded = encodeURIComponent(query);
  return encoded ? `https://waze.com/ul?q=${encoded}&navigate=yes` : '';
};

export const isCostaRicaCoordinate = (latitude?: number, longitude?: number) =>
  Number.isFinite(latitude) && Number.isFinite(longitude)
  && Number(latitude) >= 8.0 && Number(latitude) <= 11.3
  && Number(longitude) >= -86.0 && Number(longitude) <= -82.0;
