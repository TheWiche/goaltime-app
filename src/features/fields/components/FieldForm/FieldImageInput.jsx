import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button, cx, focusRing } from "shared/components/ui";
import { ALLOWED_IMAGE_TYPES, validateImageFile } from "shared/services/firebaseService";
import FieldCover from "../FieldCover";

const ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** URL temporal (blob:) para previsualizar un File; se revoca al cambiar o desmontar. */
function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

/**
 * Selector de portada de cancha: vista previa 16:9, arrastrar/soltar, validación
 * (JPG/PNG/WEBP < 5 MB), progreso de subida y quitar imagen.
 * Controlado: `file` (File pendiente de subir) y `url` (imagen ya guardada o URL escrita).
 */
function FieldImageInput({ id, file, url, onFileChange, onRemove, error, onError, progress, disabled = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const fileUrl = useObjectUrl(file);
  const previewSrc = fileUrl || url || null;
  const uploading = typeof progress === "number";
  const locked = disabled || uploading;
  const errorId = `${id}-error`;
  const statusId = `${id}-status`;

  const pick = (candidate) => {
    if (!candidate) return;
    try {
      validateImageFile(candidate);
      onError(null);
      onFileChange(candidate);
    } catch (err) {
      onError(err.message);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!locked) pick(event.dataTransfer?.files?.[0]);
  };

  const dragProps = {
    onDragOver: (event) => {
      event.preventDefault();
      if (!locked) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: handleDrop,
  };

  const statusText = uploading
    ? `Subiendo imagen… ${progress}%`
    : file
      ? file.name
      : previewSrc
        ? "Imagen actual de la cancha."
        : "Aún no hay imagen.";
  const metaText =
    file && !uploading
      ? `${formatBytes(file.size)} · se subirá al guardar.`
      : "JPG, PNG o WEBP · máx. 5 MB · horizontal (16:9) recomendado.";

  return (
    <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,300px)_1fr]">
      {previewSrc ? (
        <div {...dragProps} className="relative">
          <FieldCover
            src={previewSrc}
            alt="Vista previa de la portada"
            className={cx(
              "rounded-md border",
              dragging ? "border-primary-500 ring-2 ring-primary-500/30" : "border-line"
            )}
          >
            {uploading && (
              <div className="absolute inset-x-0 bottom-0 border-t border-line bg-white px-3 py-2">
                <div
                  className="h-1.5 overflow-hidden rounded-sm bg-zinc-200"
                  role="progressbar"
                  aria-label="Progreso de subida"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div className="h-full bg-primary-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </FieldCover>
        </div>
      ) : (
        <button
          type="button"
          {...dragProps}
          onClick={() => inputRef.current?.click()}
          disabled={locked}
          aria-describedby={cx(statusId, error && errorId) || undefined}
          className={cx(
            "flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-4 text-center transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
            focusRing,
            dragging
              ? "border-primary-500 bg-primary-50/50"
              : error
                ? "border-red-300 bg-red-50/40 hover:border-red-400"
                : "border-line-strong bg-zinc-50 hover:border-zinc-400"
          )}
        >
          <ImagePlus className="h-6 w-6 text-fg-subtle" strokeWidth={1.5} aria-hidden />
          <span className="text-[13px] font-medium text-fg">Subir imagen</span>
          <span className="text-xs text-fg-subtle">o arrástrala aquí</span>
        </button>
      )}

      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <p id={statusId} className="truncate text-[13px] text-fg" aria-live="polite">
            {statusText}
          </p>
          <p className="text-xs text-fg-subtle">{metaText}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<Upload className="h-3.5 w-3.5" aria-hidden />}
            disabled={locked}
            onClick={() => inputRef.current?.click()}
          >
            {previewSrc ? "Cambiar imagen" : "Elegir archivo"}
          </Button>
          {previewSrc && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
              disabled={locked}
              onClick={() => {
                onError(null);
                onRemove();
              }}
            >
              Quitar imagen
            </Button>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs leading-snug text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label="Seleccionar imagen de portada"
        disabled={locked}
        onChange={(event) => {
          pick(event.target.files?.[0]);
          // Permite volver a elegir el mismo archivo tras quitarlo o tras un error.
          event.target.value = "";
        }}
      />
    </div>
  );
}

FieldImageInput.propTypes = {
  id: PropTypes.string.isRequired,
  file: PropTypes.object,
  url: PropTypes.string,
  onFileChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  error: PropTypes.string,
  onError: PropTypes.func.isRequired,
  progress: PropTypes.number,
  disabled: PropTypes.bool,
};

export default FieldImageInput;
