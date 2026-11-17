import { useEffect, useRef } from "react";

/**
 * Cierra un popover/menú al pulsar fuera, al mover el foco fuera o al pulsar Escape.
 * Con Escape devuelve el foco a `returnFocusRef` (normalmente el botón disparador).
 *
 * @param {object} opts
 * @param {boolean} opts.open
 * @param {(info: {reason: "outside"|"blur"|"escape"}) => void} opts.onDismiss
 * @param {Array<{current: HTMLElement|null}>} opts.refs elementos considerados "dentro"
 * @param {{current: HTMLElement|null}} [opts.returnFocusRef]
 */
export default function useDismissable({ open, onDismiss, refs, returnFocusRef }) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const returnRef = useRef(returnFocusRef);
  returnRef.current = returnFocusRef;

  useEffect(() => {
    if (!open) return undefined;

    const isInside = (target) =>
      refsRef.current.some((r) => r?.current && r.current.contains(target));

    const onPointerDown = (e) => {
      if (!isInside(e.target)) onDismissRef.current({ reason: "outside" });
    };
    const onFocusIn = (e) => {
      if (!isInside(e.target)) onDismissRef.current({ reason: "blur" });
    };
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      onDismissRef.current({ reason: "escape" });
      returnRef.current?.current?.focus?.();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
}
