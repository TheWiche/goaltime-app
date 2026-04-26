import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
  Plus,
  Search,
  Pencil,
  CircleCheck,
  X,
  Trophy,
  Banknote,
  MapPin,
} from "lucide-react";
import { db, createField, updateField, toggleFieldStatus } from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import useDebounce from "shared/hooks/useDebounce";
import AddFieldModal from "./components/AddFieldModal";
import EditFieldModal from "./components/EditFieldModal";
import ConfirmationDialog from "features/users/pages/admin-users/components/ConfirmationDialog";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "approved", label: "Aprobadas" },
  { value: "pending", label: "Pendientes" },
  { value: "rejected", label: "Rechazadas" },
  { value: "disabled", label: "Deshabilitadas" },
];

const STATUS_LABEL = {
  approved: { label: "Aprobada", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  rejected: { label: "Rechazada", tone: "danger" },
  disabled: { label: "Deshabilitada", tone: "neutral" },
};

function AssociateFields() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToToggle, setFieldToToggle] = useState(null);
  const [confirmActionText, setConfirmActionText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  const hasProcessedAddParam = useRef(false);

  useEffect(() => {
    if (!userProfile) return undefined;
    setLoading(true);
    const q =
      statusFilter === "all"
        ? query(collection(db, "canchas"), where("ownerId", "==", userProfile.uid))
        : query(
            collection(db, "canchas"),
            where("ownerId", "==", userProfile.uid),
            where("status", "==", statusFilter)
          );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
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
  }, [userProfile, statusFilter]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return fields;
    const q = debouncedSearch.toLowerCase();
    return fields.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) || f.address?.toLowerCase().includes(q)
    );
  }, [fields, debouncedSearch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAdd = params.get("add") === "true";
    if (shouldAdd && !isAddModalOpen && !hasProcessedAddParam.current) {
      hasProcessedAddParam.current = true;
      setIsAddModalOpen(true);
      navigate("/associate/fields", { replace: true });
    }
    if (!shouldAdd) hasProcessedAddParam.current = false;
  }, [location.search, isAddModalOpen, navigate]);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (location.search.includes("add=true")) {
      navigate("/associate/fields", { replace: true });
    }
  };

  const handleCreateField = async (fieldData) => {
    setLoadingAction(true);
    try {
      await createField(fieldData);
      handleCloseAddModal();
      setToast({ open: true, type: "success", message: "Cancha creada exitosamente." });
    } catch (error) {
      setToast({ open: true, type: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateField = async (fieldId, fieldData) => {
    setLoadingAction(true);
    try {
      await updateField(fieldId, fieldData);
      setIsEditModalOpen(false);
      setFieldToEdit(null);
      setToast({ open: true, type: "success", message: "Cancha actualizada." });
    } catch (error) {
      setToast({ open: true, type: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleDisable = (field) => {
    const actionText = field.status === "disabled" ? "habilitar" : "deshabilitar";
    setFieldToToggle(field);
    setConfirmActionText(actionText);
    setIsConfirmOpen(true);
  };

  const confirmToggleDisable = async () => {
    if (!fieldToToggle) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await toggleFieldStatus(fieldToToggle.id);
      setToast({ open: true, type: "success", message: result.message });
      setFieldToToggle(null);
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
        eyebrow="Asociado · Mis canchas"
        title="Mis canchas"
        subtitle="Administra tu catálogo, edita información y habilita o deshabilita canchas."
        actions={
          <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Registrar cancha
          </Button>
        }
      />

      <SectionCard padding="p-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-3">
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
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={[
                    "h-9 px-3.5 rounded-lg text-sm font-semibold transition-all duration-200 border focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Cargando canchas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary mx-auto mb-3 flex items-center justify-center">
              <Trophy className="h-7 w-7" strokeWidth={2} aria-hidden />
            </div>
            <p className="text-base font-semibold font-heading text-slate-900">
              {searchTerm ? "Sin resultados" : "Aún no has registrado canchas"}
            </p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              {searchTerm
                ? `No se encontró nada para "${searchTerm}"`
                : "Comienza registrando tu primera cancha."}
            </p>
            {!searchTerm && (
              <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Registrar cancha
              </Button>
            )}
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
                  const isDisabled = field.status === "disabled";
                  return (
                    <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-50 to-secondary/10 flex items-center justify-center text-primary overflow-hidden">
                            {field.imageUrl ? (
                              <img
                                src={field.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Trophy className="h-5 w-5" strokeWidth={2} aria-hidden />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {field.name || "Sin nombre"}
                            </p>
                            <p className="md:hidden text-xs text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                              {field.address || "Sin dirección"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 hidden md:table-cell max-w-xs truncate">
                        {field.address || "Sin dirección"}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900 hidden lg:table-cell">
                        <span className="inline-flex items-center justify-end gap-0.5">
                          <Banknote className="h-3.5 w-3.5 shrink-0 text-cta-600" strokeWidth={2} aria-hidden />
                          {field.pricePerHour || 0}
                        </span>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFieldToEdit(field);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                            Editar
                          </Button>
                          <Button
                            variant={isDisabled ? "primary" : "danger"}
                            size="sm"
                            disabled={loadingAction}
                            onClick={() => handleToggleDisable(field)}
                          >
                            {isDisabled ? (
                              <>
                                <CircleCheck className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                Habilitar
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                Deshabilitar
                              </>
                            )}
                          </Button>
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

      <AddFieldModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateField}
        loading={loadingAction}
      />
      <EditFieldModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFieldToEdit(null);
        }}
        onSubmit={handleUpdateField}
        loading={loadingAction}
        field={fieldToEdit}
      />
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setFieldToToggle(null);
        }}
        onConfirm={confirmToggleDisable}
        title={`Confirmar ${
          confirmActionText === "habilitar" ? "habilitación" : "deshabilitación"
        }`}
        message={`¿Estás seguro de que quieres ${confirmActionText} la cancha "${
          fieldToToggle?.name || "esta cancha"
        }"?`}
        confirmColor={confirmActionText === "habilitar" ? "success" : "error"}
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

export default AssociateFields;
