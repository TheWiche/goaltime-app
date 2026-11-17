import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "shared/services/firebaseService";

const byCreatedDesc = (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);

/**
 * Canchas en tiempo real según el rol:
 *  - admin: todas (el filtro por estado se aplica en memoria para poder contar).
 *  - resto: solo aprobadas (lo que permiten las reglas).
 */
export default function useFieldsSubscription(role) {
  const [state, setState] = useState({ fields: [], loading: true, error: "" });

  useEffect(() => {
    if (!role) return undefined;
    setState((s) => ({ ...s, loading: true, error: "" }));
    const q =
      role === "admin"
        ? query(collection(db, "canchas"))
        : query(collection(db, "canchas"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const fields = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byCreatedDesc);
        setState({ fields, loading: false, error: "" });
      },
      (error) => {
        setState({
          fields: [],
          loading: false,
          error: error?.message || "No se pudieron cargar las canchas.",
        });
      }
    );
    return () => unsubscribe();
  }, [role]);

  return state;
}
