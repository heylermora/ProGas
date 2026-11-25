import { useEffect, useState } from 'react';
import PromotionService, { PromotionRequest } from 'services/PromotionService';

export default function usePromotionRequests(enabled = true) {
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    if (!enabled) return;
    return PromotionService.watch(items => { setRequests(items); setStatus('ready'); }, () => setStatus('error'));
  }, [enabled]);
  return { requests, status };
}
