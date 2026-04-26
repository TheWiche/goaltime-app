import PropTypes from "prop-types";
import { TextField, Textarea, SectionCard } from "shared/components/ui";

function FieldFormFields({ values, onChange, disabled = false, showImagePreview = true }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  return (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Datos generales"
        title="Información de la cancha"
        subtitle="Esto es lo que verán los clientes en el catálogo."
      >
        <div className="space-y-5">
          <TextField
            id="cancha-nombre"
            label="Nombre de la cancha"
            required
            value={values.name}
            onChange={set("name")}
            placeholder="Ej. Cancha Sintética El Estadio"
            disabled={disabled}
            autoFocus
          />
          <TextField
            id="cancha-direccion"
            label="Dirección completa"
            required
            value={values.address}
            onChange={set("address")}
            placeholder="Calle, número, barrio, ciudad"
            disabled={disabled}
          />
          <Textarea
            id="cancha-descripcion"
            label="Descripción"
            optional
            rows={3}
            value={values.description}
            onChange={set("description")}
            placeholder="Superficie, iluminación, vestuarios, estacionamiento…"
            hint="Describe las características que ayudan al cliente a decidir."
            disabled={disabled}
          />
        </div>
      </SectionCard>

      <SectionCard eyebrow="Operación" title="Tarifa y horario">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <TextField
            id="cancha-precio"
            label="Precio por hora"
            type="number"
            required
            prefix="$"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={values.pricePerHour}
            onChange={set("pricePerHour")}
            disabled={disabled}
          />
          <TextField
            id="cancha-apertura"
            label="Apertura"
            type="time"
            required
            value={values.openingTime}
            onChange={set("openingTime")}
            disabled={disabled}
          />
          <TextField
            id="cancha-cierre"
            label="Cierre"
            type="time"
            required
            value={values.closingTime}
            onChange={set("closingTime")}
            disabled={disabled}
          />
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Galería"
        title="Imagen de portada"
        subtitle="URL HTTPS de una imagen horizontal (recomendado 16:9)."
      >
        <TextField
          id="cancha-imagen"
          label="URL de la imagen"
          type="url"
          optional
          value={values.imageUrl}
          onChange={set("imageUrl")}
          placeholder="https://…"
          disabled={disabled}
        />
        {showImagePreview && values.imageUrl ? (
          <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={values.imageUrl}
              alt="Vista previa"
              className="w-full aspect-video object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : null}
      </SectionCard>
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
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showImagePreview: PropTypes.bool,
};

export default FieldFormFields;
