import { useState, useMemo } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useEffect } from "react";
import {
  DashboardLayout,
  DashboardNavbar,
  Footer,
} from "shared/components/layout";
import {
  PageHeader,
  SectionCard,
  Button,
  StatusPill,
  Toast,
} from "shared/components/ui";
import {
  Search,
  CircleCheck,
  X,
  Hourglass,
  Ban,
  Trophy,
} from "lucide-react";
import useDebounce from "shared/hooks/useDebounce";
import { db, callApproveFieldRequest } from "shared/services/firebaseService";
import ConfirmationDialog from "features/users/pages/admin-users/components/ConfirmationDialog";

const STATUS_FILTERS = [
  { value: "pending", label: "Pendientes", tone: "warning", Icon: Hourglass },
  { value: "approved", label: "Aprobadas", tone: "success", Icon: CircleCheck },
  { value: "rejected", label: "Rechazadas", tone: "danger", Icon: X },
  { value: "disabled", label: "Deshabilitadas", tone: "neutral", Icon: Ban },
  { value: "all", label: "Todas", tone: "info", Icon: Trophy },
];

const STATUS_LABEL = {
  approved: { label: "Aprobada", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  rejected: { label: "Rechazada", tone: "danger" },
  disabled: { label: "Deshabilitada", tone: "neutral" },
};

function AdminFields() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToApprove, setFieldToApprove] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  useEffect(() => {
    setLoading(true);
    const q =
      statusFilter === "all"
        ? query(collection(db, "canchas"), orderBy("createdAt", "desc"))
        : query(collection(db, "canchas"), where("status", "==", statusFilter));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (statusFilter !== "all") {
          data.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
        }
        setFields(data);
        setLoading(false);
      },
      () => {
        setFields([]);
        setLoading(false);
        setToast({ open: true, type: "error", message: "Error al cargar canchas." });
      }
    );
    return () => unsub();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return fields;
    const q = debouncedSearch.toLowerCase();
    return fields.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) || f.address?.toLowerCase().includes(q)
    );
  }, [fields, debouncedSearch]);

  const counts = useMemo(() => {
    const acc = { pending: 0, approved: 0, rejected: 0, disabled: 0, all: fields.length };
    fields.forEach((f) => {
      if (acc[f.status] !== undefined) acc[f.status] += 1;
    });
    return acc;
  }, [fields]);

  const handleAction = (field, action) => {
    setFieldToApprove(field);
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const confirmActionHandler = async () => {
    if (!fieldToApprove) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await callApproveFieldRequest(fieldToApprove.id, confirmAction);
      setToast({ open: true, type: "success", message: result.message });
      setFieldToApprove(null);
    } catch (error) {
      setToast({ open: true, type: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        eyebrow="Administración · Canchas"
        title="Aprobación de canchas"
        subtitle="Modera el catálogo: revisa, aprueba o rechaza nuevas solicitudes."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {STATUS_FILTERS.map((s) => {
          const active = statusFilter === s.value;
          const Icon = s.Icon;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={[
                "relative rounded-xl border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                active
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white border-slate-200 hover:border-primary/30 hover:shadow-sm",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span
                  className={[
                    "inline-flex items-center justify-center w-8 h-8 rounded-lg",
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                </span>
                <span
                  className={[
                    "text-2xl font-semibold font-heading leading-none",
                    active ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {counts[s.value] ?? 0}
                </span>
              </div>
              <p
                className={[
                  "mt-3 text-xs font-semibold uppercase tracking-[0.1em]",
                  active ? "text-white/80" : "text-slate-500",
                ].join(" ")}
              >
                {s.label}
              </p>
            </button>
          );
        })}
      </div>

      <SectionCard padding="p-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20"
            />
          </div>
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Cargando canchas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary mx-auto mb-3 flex items-center justify-center">
              <Trophy className="h-7 w-7" strokeWidth={2} aria-hidden />
            </div>
            <p className="text-base font-semibold font-heading text-slate-900">
              No hay canchas
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm
                ? `No se encontraron resultados para "${searchTerm}".`
                : "No hay canchas con este estado."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="text-left font-semibold px-5 py-3">Cancha</th>
                  <th className="text-left font-semibold px-5 py-3 hidden md:table-cell">
                    Dirección
                  </th>
                  <th className="text-right font-semibold px-5 py-3 hidden lg:table-cell">
                    Precio
                  </th>
                  <th className="text-left font-semibold px-5 py-3">Estado</th>
                  <th className="text-left font-semibold px-5 py-3 hidden lg:table-cell">
                    Creada
                  </th>
                  <th className="text-right font-semibold px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((field) => {
                  const st = STATUS_LABEL[field.status] || {
                    label: field.status,
                    tone: "neutral",
                  };
                  const created = field.createdAt?.seconds
                    ? new Date(field.createdAt.seconds * 1000).toLocaleDateString()
                    : "—";
                  return (
                    <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-50 to-secondary/10 flex items-center justify-center text-primary">
                            {field.imageUrl ? (
                              <img
                                src={field.imageUrl}
                                alt=""
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              <Trophy className="h-5 w-5" strokeWidth={2} aria-hidden />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {field.name || "Sin nombre"}
                            </p>
                            <p className="md:hidden text-xs text-slate-500 truncate">
                              {field.address || "Sin dirección"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 hidden md:table-cell max-w-xs truncate">
                        {field.address || "Sin dirección"}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900 hidden lg:table-cell">
                        ${field.pricePerHour || 0}
                        <span className="ml-1 text-xs font-normal text-slate-400">/h</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill tone={st.tone} size="sm">
                          {st.label}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">
                        {created}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {field.status === "pending" ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={loadingAction}
                                onClick={() => handleAction(field, "approve")}
                              >
                                <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                Aprobar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={loadingAction}
                                onClick={() => handleAction(field, "reject")}
                              >
                                <X className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                Rechazar
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Footer />

      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setFieldToApprove(null);
        }}
        onConfirm={confirmActionHandler}
        title={`Confirmar ${confirmAction === "approve" ? "aprobación" : "rechazo"}`}
        message={`¿Estás seguro de que quieres ${
          confirmAction === "approve" ? "aprobar" : "rechazar"
        } la cancha "${fieldToApprove?.name || ""}"?`}
        confirmColor={confirmAction === "approve" ? "success" : "error"}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </DashboardLayout>
  );
}

export default AdminFields;
