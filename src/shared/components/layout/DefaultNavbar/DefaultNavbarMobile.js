import { MDBox } from "shared/components/md-shims";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import DefaultNavbarLink from "./DefaultNavbarLink";

function DefaultNavbarMobile({ open, close }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const rect =
    typeof open.getBoundingClientRect === "function" ? open.getBoundingClientRect() : null;
  const top = rect ? Math.min(rect.bottom + 8, window.innerHeight - 120) : 72;
  const left = rect ? Math.max(16, rect.right - 280) : 16;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1040] cursor-default bg-slate-900/20"
        aria-label="Cerrar menú"
        onClick={close}
      />
      <div
        className="fixed z-[1050] max-h-[min(70vh,480px)] w-[min(calc(100vw-2rem),280px)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
        style={{ top, left }}
        role="menu"
      >
        <MDBox px={0.5}>
          <DefaultNavbarLink icon="donut_large" name="dashboard" route="/dashboard" light={false} />
          <DefaultNavbarLink icon="person" name="profile" route="/profile" light={false} />
          <DefaultNavbarLink
            icon="account_circle"
            name="sign up"
            route="/authentication/sign-up"
            light={false}
          />
          <DefaultNavbarLink icon="key" name="sign in" route="/authentication/sign-in" light={false} />
        </MDBox>
      </div>
    </>,
    document.body
  );
}

DefaultNavbarMobile.propTypes = {
  open: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  close: PropTypes.oneOfType([PropTypes.func, PropTypes.bool, PropTypes.object]).isRequired,
};

export default DefaultNavbarMobile;
