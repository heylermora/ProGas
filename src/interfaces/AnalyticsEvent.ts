import { Timestamp } from 'firebase/firestore';

export type AnalyticsType = 'page_view' | 'browse_click' | 'link_click';
export type AnalyticsSource = 'home' | 'mall' | 'mall-preview' | 'sponsor-strip';
export interface AnalyticsEvent {
  type: AnalyticsType;
  sessionId: string;
  digest: string;
  businessId: string;
  url: string;
  network: string;
  source: AnalyticsSource;
  createdAt: Timestamp;
}
export interface AnalyticsInput {
  type: AnalyticsType;
  businessId?: string;
  url?: string;
  source: AnalyticsSource;
}
export interface AnalyticsReport {
  visits: number;
  browseClicks: number;
  linkClicks: number;
  links: { businessId: string; url: string; network: string; clicks: number }[];
}
