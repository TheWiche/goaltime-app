import { useCallback, useEffect, useMemo, useState } from "react";

export const PAGE_SIZE = 20;

/**
 * Paginación simple en cliente ("Cargar más").
 * Vuelve a la primera página cuando cambia `resetKey` (filtro, búsqueda…).
 */
export default function useLoadMore(items, { pageSize = PAGE_SIZE, resetKey } = {}) {
  const [visible, setVisible] = useState(pageSize);

  useEffect(() => {
    setVisible(pageSize);
  }, [resetKey, pageSize]);

  const visibleItems = useMemo(() => items.slice(0, visible), [items, visible]);
  const loadMore = useCallback(() => setVisible((v) => v + pageSize), [pageSize]);
  /** Asegura que el elemento en `index` sea visible (p.ej. scroll a ?fieldId=). */
  const ensureVisible = useCallback(
    (index) => {
      if (index < 0) return;
      setVisible((v) => (index < v ? v : Math.ceil((index + 1) / pageSize) * pageSize));
    },
    [pageSize]
  );

  return {
    visibleItems,
    total: items.length,
    hasMore: visible < items.length,
    loadMore,
    ensureVisible,
  };
}
