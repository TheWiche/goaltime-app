import PropTypes from "prop-types";
import { ChevronRight, Ticket } from "lucide-react";
import {
  Button,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  cx,
  focusRing,
} from "shared/components/ui";
import { formatDateEs } from "shared/utils/date";
import { formatCurrency } from "shared/utils/format";
import { getStatusMeta } from "shared/utils/reservationStatus";

const SHORT_DATE = { weekday: "short", day: "numeric", month: "short", year: "numeric" };

/** Reservas del cliente: tabla (≥ md) o tarjetas apiladas (< md). */
function ClientReservationsTable({ reservations, onOpen }) {
  return (
    <>
      <div className="hidden md:block">
        <Table bare caption="Mis reservaciones">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cancha</TableHeaderCell>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Horario</TableHeaderCell>
              <TableHeaderCell align="right">Total</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell className="w-0">
                <span className="sr-only">Acciones</span>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((r) => {
              const st = getStatusMeta(r.status);
              return (
                <TableRow key={r.id} onClick={() => onOpen(r)}>
                  <TableCell>
                    <p className="max-w-[240px] truncate font-medium text-fg-strong">{r.fieldName || "Cancha"}</p>
                    <p className="max-w-[240px] truncate text-xs text-fg-subtle">{r.fieldAddress || "Sin dirección"}</p>
                  </TableCell>
                  <TableCell nowrap className="first-letter:uppercase">
                    {formatDateEs(r.date, SHORT_DATE, "—")}
                  </TableCell>
                  <TableCell muted nowrap numeric>
                    {r.startTime || "—"} – {r.endTime || "—"}
                  </TableCell>
                  <TableCell align="right" numeric nowrap>
                    {formatCurrency(r.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={st.tone} size="sm" dot>
                      {st.label}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      leftIcon={<Ticket className="h-3.5 w-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(r);
                      }}
                    >
                      Ticket
                    </Button>
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
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onOpen(r)}
                className={cx(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50",
                  focusRing
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-fg-strong">{r.fieldName || "Cancha"}</p>
                    <StatusPill tone={st.tone} size="sm" dot>
                      {st.label}
                    </StatusPill>
                  </div>
                  <p className="mt-0.5 text-xs text-fg-muted first-letter:uppercase">
                    {formatDateEs(r.date, SHORT_DATE, "—")} · <span className="tabular">{r.startTime}–{r.endTime}</span>
                  </p>
                  <p className="tabular mt-0.5 text-xs font-medium text-fg">{formatCurrency(r.totalPrice)}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

ClientReservationsTable.propTypes = {
  reservations: PropTypes.array.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default ClientReservationsTable;
