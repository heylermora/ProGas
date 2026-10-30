import { useCallback, useEffect, useState } from 'react';
import { BusinessCategorySettings, defaultBusinessSettings } from 'utils/businessCategories';
import CategoryService, { CategoryKind } from 'services/CategoryService';

export default function useCategories(kind: CategoryKind) {
  const [categories, setCategories] = useState<string[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessCategorySettings>(defaultBusinessSettings([]));
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try { const values = await CategoryService.get(kind); setCategories(values); if (kind === 'sponsors') { setBusinessSettings(defaultBusinessSettings(values)); setBusinessSettings(await CategoryService.getBusinessSettings(values)); } }
    catch { /* Preserve the initial grouping when settings cannot be read. */ }
    finally { setLoading(false); }
  }, [kind]);
  useEffect(() => { reload(); }, [reload]);
  return { categories, businessSettings, loading, reload };
}
