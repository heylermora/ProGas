export type SponsorType = 'VIP' | 'Premium' | 'General';

interface SponsorItem {
  id: string;
  name: string;
  type: SponsorType;
  active: boolean;
  order: number;
  logoUrl: string;
  videoUrl?: string;
  links: string[];
  description?: string;
}

export default SponsorItem;
