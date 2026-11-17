import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const HIGHLIGHT_MS = 2400;

/**
 * Desplaza hasta la cancha indicada en `?fieldId=` y la resalta un momento.
 * - Amplía la paginación si la cancha no está en la página visible (`ensureVisible`).
 * - El ref de "procesado" se resetea cuando el parámetro desaparece, así una nueva
 *   navegación a otro (o al mismo) fieldId vuelve a funcionar.
 * - Los timeouts se limpian al desmontar.
 * @returns {{ highlightedId: string|null, registerNode: (id) => (el) => void }}
 */
export default function useScrollToField({ items, visibleItems, loading, ensureVisible }) {
  const location = useLocation();
  const navigate = useNavigate();
  const nodesRef = useRef(new Map());
  const processedRef = useRef(null);
  const timersRef = useRef([]);
  const [highlightedId, setHighlightedId] = useState(null);

  const targetId = useMemo(() => new URLSearchParams(location.search).get("fieldId"), [location.search]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    },
    []
  );

  useEffect(() => {
    if (!targetId) processedRef.current = null;
  }, [targetId]);

  const index = useMemo(
    () => (targetId ? items.findIndex((f) => f.id === targetId) : -1),
    [items, targetId]
  );

  useEffect(() => {
    if (index >= 0) ensureVisible(index);
  }, [index, ensureVisible]);

  const clearParam = useCallback(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has("fieldId")) return;
    params.delete("fieldId");
    const search = params.toString();
    navigate(`${location.pathname}${search ? `?${search}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!targetId || loading || processedRef.current === targetId) return;
    if (index === -1) {
      // No está en la lista actual (filtro/permiso): se descarta el parámetro.
      processedRef.current = targetId;
      clearParam();
      return;
    }
    const node = nodesRef.current.get(targetId);
    if (!node) return; // se reintenta cuando visibleItems incluya la cancha
    processedRef.current = targetId;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [
      setTimeout(() => {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(targetId);
      }, 80),
      setTimeout(() => setHighlightedId(null), 80 + HIGHLIGHT_MS),
    ];
    clearParam();
  }, [targetId, loading, index, visibleItems, clearParam]);

  const registerNode = useCallback(
    (id) => (el) => {
      if (el) nodesRef.current.set(id, el);
      else nodesRef.current.delete(id);
    },
    []
  );

  return { highlightedId, registerNode };
}
