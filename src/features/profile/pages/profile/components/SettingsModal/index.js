import { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff, ImagePlus, Info, Send, Settings, Trash2, Upload } from "lucide-react";
import {
  Avatar,
  Button,
  Modal,
  SectionCard,
  Spinner,
  Tabs,
  TextField,
  Toast,
  cx,
  getTabPanelProps,
} from "shared/components/ui";
import ConfirmationDialog from "shared/components/layout/ConfirmationDialog";
import {
  sendPasswordReset,
  verifyCurrentPassword,
  uploadProfilePhoto,
  deleteProfilePhoto,
  ALLOWED_IMAGE_TYPES,
} from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import { logger } from "shared/utils/logger";

const TAB_PREFIX = "settings";
const ACCEPT = ALLOWED_IMAGE_TYPES.join(",");
const CLOSE_AFTER_RESET_MS = 1800;

function passwordErrorMessage(error) {
  switch (error?.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "La contraseña actual es incorrecta.";
    case "auth/user-not-found":
      return "No se encontró tu cuenta.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos.";
    default:
      return error?.message || "Ocurrió un error. Inténtalo más tarde.";
  }
}

function SettingsModal({ open, onClose, initialTab }) {
  const { currentUser, userProfile } = useAuth();
  const fileInputRef = useRef(null);
  const closeTimerRef = useRef(null);

  const hasPassword = Boolean(currentUser?.providerData?.some((p) => p.providerId === "password"));

  const [activeTab, setActiveTab] = useState("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  const tabs = useMemo(
    () => [
      { value: "account", label: "Mi cuenta" },
      ...(hasPassword ? [{ value: "password", label: "Contraseña" }] : []),
    ],
    [hasPassword]
  );

  const panelProps = (value) => (tabs.length > 1 ? getTabPanelProps(TAB_PREFIX, value) : {});

  const showToast = (type, message) => setToast({ open: true, type, message });

  // Limpia el temporizador de cierre al desmontar.
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    []
  );

  // Al abrir, vuelve a la pestaña solicitada.
  useEffect(() => {
    if (open) setActiveTab(initialTab === "password" && hasPassword ? "password" : "account");
  }, [open, initialTab, hasPassword]);

  const handleClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setCurrentPassword("");
    setShowCurrentPassword(false);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const processFile = async (file) => {
    if (!file || !currentUser || uploadingPhoto) return;
    setUploadingPhoto(true);
    try {
      await uploadProfilePhoto(file, currentUser.uid);
      showToast("success", "Foto de perfil actualizada.");
    } catch (error) {
      logger.error("uploadProfilePhoto", error);
      showToast("error", error.message || "Error al subir la foto.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("error", "La imagen debe ser PNG, JPG o WEBP.");
      return;
    }
    await processFile(file);
  };

  const confirmPhotoDelete = async () => {
    if (!currentUser) return;
    setUploadingPhoto(true);
    try {
      await deleteProfilePhoto(currentUser.uid);
      showToast("success", "Foto eliminada.");
    } catch (error) {
      logger.error("deleteProfilePhoto", error);
      showToast("error", error.message || "Error al eliminar la foto.");
    } finally {
      setUploadingPhoto(false);
      setConfirmDeleteOpen(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    if (!currentPassword) {
      showToast("warning", "Ingresa tu contraseña actual.");
      return;
    }
    if (!currentUser?.email) {
      showToast("error", "No se pudo obtener tu correo.");
      return;
    }
    setIsLoading(true);
    try {
      await verifyCurrentPassword(currentPassword);
      await sendPasswordReset(currentUser.email);
      showToast("success", "Te enviamos un correo con el enlace para restablecer tu contraseña.");
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        handleClose();
      }, CLOSE_AFTER_RESET_MS);
    } catch (error) {
      logger.error("password reset", error);
      showToast("error", passwordErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const busy = isLoading || uploadingPhoto;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        size="lg"
        eyebrow="Configuración"
        title="Ajustes de la cuenta"
        subtitle="Administra tu foto de perfil y tus credenciales."
        icon={<Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cerrar
            </Button>
            {activeTab === "password" && (
              <Button
                type="submit"
                form="password-reset-form"
                loading={isLoading}
                disabled={!currentPassword}
                leftIcon={<Send className="h-4 w-4" aria-hidden />}
              >
                Enviar enlace
              </Button>
            )}
          </>
        }
      >
        {tabs.length > 1 && (
          <Tabs
            aria-label="Secciones de ajustes"
            idPrefix={TAB_PREFIX}
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            className="mb-5"
          />
        )}

        {activeTab === "account" && (
          <div {...panelProps("account")} className="space-y-5 outline-none">
            <SectionCard
              title="Foto de perfil"
              subtitle="JPG, PNG o WebP · máx. 5 MB. También puedes arrastrar una imagen aquí."
              icon={<ImagePlus className="h-4 w-4" aria-hidden />}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!uploadingPhoto) setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={cx(
                  "flex flex-col items-center gap-4 rounded-lg border border-dashed px-4 py-6 transition-colors duration-150 sm:flex-row",
                  isDragging ? "border-primary-500 bg-primary-50/50" : "border-line-strong bg-zinc-50"
                )}
              >
                <div className="relative">
                  <Avatar src={userProfile?.photoURL} name={userProfile?.name} size="xl" />
                  {uploadingPhoto && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80">
                      <Spinner size="md" label="Procesando foto" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="truncate text-sm font-medium text-fg-strong">
                    {userProfile?.name || "Usuario"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-fg-muted" aria-live="polite">
                    {isDragging ? "Suelta la imagen para subirla" : "Esta imagen se muestra en tu perfil."}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      leftIcon={<Upload className="h-3.5 w-3.5" aria-hidden />}
                      disabled={busy}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {userProfile?.photoURL ? "Cambiar foto" : "Subir foto"}
                    </Button>
                    {userProfile?.photoURL && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
                        disabled={busy}
                        onClick={() => setConfirmDeleteOpen(true)}
                      >
                        Eliminar foto
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  hidden
                  onChange={(e) => processFile(e.target.files?.[0])}
                />
              </div>
            </SectionCard>

            <SectionCard title="Información de la cuenta">
              <TextField
                id="account-email"
                label="Correo electrónico"
                value={currentUser?.email || ""}
                readOnly
                disabled
                hint="El correo no se puede cambiar desde aquí. Contacta al administrador si lo necesitas."
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "password" && hasPassword && (
          <div {...panelProps("password")} className="outline-none">
            <SectionCard
              title="Cambiar contraseña"
              subtitle="Verifica tu contraseña actual y te enviaremos un enlace para crear una nueva."
            >
              <form id="password-reset-form" onSubmit={handlePasswordReset} noValidate>
                <TextField
                  id="current-password"
                  label="Contraseña actual"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  inputClassName="pr-10"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="pointer-events-auto rounded p-1 text-fg-subtle transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                      aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={showCurrentPassword}
                    >
                      {showCurrentPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                    </button>
                  }
                />
              </form>

              <div className="mt-4 flex items-start gap-2.5 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                <p className="text-[13px] leading-5 text-primary-900">
                  Después de verificar tu contraseña actual recibirás un correo con el enlace para
                  crear una nueva. Revisa también la carpeta de spam.
                </p>
              </div>
            </SectionCard>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmPhotoDelete}
        loading={uploadingPhoto}
        title="Eliminar foto de perfil"
        message="Tu foto se eliminará y volverás a ver tus iniciales. Podrás subir otra cuando quieras."
        confirmColor="error"
        confirmLabel="Eliminar foto"
      />

      <Toast
        open={toast.open}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.message || " "}
        type={toast.type}
        duration={4000}
      />
    </>
  );
}

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialTab: PropTypes.oneOf(["account", "password"]),
};

SettingsModal.defaultProps = {
  initialTab: "account",
};

export default SettingsModal;
