import { networkFor, sponsorContactHref, sponsorContacts, sponsorLinks, sponsorNavigation, sponsorVideoSource } from './sponsor';

it('identifies social networks by hostname rather than text inside a URL', () => {
  expect(networkFor('https://www.instagram.com/local')).toBe('instagram');
  expect(networkFor('https://example.com/instagram.com')).toBe('website');
  expect(networkFor('https://instagram.com.example.com/local')).toBe('website');
  expect(networkFor('ftp://example.com/file')).toBeUndefined();
  expect(sponsorContactHref('https://www.tiktok.com/@local')).toBe('https://www.tiktok.com/@local');
  expect(sponsorContactHref('local@example.com')).toBe('mailto:local@example.com');
});

it('maps historic links to named fields without losing duplicates or extra contacts', () => {
  const original = { links: ['https://facebook.com/local', 'https://instagram.com/local', 'https://instagram.com/second', 'mailto:local@example.com', 'https://example.com'] };
  const contacts = sponsorContacts(original);
  expect(contacts.socials.facebook).toBe(original.links[0]);
  expect(contacts.socials.email).toBe('local@example.com');
  expect(contacts.extra).toEqual(['https://instagram.com/second']);
  expect(sponsorLinks({ socialLinks: contacts.socials, links: contacts.extra }).sort()).toEqual([...original.links].sort());
});

it('creates Maps and Waze links to the same exact point and rejects invalid coordinates', () => {
  const links = sponsorNavigation('9.798,-84.162');
  expect(links.maps).toContain('query=9.798%2C-84.162');
  expect(links.waze).toContain('ll=9.798%2C-84.162');
  expect(sponsorNavigation('9.798,')).toBeUndefined();
  expect(sponsorNavigation('60,-84')).toBeUndefined();
});

it('supports share links and historic iframe sources, but rejects unsupported pages', () => {
  expect(sponsorVideoSource('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  expect(sponsorVideoSource('https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  expect(sponsorVideoSource('<iframe src="https://player.vimeo.com/video/123456"></iframe>')).toBe('https://player.vimeo.com/video/123456');
  expect(sponsorVideoSource('https://example.com/video.mp4?token=123')).toContain('video.mp4?token=123');
  expect(sponsorVideoSource('https://drive.google.com/file/d/123')).toBe('');
});
