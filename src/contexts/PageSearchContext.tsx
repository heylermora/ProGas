import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

type PageSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
  placeholder: string;
  enabled: boolean;
};

const SEARCHABLE_PAGES = [
  { path: '/admin/order/index', placeholder: 'Buscar pedidos' },
  { path: '/admin/product/index', placeholder: 'Buscar productos' },
  { path: '/admin/client/index', placeholder: 'Buscar clientes' },
  { path: '/admin/user/index', placeholder: 'Buscar colaboradores' },
  { path: '/admin/sponsor/index', placeholder: 'Buscar patrocinadores' },
];

const PageSearchContext = createContext<PageSearchContextValue | undefined>(undefined);

export function PageSearchProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const page = useMemo(
    () => SEARCHABLE_PAGES.find(({ path }) => pathname.startsWith(path)),
    [pathname]
  );

  useEffect(() => setQuery(''), [pathname]);

  return (
    <PageSearchContext.Provider value={{
      query,
      setQuery,
      enabled: Boolean(page),
      placeholder: page?.placeholder || 'Búsqueda no disponible',
    }}>
      {children}
    </PageSearchContext.Provider>
  );
}

export function usePageSearch() {
  const context = useContext(PageSearchContext);
  if (!context) throw new Error('usePageSearch debe usarse dentro de PageSearchProvider');
  return context;
}
