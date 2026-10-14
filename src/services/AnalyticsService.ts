import { db } from 'apiConfig';
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, startAfter, Timestamp, where, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { AnalyticsInput, AnalyticsReport } from 'interfaces/AnalyticsEvent';
import { networkFor, sponsorContactHref } from 'utils/sponsor';

const COLLECTION = 'PublicAnalyticsEvents';
const SESSION_KEY = 'progas-analytics-session';
const SESSION_DURATION = 30 * 60 * 1000;
let memorySession: { id: string; expires: number };
const recorded = new Set<string>();
const pending = new Set<string>();

function sessionId() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (stored && typeof stored.id === 'string' && /^[a-f0-9-]{36}$/.test(stored.id) && stored.expires > Date.now()) memorySession = stored;
  } catch { /* Storage can be unavailable; retain the in-memory session. */ }
  if (!memorySession || memorySession.expires <= Date.now()) memorySession = { id: uuid(), expires: 0 };
  memorySession.expires = Date.now() + SESSION_DURATION;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(memorySession)); } catch { /* No navigation dependency on storage. */ }
  return memorySession.id;
}

async function track(input: AnalyticsInput): Promise<void> {
  // Measurements never delay navigation and contain only public catalogue data.
  try {
    const url = input.type === 'link_click' ? sponsorContactHref(input.url || '') : '';
    const businessId = input.type === 'link_click' ? input.businessId || '' : '';
    if (input.type === 'link_click' && (!businessId || !/^(https?:\/\/|mailto:)/i.test(url))) return;
    const network = input.type === 'link_click' ? networkFor(url) || 'other' : '';
    const session = sessionId();
    const bytes = new TextEncoder().encode(JSON.stringify([input.type, businessId, url]));
    const hash = await window.crypto.subtle.digest('SHA-256', bytes);
    const digest = Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    const eventId = `${session}_${input.type}_${digest}`;
    const key = `progas-analytics:${eventId}`;
    let alreadyRecorded = recorded.has(key);
    try { alreadyRecorded = alreadyRecorded || sessionStorage.getItem(key) === '1'; } catch { /* Use memory. */ }
    if (alreadyRecorded || pending.has(key)) return;
    pending.add(key);
    try {
      await setDoc(doc(db, COLLECTION, eventId), { type: input.type, sessionId: session, digest, businessId, url, network, source: input.source, createdAt: serverTimestamp() });
      recorded.add(key);
      try { sessionStorage.setItem(key, '1'); } catch { /* Use memory. */ }
    } finally { pending.delete(key); }
  } catch { /* Best effort: denied rules/offline must not interrupt visitors. */ }
}

async function getReport(from: Date, until: Date): Promise<AnalyticsReport> {
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(until.getTime()) || from >= until || until.getTime() - from.getTime() > 92 * 86400000) throw new Error('Seleccione un período válido de hasta 92 días.');
  const report: AnalyticsReport = { visits: 0, browseClicks: 0, linkClicks: 0, links: [] };
  const links = new Map<string, AnalyticsReport['links'][number]>();
  let cursor: QueryDocumentSnapshot<DocumentData>;
  for (;;) {
    const constraints = [where('createdAt', '>=', Timestamp.fromDate(from)), where('createdAt', '<', Timestamp.fromDate(until)), orderBy('createdAt'), limit(500)];
    const page = await getDocs(cursor ? query(collection(db, COLLECTION), ...constraints, startAfter(cursor)) : query(collection(db, COLLECTION), ...constraints));
    page.docs.forEach(item => {
      const data = item.data();
      if (data.type === 'page_view') report.visits += 1;
      if (data.type === 'browse_click') report.browseClicks += 1;
      if (data.type === 'link_click') {
        report.linkClicks += 1;
        const key = JSON.stringify([data.businessId, data.url]);
        const row = links.get(key) || { businessId: data.businessId, url: data.url, network: data.network, clicks: 0 };
        row.clicks += 1;
        links.set(key, row);
      }
    });
    if (page.docs.length < 500) break;
    cursor = page.docs[page.docs.length - 1];
  }
  report.links = Array.from(links.values()).sort((a, b) => b.clicks - a.clicks);
  return report;
}

const AnalyticsService = { track, getReport };
export default AnalyticsService;
