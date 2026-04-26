import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import {
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  CloudUpload,
  ImagePlus,
  Trash2,
  Settings,
  Info,
  Send,
} from "lucide-react";
import { Modal, Button, TextField, SectionCard, Toast, Spinner } from "shared/components/ui";
import { FullScreenLoader } from "shared/components/loaders/FullScreenLoader";
import {
  sendPasswordReset,
  verifyCurrentPassword,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";

const TABS = [
  { id: "account", label: "Mi cuenta", Icon: UserCircle },
  { id: "password", label: "Contraseña", Icon: Lock },
];

function SettingsModal({ open, onClose }) {
  const { currentUser, userProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: "info", message: "" });
  const [activeTab, setActiveTab] = useState("account");
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setSnackbar({ open: false, severity: "info", message: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const processFile = async (file) => {
    if (!file || !currentUser) return;
    setUploadingPhoto(true);
    try {
      await uploadProfilePhoto(file, currentUser.uid);
      setSnackbar({ open: true, severity: "success", message: "Foto de perfil actualizada." });
    } catch (error) {
      console.error("Error al subir foto:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "Error al subir la foto.",
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoUpload = async (event) => {
    await processFile(event.target.files?.[0]);
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processFile(file);
    } else {
      setSnackbar({ open: true, severity: "error", message: "Solo se aceptan archivos de imagen." });
    }
  };

  const handlePhotoDelete = async () => {
    if (!currentUser) return;
    if (!window.confirm("¿Eliminar tu foto de perfil?")) return;
    setUploadingPhoto(true);
    try {
      await deleteProfilePhoto(currentUser.uid);
      setSnackbar({ open: true, severity: "success", message: "Foto eliminada." });
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "Error al eliminar la foto.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentPassword) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: "Ingresa tu contraseña actual.",
      });
      return;
    }
    if (!currentUser?.email) {
      setSnackbar({ open: true, severity: "error", message: "No se pudo obtener tu correo." });
      return;
    }
    setIsLoading(true);
    try {
      await verifyCurrentPassword(currentPassword);
      await sendPasswordReset(currentUser.email);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Te enviamos un correo con el enlace para restablecer tu contraseña.",
      });
      setTimeout(() => {
        setCurrentPassword("");
        handleClose();
      }, 1800);
    } catch (error) {
      console.error("Error al solicitar restablecimiento:", error);
      let message = "Ocurrió un error. Inténtalo más tarde.";
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        message = "La contraseña actual es incorrecta.";
      } else if (error.code === "auth/user-not-found") {
        message = "No se encontró tu cuenta.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Demasiados intentos. Espera unos minutos.";
      }
      setSnackbar({ open: true, severity: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        size="lg"
        eyebrow="Configuración"
        title="Ajustes de la cuenta"
        subtitle="Administra tu foto de perfil, correo y credenciales."
        icon={<Settings className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cerrar
            </Button>
            {activeTab === "password" && (
              <Button
                type="button"
                variant="primary"
                onClick={handlePasswordReset}
                loading={isLoading}
                disabled={isLoading || !currentPassword}
              >
                <Send className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Enviar enlace
              </Button>
            )}
          </>
        }
      >
        {isLoading && <FullScreenLoader />}

        <div role="tablist" className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                  active
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                <t.Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "account" && (
          <div className="space-y-5">
            <SectionCard
              eyebrow="Foto de perfil"
              title="Imagen pública"
              subtitle="Arrastra una imagen, o haz clic para subir. Máx. 5MB · JPG/PNG/GIF/WebP."
              icon={<ImagePlus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                className={[
                  "relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 py-8 transition-all duration-200",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                  uploadingPhoto ? "cursor-not-allowed opacity-90" : "cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary-50"
                    : "border-slate-300 bg-slate-50 hover:border-primary hover:bg-primary-50/40",
                ].join(" ")}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto || isLoading}
                />

                {uploadingPhoto ? (
                  <>
                    <Spinner size="lg" className="mb-2 border-primary" />
                    <p className="text-sm font-medium text-slate-700">Subiendo foto…</p>
                  </>
                ) : userProfile?.photoURL ? (
                  <>
                    <div className="relative inline-flex">
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile?.name || "Usuario"}
                        className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                      />
                      <button
                        type="button"
                        disabled={uploadingPhoto || isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhotoDelete();
                        }}
                        className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-rose-700 disabled:opacity-50"
                        aria-label="Eliminar foto"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {userProfile?.name || "Usuario"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Arrastra otra imagen o haz clic para cambiar.
                    </p>
                  </>
                ) : (
                  <>
                    <span
                      className={[
                        "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors",
                        isDragging ? "bg-primary text-white" : "bg-white text-slate-400 border border-slate-200",
                      ].join(" ")}
                    >
                      {isDragging ? (
                        <CloudUpload className="h-7 w-7" strokeWidth={2} aria-hidden />
                      ) : (
                        <ImagePlus className="h-7 w-7" strokeWidth={2} aria-hidden />
                      )}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">
                      {isDragging ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      JPG · PNG · GIF · WebP &middot; Máx. 5MB
                    </p>
                  </>
                )}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Identidad"
              title="Información de la cuenta"
              icon={<UserCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <TextField
                id="account-email"
                label="Correo electrónico"
                value={currentUser?.email || ""}
                disabled
                hint="El correo no se puede cambiar desde aquí. Contacta al administrador si lo necesitas."
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "password" && (
          <div className="space-y-5">
            <SectionCard
              eyebrow="Seguridad"
              title="Cambiar contraseña"
              subtitle="Verifica tu contraseña actual y te enviaremos un enlace para configurar una nueva."
              icon={<Lock className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <TextField
                id="current-password"
                label="Contraseña actual"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="pointer-events-auto text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                    )}
                  </button>
                }
              />

              <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
                <Info className="h-5 w-5 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                <p className="text-xs text-primary-900 leading-relaxed">
                  Después de verificar tu contraseña actual recibirás un correo con el enlace para
                  configurar una nueva. Revisa también la carpeta de spam.
                </p>
              </div>
            </SectionCard>
          </div>
        )}
      </Modal>

      <Toast
        open={snackbar.open}
        onClose={closeSnackbar}
        message={snackbar.message}
        type={
          snackbar.severity === "error"
            ? "error"
            : snackbar.severity === "success"
            ? "success"
            : snackbar.severity === "warning"
            ? "warning"
            : "info"
        }
        duration={4000}
      />
    </>
  );
}

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsModal;
