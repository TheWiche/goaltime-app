import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createNotification,
  getUserProfileById,
  notifyReservationCancelled,
  notifyReservationConfirmed,
  sendReservationStatusChangeEmail,
  subscribeToOwnerReservations,
  updateReservationStatus,
} from "shared/services/firebaseService";
import useDebounce from "shared/hooks/useDebounce";
import { minutesFromTime } from "shared/utils/date";

const PLACEHOLDER_NAMES = new Set(["", "cliente"]);

const normalize = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const hasRealName = (name) => typeof name === "string" && !PLACEHOLDER_NAMES.has(name.trim().toLowerCase());

/** Nombre a mostrar del cliente: el guardado en la reserva o el resuelto desde users/. */
export const getClientName = (reservation, clientsMap) => {
  if (!reservation) return "Cliente";
  if (hasRealName(reservation.clientName)) return reservation.clientName;
  return clientsMap?.[reservation.clientId]?.name || reservation.clientName || "Cliente";
};

const dateKey = (r) => `${r.date || ""} ${String(minutesFromTime(r.startTime)).padStart(4, "0")}`;

/**
 * Estado de la página "Reservas" del asociado:
 * - Listener único vía subscribeToOwnerReservations (where ownerId == uid + fallback por
 *   fieldId para reservas antiguas sin ownerId). Se desuscribe al desmontar.
 * - clientsMap: nombres de clientes resueltos una sola vez por clientId (sin closures obsoletos).
 * - Filtros (estado, cancha, búsqueda incl. nombre resuelto), orden por fecha y contadores.
 * - changeStatus: ÚNICO camino para confirmar / rechazar / completar (updateReservationStatus).
 */
export default function useAssociateReservations(ownerId, { enabled = true } = {}) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientsMap, setClientsMap] = useState({});
  const requestedClientsRef = useRef(new Set());
  const mountedRef = useRef(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [dateSort, setDateSort] = useState(null); // null (recientes) | "asc" | "desc"

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!ownerId || !enabled) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError("");
    const unsubscribe = subscribeToOwnerReservations(
      ownerId,
      (list) => {
        setReservations(list);
        setLoading(false);
      },
      {
        includeLegacy: true,
        onError: (err) => {
          setError(err?.message || "No se pudieron cargar las reservas.");
          setLoading(false);
        },
      }
    );
    return () => unsubscribe();
  }, [ownerId, enabled]);

  // Ids de clientes cuyo nombre no viene en la reserva (clave estable → el efecto solo
  // corre cuando cambia el conjunto, y el ref evita pedir dos veces el mismo usuario).
  const missingClientIdsKey = useMemo(() => {
    const ids = new Set();
    reservations.forEach((r) => {
      if (r.clientId && !hasRealName(r.clientName)) ids.add(r.clientId);
    });
    return [...ids].sort().join("|");
  }, [reservations]);

  useEffect(() => {
    if (!missingClientIdsKey) return;
    const ids = missingClientIdsKey.split("|").filter((id) => !requestedClientsRef.current.has(id));
    if (ids.length === 0) return;
    ids.forEach((id) => requestedClientsRef.current.add(id));
    Promise.all(ids.map((id) => getUserProfileById(id).then((p) => [id, p]).catch(() => [id, null]))).then(
      (entries) => {
        if (!mountedRef.current) return;
        setClientsMap((prev) => {
          const next = { ...prev };
          entries.forEach(([id, profile]) => {
            next[id] = profile ? { name: profile.name || "", email: profile.email || "" } : { name: "" };
          });
          return next;
        });
      }
    );
  }, [missingClientIdsKey]);

  const counts = useMemo(() => {
    const c = { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0 };
    reservations.forEach((r) => {
      if (fieldFilter !== "all" && r.fieldId !== fieldFilter) return;
      c.all += 1;
      if (c[r.status] !== undefined) c[r.status] += 1;
      if (r.status === "confirmed" || r.status === "completed") c.revenue += Number(r.totalPrice) || 0;
    });
    return c;
  }, [reservations, fieldFilter]);

  const fieldOptions = useMemo(() => {
    const map = new Map();
    reservations.forEach((r) => {
      if (r.fieldId && !map.has(r.fieldId)) map.set(r.fieldId, r.fieldName || "Cancha sin nombre");
    });
    return [
      { value: "all", label: "Todas las canchas" },
      ...[...map.entries()]
        .sort((a, b) => a[1].localeCompare(b[1], "es"))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = normalize(debouncedSearch).trim();
    const list = reservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (fieldFilter !== "all" && r.fieldId !== fieldFilter) return false;
      if (!q) return true;
      return [r.fieldName, r.fieldAddress, r.clientName, getClientName(r, clientsMap), clientsMap[r.clientId]?.email]
        .some((v) => normalize(v).includes(q));
    });
    if (dateSort) {
      const dir = dateSort === "asc" ? 1 : -1;
      list.sort((a, b) => (dateKey(a) < dateKey(b) ? -dir : dateKey(a) > dateKey(b) ? dir : 0));
    }
    return list;
  }, [reservations, statusFilter, fieldFilter, debouncedSearch, clientsMap, dateSort]);

  const toggleDateSort = useCallback(
    () => setDateSort((s) => (s === null ? "asc" : s === "asc" ? "desc" : null)),
    []
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setFieldFilter("all");
  }, []);

  /**
   * Cambia el estado (valida transición y permisos en el servicio).
   * @returns {Promise<{ emailError: string|null }>} lanza si el cambio falla.
   */
  const changeStatus = useCallback(async (reservation, newStatus, reason) => {
    await updateReservationStatus(reservation.id, newStatus, reason);

    const fieldName = reservation.fieldName || "la cancha";
    if (reservation.clientId) {
      if (newStatus === "confirmed") {
        await notifyReservationConfirmed(reservation.id, fieldName, reservation.clientId);
      } else if (newStatus === "cancelled") {
        await notifyReservationCancelled(reservation.id, fieldName, reservation.clientId);
      } else if (newStatus === "completed") {
        await createNotification({
          userId: reservation.clientId,
          type: "reservation_completed",
          title: "Reserva completada",
          message: `Tu reserva en "${fieldName}" se marcó como completada. ¡Gracias por jugar!`,
          relatedId: reservation.id,
          actionUrl: "/reservations",
          icon: "check_circle",
          color: "success",
        }).catch(() => null);
      }
    }

    let emailError = null;
    try {
      await sendReservationStatusChangeEmail({ id: reservation.id }, newStatus, reason);
    } catch (err) {
      emailError = err?.message || "No se pudo enviar el correo al cliente.";
    }
    return { emailError };
  }, []);

  return {
    reservations,
    loading,
    error,
    clientsMap,
    counts,
    fieldOptions,
    filtered,
    search,
    setSearch,
    debouncedSearch,
    statusFilter,
    setStatusFilter,
    fieldFilter,
    setFieldFilter,
    dateSort,
    toggleDateSort,
    resetFilters,
    changeStatus,
  };
}
