import PropTypes from "prop-types";
import { ExternalLink, ImageOff, Pencil, Power, PowerOff } from "lucide-react";
import {
  IconButton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "shared/components/ui";
import { formatCurrency } from "shared/utils/format";
import { formatDateEs } from "shared/utils/date";
import { getFieldStatusMeta } from "shared/utils/reservationStatus";

const canToggle = (field) => field.status === "approved" || field.status === "disabled";

function Thumb({ field }) {
  return (
    <span className="flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-zinc-100 text-fg-faint">
      {field.imageUrl ? (
        <img src={field.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <ImageOff className="h-4 w-4" aria-hidden />
      )}
    </span>
  );
}

Thumb.propTypes = { field: PropTypes.object.isRequired };

function RowActions({ field, busy, onEdit, onToggle, onView }) {
  const disabled = field.status === "disabled";
  return (
    <div className="flex items-center justify-end gap-1">
      {field.status === "approved" && (
        <IconButton label="Ver en el catálogo" size="sm" onClick={() => onView(field)}>
          <ExternalLink />
        </IconButton>
      )}
      <IconButton label={`Editar ${field.name || "cancha"}`} size="sm" onClick={() => onEdit(field)}>
        <Pencil />
      </IconButton>
      {canToggle(field) && (
        <IconButton
          label={disabled ? "Habilitar cancha" : "Deshabilitar cancha"}
          size="sm"
          variant={disabled ? "ghost" : "danger"}
          disabled={busy}
          onClick={() => onToggle(field)}
        >
          {disabled ? <Power /> : <PowerOff />}
        </IconButton>
      )}
    </div>
  );
}

RowActions.propTypes = {
  field: PropTypes.object.isRequired,
  busy: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

const priceText = (field) => {
  const n = Number(field.pricePerHour);
  return Number.isFinite(n) && n > 0 ? formatCurrency(n) : "—";
};

/** Tabla de "Mis canchas" (≥ md) y lista de tarjetas apiladas (< md). */
function FieldsTable({ fields, busy, onEdit, onToggle, onView }) {
  return (
    <>
      <div className="hidden md:block">
        <Table bare caption="Mis canchas">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cancha</TableHeaderCell>
              <TableHeaderCell>Horario</TableHeaderCell>
              <TableHeaderCell align="right">Precio / h</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell className="hidden lg:table-cell">Creada</TableHeaderCell>
              <TableHeaderCell className="w-0">
                <span className="sr-only">Acciones</span>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => {
              const st = getFieldStatusMeta(field.status);
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Thumb field={field} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-fg-strong">{field.name || "Sin nombre"}</p>
                        <p className="max-w-xs truncate text-xs text-fg-subtle">{field.address || "Sin dirección"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell muted nowrap numeric>
                    {field.openingTime && field.closingTime ? `${field.openingTime} – ${field.closingTime}` : "—"}
                  </TableCell>
                  <TableCell align="right" numeric nowrap>
                    {priceText(field)}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={st.tone} size="sm" dot>
                      {st.label}
                    </StatusPill>
                  </TableCell>
                  <TableCell muted nowrap className="hidden lg:table-cell">
                    {formatDateEs(field.createdAt, { year: "numeric", month: "short", day: "numeric" }, "—")}
                  </TableCell>
                  <TableCell>
                    <RowActions field={field} busy={busy} onEdit={onEdit} onToggle={onToggle} onView={onView} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y divide-line-subtle md:hidden">
        {fields.map((field) => {
          const st = getFieldStatusMeta(field.status);
          return (
            <li key={field.id} className="flex gap-3 px-4 py-3">
              <Thumb field={field} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-fg-strong">{field.name || "Sin nombre"}</p>
                  <StatusPill tone={st.tone} size="sm" dot>
                    {st.label}
                  </StatusPill>
                </div>
                <p className="truncate text-xs text-fg-subtle">{field.address || "Sin dirección"}</p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="tabular text-xs text-fg-muted">
                    {priceText(field)} / h · {field.openingTime || "—"}–{field.closingTime || "—"}
                  </p>
                  <RowActions field={field} busy={busy} onEdit={onEdit} onToggle={onToggle} onView={onView} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

FieldsTable.propTypes = {
  fields: PropTypes.array.isRequired,
  busy: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default FieldsTable;
