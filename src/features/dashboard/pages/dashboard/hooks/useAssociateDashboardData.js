import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "shared/services/firebaseApp";
import { subscribeToOwnerReservations } from "shared/services/reservationsService";
import { logger } from "shared/utils/logger";
import { lastMonths, periodTrend, sortByCreatedDesc, sumByPeriods } from "../lib/metrics";

const REVENUE_STATUSES = ["confirmed", "completed"];
const errorMessage = "No pudimos cargar tus datos en tiempo real. Revisa tu conexión e inténtalo de nuevo.";

const priceOf = (r) => {
  const n = Number(r.totalPrice);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * Datos del panel de asociado.
 * - Un único listener de canchas propias (ownerId == uid).
 * - Reservas vía subscribeToOwnerReservations (ownerId + fallback por cancha para reservas antiguas),
 *   pasándole los ids de las canchas propias para no abrir un segundo listener de `canchas`.
 * Todo lo demás (conteos, ingresos, tendencias, serie mensual) se deriva en cliente.
 */
export default function useAssociateDashboardData(uid) {
  const [fieldDocs, setFieldDocs] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const reservationsSubRef = useRef(null);

  const reload = useCallback(() => {
    setError("");
    setFieldDocs(null);
    setReservations(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!uid) return undefined;
    const unsubFields = onSnapshot(
      query(collection(db, "canchas"), where("ownerId", "==", uid)),
      (snap) => setFieldDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        logger.error("useAssociateDashboardData(canchas)", err);
        setError(errorMessage);
        setFieldDocs([]);
      }
    );
    const unsubReservations = subscribeToOwnerReservations(uid, (list) => setReservations(list), {
      includeLegacy: true,
      ownFieldIds: [],
      onError: (err) => {
        logger.error("useAssociateDashboardData(reservations)", err);
        setError(errorMessage);
        setReservations((prev) => prev || []);
      },
    });
    reservationsSubRef.current = unsubReservations;
    return () => {
      reservationsSubRef.current = null;
      unsubFields();
      unsubReservations();
    };
  }, [uid, reloadKey]);

  // Las canchas propias alimentan el fallback legacy de reservas (sin listener extra).
  const ownFieldIdsKey = useMemo(
    () => (fieldDocs ? fieldDocs.map((f) => f.id).sort().join("|") : null),
    [fieldDocs]
  );
  useEffect(() => {
    if (ownFieldIdsKey === null) return;
    reservationsSubRef.current?.setOwnFieldIds(ownFieldIdsKey ? ownFieldIdsKey.split("|") : []);
  }, [ownFieldIdsKey, reloadKey]);

  const data = useMemo(() => {
    const fieldList = fieldDocs || [];
    const resList = reservations || [];
    const fieldCount = (status) => fieldList.filter((f) => f.status === status).length;
    const resCount = (status) => resList.filter((r) => r.status === status).length;
    const paid = resList.filter((r) => REVENUE_STATUSES.includes(r.status));
    const revenue = paid.reduce((s, r) => s + priceOf(r), 0);

    const reservationPeriods = sumByPeriods(resList);
    const revenuePeriods = sumByPeriods(paid, priceOf);

    // Ingresos por mes de la reserva (fecha jugada), últimos 6 meses.
    const months = lastMonths(6);
    const monthly = Object.fromEntries(months.map((m) => [m.key, 0]));
    paid.forEach((r) => {
      const key = typeof r.date === "string" ? r.date.slice(0, 7) : "";
      if (key in monthly) monthly[key] += priceOf(r);
    });

    return {
      fields: {
        total: fieldList.length,
        approved: fieldCount("approved"),
        pending: fieldCount("pending"),
        recent: sortByCreatedDesc(fieldList).slice(0, 4),
      },
      reservations: {
        total: resList.length,
        pending: resCount("pending"),
        confirmed: resCount("confirmed"),
        completed: resCount("completed"),
        cancelled: resCount("cancelled"),
        recent: resList.slice(0, 5),
        trend: periodTrend(reservationPeriods.current, reservationPeriods.previous),
      },
      revenue: {
        total: revenue,
        trend: periodTrend(revenuePeriods.current, revenuePeriods.previous),
        monthly: {
          labels: months.map((m) => m.label),
          values: months.map((m) => monthly[m.key]),
          hasData: months.some((m) => monthly[m.key] > 0),
        },
      },
    };
  }, [fieldDocs, reservations]);

  return {
    loading: Boolean(uid) && (fieldDocs === null || reservations === null),
    error,
    reload,
    ...data,
  };
}
