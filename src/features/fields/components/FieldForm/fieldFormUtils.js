// Utilidades del formulario de cancha (alta, edición del asociado y edición admin).
// Las reglas replican sanitizeFieldData (shared/services/fieldsService) para mostrar
// errores en línea antes de llegar al servicio.

import { isValidTime, minutesFromTime } from "shared/utils/date";

export const EMPTY_FIELD_VALUES = Object.freeze({
  name: "",
  address: "",
  description: "",
  pricePerHour: "",
  imageUrl: "",
  openingTime: "08:00",
  closingTime: "22:00",
});

/** Cancha de Firestore → valores del formulario (todo string). */
export const fieldToValues = (field) => ({
  name: field?.name || "",
  address: field?.address || "",
  description: field?.description || "",
  pricePerHour:
    field?.pricePerHour !== undefined && field?.pricePerHour !== null ? String(field.pricePerHour) : "",
  imageUrl: field?.imageUrl || "",
  openingTime: field?.openingTime || EMPTY_FIELD_VALUES.openingTime,
  closingTime: field?.closingTime || EMPTY_FIELD_VALUES.closingTime,
});

/**
 * Valida los valores del formulario.
 * @returns {Record<string,string>} errores por campo (vacío si es válido).
 */
export const validateFieldValues = (values) => {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = "El nombre es obligatorio.";
  else if (name.length > 120) errors.name = "Máximo 120 caracteres.";

  const address = values.address.trim();
  if (!address) errors.address = "La dirección es obligatoria.";
  else if (address.length > 250) errors.address = "Máximo 250 caracteres.";

  if (values.description.trim().length > 3000) errors.description = "La descripción es demasiado larga.";

  const price = Number(values.pricePerHour);
  if (values.pricePerHour === "" || !Number.isFinite(price)) {
    errors.pricePerHour = "Indica el precio por hora.";
  } else if (price <= 0) {
    errors.pricePerHour = "El precio debe ser mayor que 0.";
  } else if (price > 100000000) {
    errors.pricePerHour = "El precio no es válido.";
  }

  if (!isValidTime(values.openingTime)) errors.openingTime = "Hora no válida (HH:mm).";
  if (!isValidTime(values.closingTime)) errors.closingTime = "Hora no válida (HH:mm).";
  if (
    !errors.openingTime &&
    !errors.closingTime &&
    minutesFromTime(values.openingTime) >= minutesFromTime(values.closingTime)
  ) {
    errors.closingTime = "El cierre debe ser posterior a la apertura (sin cruzar medianoche).";
  }

  const url = values.imageUrl.trim();
  if (url && (!/^https?:\/\//i.test(url) || url.length > 2048)) {
    errors.imageUrl = "La URL debe empezar por https://";
  }
  return errors;
};

/** Valores del formulario → payload para createField/updateField/updateFieldAsAdmin. */
export const valuesToPayload = (values) => ({
  name: values.name.trim(),
  address: values.address.trim(),
  description: values.description.trim(),
  pricePerHour: Number(values.pricePerHour),
  imageUrl: values.imageUrl.trim() || null,
  openingTime: values.openingTime,
  closingTime: values.closingTime,
});
