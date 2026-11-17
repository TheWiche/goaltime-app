import { useState, useEffect } from "react";
import SettingsModal from "features/profile/pages/profile/components/SettingsModal";

export const OPEN_SETTINGS_EVENT = "openSettingsModal";

/**
 * Abre el modal de ajustes de cuenta (montado una sola vez en App).
 * @param {"account"|"password"} [tab] pestaña inicial.
 */
export function openSettingsModal(tab) {
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT, { detail: { tab } }));
}

function GlobalSettingsModal() {
  const [open, setOpen] = useState(false);
  const [initialTab, setInitialTab] = useState("account");

  useEffect(() => {
    const handleOpenSettings = (event) => {
      setInitialTab(event?.detail?.tab === "password" ? "password" : "account");
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, handleOpenSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handleOpenSettings);
  }, []);

  return <SettingsModal open={open} onClose={() => setOpen(false)} initialTab={initialTab} />;
}

export default GlobalSettingsModal;
