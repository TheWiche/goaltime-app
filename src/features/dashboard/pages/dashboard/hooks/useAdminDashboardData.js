import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "shared/services/firebaseApp";
import { logger } from "shared/utils/logger";
import { DAY_MS, TREND_DAYS, sortByCreatedDesc } from "../lib/metrics";

const FIELD_STATUS_KEYS = ["approved", "pending", "disabled", "rejected"];
const KNOWN_ROLES = ["admin", "asociado", "cliente"];

const errorMessage = "No pudimos cargar algunos datos del panel. Revisa tu conexión e inténtalo de nuevo.";

const countOf = async (q) => (await getCountFromServer(q)).data().count;

/** Cuenta documentos creados en [from, to) por createdAt. */
const countCreated = (col, from, to) => {
  const constraints = [where("createdAt", ">=", Timestamp.fromMillis(from))];
  if (to) constraints.push(where("createdAt", "<", Timestamp.fromMillis(to)));
  return countOf(query(collection(db, col), ...constraints));
};

/**
 * Datos del panel de administrador.
 * - canchas: UN snapshot; conteo por estado y recientes se derivan en cliente.
 * - usuarios recientes: snapshot con orderBy createdAt desc + limit(5).
 * - totales de usuarios/reservas (y su variación 30d vs 30d previos): agregaciones count().
 */
export default function useAdminDashboardData(enabled = true) {
  const [fieldDocs, setFieldDocs] = useState(null);
  const [recentUsers, setRecentUsers] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setError("");
    setFieldDocs(null);
    setRecentUsers(null);
    setCounts(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const fail = (scope) => (err) => {
      logger.error(`useAdminDashboardData(${scope})`, err);
      setError(errorMessage);
    };

    const unsubFields = onSnapshot(
      collection(db, "canchas"),
      (snap) => setFieldDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        fail("canchas")(err);
        setFieldDocs([]);
      }
    );
    const unsubUsers = onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)),
      (snap) => setRecentUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        fail("users")(err);
        setRecentUsers([]);
      }
    );

    let cancelled = false;
    const now = Date.now();
    const d30 = now - TREND_DAYS * DAY_MS;
    const d60 = now - 2 * TREND_DAYS * DAY_MS;
    Promise.all([
      countOf(collection(db, "users")),
      Promise.all(KNOWN_ROLES.map((r) => countOf(query(collection(db, "users"), where("role", "==", r))))),
      countCreated("users", d30),
      countCreated("users", d60, d30),
      countOf(collection(db, "reservations")),
      countCreated("reservations", d30),
      countCreated("reservations", d60, d30),
    ])
      .then(([users, roles, usersNew, usersPrev, reservations, resNew, resPrev]) => {
        if (cancelled) return;
        const byRole = Object.fromEntries(KNOWN_ROLES.map((r, i) => [r, roles[i]]));
        const known = roles.reduce((s, n) => s + n, 0);
        setCounts({
          users: { total: users, new30: usersNew, prev30: usersPrev, roles: { ...byRole, otros: Math.max(0, users - known) } },
          reservations: { total: reservations, new30: resNew, prev30: resPrev },
        });
      })
      .catch((err) => {
        if (cancelled) return;
        fail("counts")(err);
        setCounts({
          users: { total: 0, new30: 0, prev30: 0, roles: { admin: 0, asociado: 0, cliente: 0, otros: 0 } },
          reservations: { total: 0, new30: 0, prev30: 0 },
        });
      });

    return () => {
      cancelled = true;
      unsubFields();
      unsubUsers();
    };
  }, [enabled, reloadKey]);

  const fields = useMemo(() => {
    const docs = fieldDocs || [];
    const byStatus = { approved: 0, pending: 0, disabled: 0, rejected: 0, otros: 0 };
    docs.forEach((f) => {
      if (FIELD_STATUS_KEYS.includes(f.status)) byStatus[f.status] += 1;
      else byStatus.otros += 1;
    });
    return { total: docs.length, byStatus, recent: sortByCreatedDesc(docs).slice(0, 4) };
  }, [fieldDocs]);

  return {
    loading: enabled && (fieldDocs === null || recentUsers === null || counts === null),
    error,
    reload,
    fields,
    recentUsers: recentUsers || [],
    users: counts?.users,
    reservations: counts?.reservations,
  };
}
