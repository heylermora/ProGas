import { db } from 'apiConfig';
import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, setDoc, where } from 'firebase/firestore';
import SponsorItem from 'interfaces/SponsorItem';
import { requireBusinessName } from 'utils/businessName';
import { resolveSponsorCategories, sponsorCategories } from 'utils/sponsorCategories';
import CategoryService from './CategoryService';
import SponsorService from './SponsorService';

export type SponsorDetails = Omit<SponsorItem, 'id'>;
export type PromotionRequest = { id: string; contactPhone: string; sponsor: SponsorDetails };

const requests = () => collection(db, 'PromotionRequests');

const PromotionService = {
  newId: () => doc(requests()).id,
  submit: (id: string, sponsor: SponsorDetails, contactPhone: string) =>
    setDoc(doc(requests(), id), { sponsor, contactPhone, status: 'pending', createdAt: serverTimestamp() }),
  watch: (onChange: (items: PromotionRequest[]) => void, onError: () => void) =>
    onSnapshot(query(requests(), where('status', '==', 'pending')), snapshot => {
      onChange([...snapshot.docs].sort((a, b) =>
        (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0),
      ).map(item => ({ id: item.id, contactPhone: item.data().contactPhone, sponsor: item.data().sponsor })));
    }, onError),
  review: async (id: string, sponsor: SponsorDetails, contactPhone: string, approve: boolean) => {
    const request = doc(requests(), id);
    const categories = sponsorCategories(sponsor);
    const payload = approve ? resolveSponsorCategories(
      { ...sponsor, name: requireBusinessName(sponsor.name), active: true },
      await CategoryService.getCatalog('sponsors', categories),
    ) : sponsor;
    const order = approve ? await SponsorService.nextOrder(payload.category) : payload.order;
    await runTransaction(db, async transaction => {
      const current = await transaction.get(request);
      if (current.data()?.status !== 'pending') throw new Error('La solicitud ya fue tramitada.');
      if (approve) transaction.set(doc(db, 'Sponsors', id), { ...payload, order });
      transaction.update(request, { sponsor: payload, contactPhone, ...(approve ? { status: 'approved', reviewedAt: serverTimestamp() } : {}) });
    });
  },
  reject: async (id: string, reason: string) => {
    const request = doc(requests(), id);
    await runTransaction(db, async transaction => {
      const current = await transaction.get(request);
      if (current.data()?.status !== 'pending') throw new Error('La solicitud ya fue tramitada.');
      transaction.update(request, { status: 'rejected', reason: reason.trim(), reviewedAt: serverTimestamp() });
    });
  },
};

export default PromotionService;
