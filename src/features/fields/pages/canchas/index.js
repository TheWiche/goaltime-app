import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import {
  db,
  createReservation,
  updateFieldAsAdmin,
  callApproveFieldRequest,
  notifyReservationCreated,
  notifyReservationReceived,
  addToFavorites,
  removeFromFavorites,
  subscribeToFavorites,
} from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import useDebounce from "shared/hooks/useDebounce";
import { Input, Toast, Button, SkeletonGrid, GlassCard } from "shared/components/ui";
import {
  useFieldCardsStagger,
  useEmptyState,
  useSearchPulse,
} from "shared/hooks/useGSAPAnimations";
import ReservationModal from "./components/ReservationModal";
import AdminEditFieldModal from "./components/AdminEditFieldModal";
import ConfirmationDialog from "features/users/pages/admin-users/components/ConfirmationDialog";
import FieldCard from "./components/FieldCard";
import { FilterList, Search } from "@mui/icons-material";

const STATUS_MAP = {
  approved: { label: "Aprobada", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  rejected: { label: "Rechazada", variant: "error" },
  disabled: { label: "Deshabilitada", variant: "gray" },
};

const FILTER_TITLES = {
  all: "Canchas",
  approved: "Canchas Aprobadas",
  pending: "Canchas Pendientes",
  rejected: "Canchas Rechazadas",
  disabled: "Canchas Deshabilitadas",
};

const FILTER_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "approved", label: "Aprobadas" },
  { value: "pending", label: "Pendientes" },
  { value: "rejected", label: "Rechazadas" },
  { value: "disabled", label: "Deshabilitadas" },
];

function Canchas() {
  const { userProfile, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedField, setSelectedField] = useState(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [loadingReservation, setLoadingReservation] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [fieldToApprove, setFieldToApprove] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [togglingFavorite, setTogglingFavorite] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });

  const hasProcessedEditParam = useRef(false);
  const hasProcessedFieldIdParam = useRef(false);
  const fieldRefs = useRef({});

  // GSAP: stagger de cards al hacer scroll
  const cardsContainerRef = useFieldCardsStagger(".field-card");
  
  // GSAP: empty state animado
  const emptyStateRef = useEmptyState();
  
  // GSAP: search pulse cuando está buscando
  const isSearching = useMemo(() => searchTerm.length > 0 && loading, [searchTerm, loading]);
  const searchRef = useSearchPulse(isSearching);

  const showToast = (message, type = "info") => setToast({ open: true, message, type });

  // ── Sincronizar filtro con URL ─────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("status");
    if (s && ["all", "approved", "pending", "rejected", "disabled"].includes(s)) {
      setStatusFilter(s);
    }
  }, [location.search]);

  // ── Filtrar por búsqueda ───────────────────────────────────────
  useEffect(() => {
    if (!debouncedSearch) return setFilteredFields(fields);
    const q = debouncedSearch.toLowerCase();
    setFilteredFields(
      fields.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.address?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q)
      )
    );
  }, [fields, debouncedSearch]);

  // ── Scroll a cancha por URL param ─────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fieldId = params.get("fieldId");
    if (!fieldId || hasProcessedFieldIdParam.current || loading || !filteredFields.length) return;
    hasProcessedFieldIdParam.current = true;
    setTimeout(() => {
      const el = fieldRefs.current[fieldId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transition = "box-shadow 0.3s ease";
        el.style.boxShadow = "0 0 20px rgba(25,212,112,0.5)";
        setTimeout(() => (el.style.boxShadow = ""), 2000);
      }
      const newParams = new URLSearchParams(location.search);
      newParams.delete("fieldId");
      navigate(`/canchas${newParams.toString() ? `?${newParams}` : ""}`, { replace: true });
    }, 500);
    if (!fieldId) hasProcessedFieldIdParam.current = false;
  }, [location.search, loading, filteredFields, navigate]);

  // ── Abrir modal de edición por URL param ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    if (
      !editId ||
      userProfile?.role !== "admin" ||
      isEditModalOpen ||
      loading ||
      hasProcessedEditParam.current
    )
      return;
    hasProcessedEditParam.current = true;
    const inState = fields.find((f) => f.id === editId);
    if (inState) {
      setFieldToEdit(inState);
      setIsEditModalOpen(true);
      navigate("/canchas", { replace: true });
    } else {
      getDoc(doc(db, "canchas", editId))
        .then((d) => {
          if (d.exists()) {
            setFieldToEdit({ id: d.id, ...d.data() });
            setIsEditModalOpen(true);
          } else {
            showToast("La cancha no fue encontrada.", "error");
          }
          navigate("/canchas", { replace: true });
        })
        .catch(() => {
          showToast("Error al cargar la cancha.", "error");
          navigate("/canchas", { replace: true });
        });
    }
    if (!editId) hasProcessedEditParam.current = false;
  }, [location.search, fields, userProfile, isEditModalOpen, loading, navigate]);

  // ── Suscripción a Firestore ────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;
    setLoading(true);
    let q;
    if (userProfile.role === "admin") {
      q =
        statusFilter === "all"
          ? query(collection(db, "canchas"))
          : query(collection(db, "canchas"), where("status", "==", statusFilter));
    } else {
      q = query(collection(db, "canchas"), where("status", "==", "approved"));
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aT = a.createdAt?.seconds ?? 0;
            const bT = b.createdAt?.seconds ?? 0;
            return bT - aT;
          });
        setFields(data);
        setLoading(false);
      },
      (err) => {
        showToast("Error al cargar las canchas: " + (err.message || "Error desconocido"), "error");
        setFields([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [userProfile, statusFilter]);

  // ── Favoritos ─────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") return;
    const unsub = subscribeToFavorites(currentUser.uid, setFavoriteIds);
    return () => unsub?.();
  }, [currentUser, userProfile]);

  const handleToggleFavorite = async (fieldId, e) => {
    e.stopPropagation();
    if (!currentUser || userProfile?.role !== "cliente") return;
    setTogglingFavorite(fieldId);
    try {
      const isFav = favoriteIds.includes(fieldId);
      if (isFav) {
        await removeFromFavorites(fieldId);
        showToast("Cancha removida de favoritos", "info");
      } else {
        await addToFavorites(fieldId);
        showToast("Cancha agregada a favoritos", "success");
      }
    } catch {
      showToast("Error al actualizar favoritos", "error");
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleCreateReservation = async (reservationData) => {
    setLoadingReservation(true);
    try {
      const reservation = await createReservation({
        ...reservationData,
        fieldAddress: selectedField?.address || "",
        clientName: userProfile?.name || "Cliente",
      });
      try {
        await notifyReservationCreated(
          reservation.id,
          selectedField?.name || "la cancha",
          userProfile?.uid
        );
        if (selectedField?.ownerId) {
          await notifyReservationReceived(
            reservation.id,
            selectedField?.name || "la cancha",
            selectedField.ownerId,
            userProfile?.name || "Un cliente"
          );
        }
      } catch {
        /* notifications are non-critical */
      }
      setIsReservationModalOpen(false);
      setSelectedField(null);
      showToast(
        "Reserva creada exitosamente. El dueño de la cancha la revisará pronto.",
        "success"
      );
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoadingReservation(false);
    }
  };

  const handleUpdateField = async (fieldId, fieldData) => {
    setLoadingEdit(true);
    try {
      await updateFieldAsAdmin(fieldId, fieldData);
      setIsEditModalOpen(false);
      setFieldToEdit(null);
      showToast("Cancha actualizada exitosamente.", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoadingEdit(false);
    }
  };

  const confirmActionHandler = async () => {
    if (!fieldToApprove) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await callApproveFieldRequest(fieldToApprove.id, confirmAction);
      showToast(result.message, "success");
      setFieldToApprove(null);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFilterSelect = (status) => {
    setStatusFilter(status);
    setFilterOpen(false);
    const params = new URLSearchParams(location.search);
    if (status === "all") params.delete("status");
    else params.set("status", status);
    navigate(`/canchas${params.toString() ? `?${params}` : ""}`, { replace: true });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <div className="py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold font-heading text-primary-900">
            {userProfile?.role === "admin" ? FILTER_TITLES[statusFilter] : "Canchas Disponibles"}
          </h1>

          {userProfile?.role === "admin" && (
            <div className="relative">
              <Button
                variant="glass"
                size="md"
                onClick={() => setFilterOpen((o) => !o)}
                className="gap-2"
              >
                <FilterList className="w-4 h-4" />
                Filtrar
              </Button>
              {filterOpen && (
                <GlassCard className="absolute right-0 mt-2 w-44 z-20 p-2">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterSelect(opt.value)}
                      className={[
                        "w-full text-left px-4 py-2.5 text-sm font-medium font-heading rounded-lg transition-all duration-200",
                        statusFilter === opt.value
                          ? "bg-primary text-white shadow-md"
                          : "text-primary-900 hover:bg-primary/10",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </GlassCard>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <Input
              placeholder="Buscar canchas por nombre, dirección o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              className="pl-10"
            />
          </div>
        </div>

        {/* Grid de canchas */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filteredFields.length > 0 ? (
          <div
            ref={cardsContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredFields.map((field) => (
              <FieldCard
                key={field.id}
                ref={(el) => {
                  if (el) fieldRefs.current[field.id] = el;
                }}
                field={field}
                userProfile={userProfile}
                favoriteIds={favoriteIds}
                togglingFavorite={togglingFavorite}
                statusMap={STATUS_MAP}
                loadingAction={loadingAction}
                onEdit={(f) => {
                  setFieldToEdit(f);
                  setIsEditModalOpen(true);
                }}
                onToggleFavorite={handleToggleFavorite}
                onAction={(f, action) => {
                  if (action === "approve" || action === "reject") {
                    setFieldToApprove(f);
                    setConfirmAction(action);
                    setIsConfirmOpen(true);
                  } else if (action === "reserve" && userProfile?.role === "cliente") {
                    setSelectedField(f);
                    setIsReservationModalOpen(true);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          /* Estado vacío */
          <GlassCard className="p-16">
            <div ref={emptyStateRef} className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">
                {searchTerm ? "No se encontraron canchas" : "No hay canchas disponibles"}
              </h3>
              <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? `No hay canchas que coincidan con "${searchTerm}"`
                  : "No hay canchas que coincidan con el filtro seleccionado."}
              </p>
              {searchTerm && (
                <Button variant="secondary" size="md" onClick={() => setSearchTerm("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      <Footer />

      {/* Modales */}
      {userProfile?.role === "cliente" && (
        <ReservationModal
          open={isReservationModalOpen}
          onClose={() => {
            setIsReservationModalOpen(false);
            setSelectedField(null);
          }}
          onSubmit={handleCreateReservation}
          loading={loadingReservation}
          field={selectedField}
        />
      )}

      {userProfile?.role === "admin" && (
        <AdminEditFieldModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setFieldToEdit(null);
            const params = new URLSearchParams(location.search);
            if (params.get("edit")) navigate("/canchas", { replace: true });
          }}
          onSubmit={handleUpdateField}
          loading={loadingEdit}
          field={fieldToEdit}
        />
      )}

      {userProfile?.role === "admin" && (
        <ConfirmationDialog
          open={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setFieldToApprove(null);
          }}
          onConfirm={confirmActionHandler}
          title={`Confirmar ${confirmAction === "approve" ? "Aprobación" : "Rechazo"}`}
          message={`¿Estás seguro de que quieres ${
            confirmAction === "approve" ? "aprobar" : "rechazar"
          } la cancha "${fieldToApprove?.name || ""}"?`}
          confirmColor={confirmAction === "approve" ? "success" : "error"}
        />
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </DashboardLayout>
  );
}

export default Canchas;
