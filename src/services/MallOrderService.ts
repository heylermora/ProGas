import { db } from 'apiConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type MallOrder = Record<string, string[]>;

const settings = () => doc(db, 'SponsorDisplaySettings', 'mallOrder');
export const MallOrderService = {
  get: async (): Promise<MallOrder> => (await getDoc(settings())).data()?.positions || {},
  save: (positions: MallOrder) => setDoc(settings(), { positions }, { merge: true }),
};

export function applyMallOrder<T>(items: T[], order: string[] = [], id: (item: T) => string): T[] {
  const positions = new Map(order.map((value, index) => [value, index]));
  return [...items].sort((a, b) => (positions.get(id(a)) ?? order.length) - (positions.get(id(b)) ?? order.length));
}

export function moveMallItem(items: string[], source: string, target: string): string[] {
  if (source === target || !items.includes(source) || !items.includes(target)) return items;
  const next = items.filter(item => item !== source);
  next.splice(items.indexOf(target), 0, source);
  return next;
}
