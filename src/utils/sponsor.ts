import SponsorItem from 'interfaces/SponsorItem';
import { isCostaRicaCoordinate, mapsSearchUrl } from './location';

export const sponsorNetworks = [
  { key: 'facebook', label: 'Facebook', host: 'facebook.com', placeholder: 'https://www.facebook.com/su.negocio' },
  { key: 'instagram', label: 'Instagram', host: 'instagram.com', placeholder: 'https://www.instagram.com/su.negocio' },
  { key: 'tiktok', label: 'TikTok', host: 'tiktok.com', placeholder: 'https://www.tiktok.com/@su.negocio' },
  { key: 'whatsapp', label: 'WhatsApp', host: 'wa.me', placeholder: 'https://wa.me/50688888888' },
  { key: 'website', label: 'Sitio web', host: '', placeholder: 'https://su-negocio.com' },
  { key: 'email', label: 'Correo electrónico', host: '', placeholder: 'contacto@su-negocio.com' },
] as const;
export type SponsorNetwork = typeof sponsorNetworks[number]['key'];
const hostMatches = (host: string, expected: string) => host === expected || host.endsWith(`.${expected}`);

export function networkFor(value: string): SponsorNetwork | undefined {
  if (/^(mailto:)?[^\s@:/]+@[^\s@:/]+\.[^\s@:/]+$/i.test(value.trim())) return 'email';
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol)) return undefined;
    const network = sponsorNetworks.find(item => item.host && hostMatches(url.hostname, item.host));
    if (network) return network.key;
    if (hostMatches(url.hostname, 'whatsapp.com')) return 'whatsapp';
    return 'website';
  } catch { return undefined; }
}

export const sponsorContactHref = (link = '') => networkFor(link) === 'email' && !link.startsWith('mailto:') ? `mailto:${link}` : link;

export function sponsorContacts(sponsor: Pick<SponsorItem, 'links' | 'socialLinks'>) {
  const socials: SponsorItem['socialLinks'] = { ...sponsor.socialLinks };
  const extra: string[] = [];
  (sponsor.links || []).forEach(link => {
    const key = networkFor(link);
    if (key && !socials[key]) socials[key] = link.replace(/^mailto:/i, '');
    else if (!key || (socials[key] !== link && `mailto:${socials[key]}` !== link)) extra.push(link);
  });
  return { socials, extra };
}

export function sponsorLinks(sponsor: Pick<SponsorItem, 'links' | 'socialLinks'>) {
  const { socials, extra } = sponsorContacts(sponsor);
  return Array.from(new Set([...sponsorNetworks.map(item => {
    const value = socials[item.key]?.trim();
    return item.key === 'email' && value ? `mailto:${value.replace(/^mailto:/i, '')}` : value;
  }).filter(Boolean), ...extra]));
}

export function parseSponsorCoordinates(value = '') {
  const parts = value.trim().split(',').map(part => part.trim());
  if (parts.length !== 2 || parts.some(part => !/^-?\d+(?:\.\d+)?$/.test(part))) return undefined;
  const [latitude, longitude] = parts.map(Number);
  return isCostaRicaCoordinate(latitude, longitude) ? { latitude, longitude } : undefined;
}

export function sponsorNavigation(coordinates = '') {
  const point = parseSponsorCoordinates(coordinates);
  return point ? {
    maps: mapsSearchUrl(`${point.latitude},${point.longitude}`),
    waze: `https://waze.com/ul?ll=${point.latitude}%2C${point.longitude}&navigate=yes`,
  } : undefined;
}

export function sponsorVideoSource(value = '') {
  const source = (value.match(/src=["']([^"']+)["']/i)?.[1] || value).trim();
  try {
    const url = new URL(source);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    if (hostMatches(url.hostname, 'youtu.be') || hostMatches(url.hostname, 'youtube.com')) {
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (hostMatches(url.hostname, 'vimeo.com')) {
      const id = url.pathname.match(/(?:^\/|\/video\/)(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : '';
    }
    return /\.(mp4|webm|ogg)$/i.test(url.pathname) ? source : '';
  } catch { return ''; }
}
