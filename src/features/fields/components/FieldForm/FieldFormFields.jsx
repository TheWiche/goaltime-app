import PropTypes from "prop-types";
import { TextField, Textarea } from "shared/components/ui";
import FieldImageInput from "./FieldImageInput";

const isHttpUrl = (url) => /^https?:\/\//i.test(url);

/**
 * Campos del formulario de cancha. Controlado: `values` + `onChange(nextValues)`.
 * `errors` (por campo) se muestran bajo cada control.
 * `image` (opcional): estado del archivo de portada { file, error, progress, onFileChange, onError }.
 */
function FieldFormFields({ values, errors = {}, onChange, disabled = false, idPrefix = "cancha", image = null }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  const imageUrl = values.imageUrl.trim();
  const id = (k) => `${idPrefix}-${k}`;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-fg-strong">Información general</h3>
          <p className="text-[13px] text-fg-muted">Lo que verán los clientes en el catálogo.</p>
        </div>
        <TextField
          id={id("name")}
          label="Nombre de la cancha"
          required
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          placeholder="Ej. Cancha Sintética El Estadio"
          maxLength={120}
          disabled={disabled}
          data-autofocus
        />
        <TextField
          id={id("address")}
          label="Dirección"
          required
          value={values.address}
          onChange={set("address")}
          error={errors.address}
          placeholder="Calle, número, barrio, ciudad"
          maxLength={250}
          disabled={disabled}
        />
        <Textarea
          id={id("description")}
          label="Descripción"
          optional
          rows={3}
          value={values.description}
          onChange={set("description")}
          error={errors.description}
          placeholder="Superficie, iluminación, vestuarios, estacionamiento…"
          disabled={disabled}
        />
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <div>
          <h3 className="text-sm font-semibold text-fg-strong">Tarifa y horario</h3>
          <p className="text-[13px] text-fg-muted">El horario no puede cruzar la medianoche.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            id={id("price")}
            label="Precio por hora"
            type="number"
            required
            prefix="$"
            inputMode="numeric"
            min="1"
            step="any"
            value={values.pricePerHour}
            onChange={set("pricePerHour")}
            error={errors.pricePerHour}
            hint="En pesos colombianos (COP)."
            disabled={disabled}
          />
          <TextField
            id={id("opening")}
            label="Apertura"
            type="time"
            required
            step="1800"
            value={values.openingTime}
            onChange={set("openingTime")}
            error={errors.openingTime}
            disabled={disabled}
          />
          <TextField
            id={id("closing")}
            label="Cierre"
            type="time"
            required
            step="1800"
            value={values.closingTime}
            onChange={set("closingTime")}
            error={errors.closingTime}
            disabled={disabled}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <div>
          <h3 className="text-sm font-semibold text-fg-strong">Imagen de portada</h3>
          <p className="text-[13px] text-fg-muted">Se muestra en el catálogo y en el detalle de la cancha.</p>
        </div>
        {image && (
          <FieldImageInput
            id={id("image-file")}
            file={image.file}
            url={!errors.imageUrl && isHttpUrl(imageUrl) ? imageUrl : null}
            error={image.error}
            progress={image.progress}
            disabled={disabled}
            onFileChange={image.onFileChange}
            onError={image.onError}
            onRemove={() => {
              image.onFileChange(null);
              onChange({ ...values, imageUrl: "" });
            }}
          />
        )}
        <TextField
          id={id("image")}
          label={image ? "O pega la URL de una imagen" : "URL de la imagen"}
          type="url"
          optional
          value={values.imageUrl}
          onChange={set("imageUrl")}
          error={errors.imageUrl}
          hint={image?.file ? "Se usará el archivo seleccionado en lugar de esta URL." : "Debe empezar por https://"}
          placeholder="https://…"
          disabled={disabled || Boolean(image?.file)}
        />
      </section>
    </div>
  );
}

FieldFormFields.propTypes = {
  values: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
    pricePerHour: PropTypes.string,
    imageUrl: PropTypes.string,
    openingTime: PropTypes.string,
    closingTime: PropTypes.string,
  }).isRequired,
  errors: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  idPrefix: PropTypes.string,
  image: PropTypes.shape({
    file: PropTypes.object,
    error: PropTypes.string,
    progress: PropTypes.number,
    onFileChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
  }),
};

export default FieldFormFields;
