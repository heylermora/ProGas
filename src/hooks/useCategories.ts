import { useCallback, useEffect, useState } from 'react';
import CategoryService, { CategoryKind } from 'services/CategoryService';

export default function useCategories(kind: CategoryKind) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try { setCategories(await CategoryService.get(kind)); }
    finally { setLoading(false); }
  }, [kind]);
  useEffect(() => { reload(); }, [reload]);
  return { categories, loading, reload };
}
