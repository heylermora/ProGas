import { createHash } from 'crypto';
import { TextEncoder } from 'util';
import { getDocs, setDoc } from 'firebase/firestore';
import AnalyticsService from './AnalyticsService';

jest.unmock('services/AnalyticsService');
jest.mock('uuid', () => ({ v4: () => `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}` }));
jest.mock('apiConfig', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  setDoc: jest.fn(), getDocs: jest.fn(), serverTimestamp: () => 'server-time',
  doc: (_db: unknown, collection: string, id: string) => ({ collection, id }),
  collection: (_db: unknown, name: string) => ({ name }),
  query: (...args: unknown[]) => args,
  startAfter: (cursor: unknown) => ({ cursor }),
}));

let time = Date.now();
beforeEach(() => {
  jest.clearAllMocks();
  time += 31 * 60 * 1000;
  jest.spyOn(Date, 'now').mockImplementation(() => time);
  sessionStorage.clear();
  Object.defineProperty(global, 'TextEncoder', { configurable: true, value: TextEncoder });
  Object.defineProperty(window, 'crypto', { configurable: true, value: { subtle: {
    digest: async (_algorithm: string, data: Uint8Array) => Uint8Array.from(createHash('sha256').update(data).digest()).buffer,
  } } });
  (setDoc as jest.Mock).mockResolvedValue(undefined);
});
afterEach(() => jest.restoreAllMocks());

it('deduplicates a visit and concurrent/repeated clicks per business and exact URL', async () => {
  await Promise.all([AnalyticsService.track({ type: 'page_view', source: 'home' }), AnalyticsService.track({ type: 'page_view', source: 'home' })]);
  expect(setDoc).toHaveBeenCalledTimes(1);
  const input = { type: 'link_click' as const, source: 'mall' as const, businessId: 'business-a', url: 'https://www.tiktok.com/@business' };
  await Promise.all([AnalyticsService.track(input), AnalyticsService.track(input)]);
  await AnalyticsService.track({ ...input, source: 'mall-preview' });
  expect(setDoc).toHaveBeenCalledTimes(2);
  await AnalyticsService.track({ ...input, businessId: 'business-b' });
  await AnalyticsService.track({ ...input, url: 'https://wa.me/50600000000' });
  expect(setDoc).toHaveBeenCalledTimes(4);
  expect((setDoc as jest.Mock).mock.calls[1][1]).toMatchObject({ businessId: 'business-a', url: input.url, network: 'tiktok', createdAt: 'server-time' });
});

it('allows a later session to count again', async () => {
  await AnalyticsService.track({ type: 'browse_click', source: 'home' });
  time += 31 * 60 * 1000;
  await AnalyticsService.track({ type: 'browse_click', source: 'home' });
  expect(setDoc).toHaveBeenCalledTimes(2);
  expect((setDoc as jest.Mock).mock.calls[0][0].id).not.toBe((setDoc as jest.Mock).mock.calls[1][0].id);
});

it('does not reject navigation on write failure and permits a retry', async () => {
  (setDoc as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const input = { type: 'link_click' as const, source: 'mall' as const, businessId: 'business-a', url: 'contact@business.test' };
  await expect(AnalyticsService.track(input)).resolves.toBeUndefined();
  await AnalyticsService.track(input);
  expect(setDoc).toHaveBeenCalledTimes(2);
  expect((setDoc as jest.Mock).mock.calls[1][1].url).toBe('mailto:contact@business.test');
});

it('continues measuring if session storage is blocked and omits links without business IDs', async () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  await AnalyticsService.track({ type: 'page_view', source: 'home' });
  await AnalyticsService.track({ type: 'page_view', source: 'home' });
  await AnalyticsService.track({ type: 'link_click', source: 'mall', url: 'https://wa.me/50600000000' });
  expect(setDoc).toHaveBeenCalledTimes(1);
});

it('aggregates every page and distinguishes URLs shared by different businesses', async () => {
  const docs = Array.from({ length: 500 }, () => ({ data: () => ({ type: 'page_view' }) }));
  (getDocs as jest.Mock).mockResolvedValueOnce({ docs }).mockResolvedValueOnce({ docs: [
    { data: () => ({ type: 'browse_click' }) },
    ...['a', 'a', 'b'].map(businessId => ({ data: () => ({ type: 'link_click', businessId, url: 'https://example.test', network: 'website' }) })),
  ] });
  const report = await AnalyticsService.getReport(new Date('2026-10-01'), new Date('2026-11-01'));
  expect(getDocs).toHaveBeenCalledTimes(2);
  expect(report).toMatchObject({ visits: 500, browseClicks: 1, linkClicks: 3, links: [
    { businessId: 'a', clicks: 2 }, { businessId: 'b', clicks: 1 },
  ] });
});

it('rejects inverted or excessive report intervals', async () => {
  await expect(AnalyticsService.getReport(new Date('2026-11-01'), new Date('2026-10-01'))).rejects.toThrow();
  await expect(AnalyticsService.getReport(new Date('2026-01-01'), new Date('2026-11-01'))).rejects.toThrow();
  expect(getDocs).not.toHaveBeenCalled();
});


it('accepts 92 reporting days and rejects a 93-day interval', async () => {
  const from = new Date('2026-01-01');
  (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
  await expect(AnalyticsService.getReport(from, new Date(from.getTime() + 92 * 86400000))).resolves.toMatchObject({ visits: 0 });
  await expect(AnalyticsService.getReport(from, new Date(from.getTime() + 93 * 86400000))).rejects.toThrow();
});
