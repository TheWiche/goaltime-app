import PropTypes from "prop-types";
import { Eye } from "lucide-react";
import {
  Avatar,
  Button,
  IconButton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "shared/components/ui";
import { formatDateEs } from "shared/utils/date";
import { formatCurrency } from "shared/utils/format";
import { getAllowedTransitions, getStatusMeta } from "shared/utils/reservationStatus";
import { getActionLabel } from "./StatusChangeModal";

const SHORT_DATE = { weekday: "short", day: "numeric", month: "short" };

function QuickActions({ reservation, busy, onAction }) {
  const allowed = getAllowedTransitions(reservation.status);
  if (allowed.length === 0) return null;
  // Orden: acción negativa (secundaria) a la izquierda, positiva a la derecha.
  const ordered = [...allowed.filter((s) => s === "cancelled"), ...allowed.filter((s) => s !== "cancelled")];
  return (
    <>
      {ordered.map((to) => (
        <Button
          key={to}
          type="button"
          size="sm"
          variant={to === "cancelled" ? "ghost" : "secondary"}
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onAction(reservation, to);
          }}
        >
          {getActionLabel(reservation.status, to)}
        </Button>
      ))}
    </>
  );
}

QuickActions.propTypes = {
  reservation: PropTypes.object.isRequired,
  busy: PropTypes.bool,
  onAction: PropTypes.func.isRequired,
};

/** Reservas del asociado: tabla (≥ md) y tarjetas apiladas (< md). */
function ReservationsTable({ reservations, getClientName, busy, dateSort, onToggleDateSort, onOpen, onAction }) {
  return (
    <>
      <div className="hidden md:block">
        <Table bare caption="Reservas de mis canchas">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell>Cancha</TableHeaderCell>
              <TableHeaderCell onSort={onToggleDateSort} sortDirection={dateSort}>
                Fecha
              </TableHeaderCell>
              <TableHeaderCell align="right" className="hidden lg:table-cell">
                Total
              </TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell align="right">
                <span className="sr-only">Acciones</span>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((r) => {
              const st = getStatusMeta(r.status);
              const name = getClientName(r);
              return (
                <TableRow key={r.id} onClick={() => onOpen(r)}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={name} size="xs" />
                      <span className="max-w-[180px] truncate font-medium text-fg-strong">{name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[200px] truncate">{r.fieldName || "Cancha"}</span>
                  </TableCell>
                  <TableCell nowrap>
                    <span className="first-letter:uppercase">{formatDateEs(r.date, SHORT_DATE, "—")}</span>
                    <span className="tabular block text-xs text-fg-subtle">
                      {r.startTime}–{r.endTime}
                    </span>
                  </TableCell>
                  <TableCell align="right" numeric nowrap className="hidden lg:table-cell">
                    {formatCurrency(r.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={st.tone} size="sm" dot>
                      {st.label}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <QuickActions reservation={r} busy={busy} onAction={onAction} />
                      <IconButton
                        label="Ver detalle"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(r);
                        }}
                      >
                        <Eye />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y divide-line-subtle md:hidden">
        {reservations.map((r) => {
          const st = getStatusMeta(r.status);
          const name = getClientName(r);
          return (
            <li key={r.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg-strong">{name}</p>
                    <p className="truncate text-xs text-fg-subtle">{r.fieldName || "Cancha"}</p>
                  </div>
                </div>
                <StatusPill tone={st.tone} size="sm" dot>
                  {st.label}
                </StatusPill>
              </div>
              <p className="mt-2 text-xs text-fg-muted first-letter:uppercase">
                {formatDateEs(r.date, SHORT_DATE, "—")} · <span className="tabular">{r.startTime}–{r.endTime}</span> ·{" "}
                <span className="tabular font-medium text-fg">{formatCurrency(r.totalPrice)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => onOpen(r)}>
                  Ver detalle
                </Button>
                <div className="ml-auto flex gap-1">
                  <QuickActions reservation={r} busy={busy} onAction={onAction} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

ReservationsTable.propTypes = {
  reservations: PropTypes.array.isRequired,
  getClientName: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  dateSort: PropTypes.oneOf(["asc", "desc", null]),
  onToggleDateSort: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default ReservationsTable;
