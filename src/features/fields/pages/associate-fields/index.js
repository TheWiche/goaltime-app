import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { AlertTriangle, Building2, Plus, Search } from "lucide-react";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import {
  Button,
  EmptyState,
  PageHeader,
  SectionCard,
  SegmentedControl,
  Skeleton,
  TextField,
  Toast,
} from "shared/components/ui";
import { createField, db, toggleFieldStatus, updateField } from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import useDebounce from "shared/hooks/useDebounce";
import useLoadMore from "features/fields/hooks/useLoadMore";
import FieldFormModal from "features/fields/components/FieldFormModal";
import ConfirmDialog from "features/fields/components/ConfirmDialog";
import LoadMoreFooter from "features/fields/components/LoadMoreFooter";
import { matchesFieldSearch } from "features/fields/utils/fieldSearch";
import FieldsTable from "./components/FieldsTable";

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "approved", label: "Aprobadas" },
  { value: "pending", label: "Pendientes" },
  { value: "rejected", label: "Rechazadas" },
  { value: "disabled", label: "Deshabilitadas" },
];

function TableSkeleton() {
  return (
    <div className="divide-y divide-line-subtle" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-9 w-12" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-5 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}

function AssociateFields() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [statusFilter, setStatusFilter] = useState("all");

  const [formState, setFormState] = useState(null); // { mode: "create" } | { mode: "edit", field }
  const [saving, setSaving] = useState(false);
  const [fieldToToggle, setFieldToToggle] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const processedAddRef = useRef(false);

  const showToast = (message, type = "info") => setToast({ open: true, type, message });

  // Una sola suscripción (todas mis canchas); el filtro por estado es en memoria → contadores.
  useEffect(() => {
    if (!uid) return undefined;
    setLoading(true);
    setLoadError("");
    const unsubscribe = onSnapshot(
      query(collection(db, "canchas"), where("ownerId", "==", uid)),
      (snap) => {
        setFields(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        );
        setLoading(false);
      },
      (error) => {
        setFields([]);
        setLoading(false);
        setLoadError(error?.message || "No se pudieron cargar tus canchas.");
      }
    );
    return () => unsubscribe();
  }, [uid]);

  // ?add=true abre el alta (accesos directos del dashboard).
  useEffect(() => {
    const shouldAdd = new URLSearchParams(location.search).get("add") === "true";
    if (!shouldAdd) {
      processedAddRef.current = false;
      return;
    }
    if (processedAddRef.current) return;
    processedAddRef.current = true;
    setFormState({ mode: "create" });
    navigate(location.pathname, { replace: true });
  }, [location.search, location.pathname, navigate]);

  const counts = useMemo(() => {
    const c = { all: fields.length, approved: 0, pending: 0, rejected: 0, disabled: 0 };
    fields.forEach((f) => {
      if (c[f.status] !== undefined) c[f.status] += 1;
    });
    return c;
  }, [fields]);

  const filtered = useMemo(
    () =>
      fields.filter(
        (f) => (statusFilter === "all" || f.status === statusFilter) && matchesFieldSearch(f, debouncedSearch)
      ),
    [fields, statusFilter, debouncedSearch]
  );

  const pager = useLoadMore(filtered, { resetKey: `${statusFilter}|${debouncedSearch}` });

  const handleSubmit = async (...args) => {
    setSaving(true);
    try {
      if (formState?.mode === "create") {
        await createField(args[0]);
        showToast("Cancha registrada. Quedó pendiente de aprobación.", "success");
      } else {
        const [fieldId, data] = args;
        const updated = await updateField(fieldId, data);
        showToast(
          updated?.status === "pending" && formState?.field?.status !== "pending"
            ? "Cambios guardados. La cancha volvió a revisión."
            : "Cambios guardados.",
          "success"
        );
      }
      setFormState(null);
    } catch (error) {
      showToast(error.message || "No se pudo guardar la cancha.", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmToggle = async () => {
    if (!fieldToToggle || toggling) return;
    setToggling(true);
    try {
      const result = await toggleFieldStatus(fieldToToggle.id);
      showToast(
        result?.message || (fieldToToggle.status === "disabled" ? "Cancha habilitada." : "Cancha deshabilitada."),
        "success"
      );
      setFieldToToggle(null);
    } catch (error) {
      showToast(error.message || "No se pudo cambiar el estado.", "error");
    } finally {
      setToggling(false);
    }
  };

  const enabling = fieldToToggle?.status === "disabled";
  const hasFilters = Boolean(search) || statusFilter !== "all";

  let body;
  if (loading) body = <TableSkeleton />;
  else if (loadError) {
    body = (
      <EmptyState
        bordered={false}
        icon={AlertTriangle}
        title="No pudimos cargar tus canchas"
        description={loadError}
      />
    );
  } else if (fields.length === 0) {
    body = (
      <EmptyState
        bordered={false}
        icon={Building2}
        title="Aún no has registrado canchas"
        description="Registra tu primera cancha; un administrador la revisará antes de publicarla."
        action={
          <Button size="sm" type="button" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setFormState({ mode: "create" })}>
            Registrar cancha
          </Button>
        }
      />
    );
  } else if (filtered.length === 0) {
    body = (
      <EmptyState
        bordered={false}
        size="sm"
        icon={Search}
        title="Sin resultados"
        description="Ninguna cancha coincide con los filtros."
        action={
          hasFilters ? (
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          ) : null
        }
      />
    );
  } else {
    body = (
      <FieldsTable
        fields={pager.visibleItems}
        busy={toggling}
        onEdit={(field) => setFormState({ mode: "edit", field })}
        onToggle={setFieldToToggle}
        onView={(field) => navigate(`/canchas?fieldId=${encodeURIComponent(field.id)}`)}
      />
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        title="Mis canchas"
        subtitle="Registra, edita y habilita o deshabilita tus canchas."
        actions={
          <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormState({ mode: "create" })}>
            Registrar cancha
          </Button>
        }
      />

      <SectionCard padding="p-0">
        <div className="flex flex-col gap-2 border-b border-line p-3 md:flex-row md:items-center">
          <TextField
            size="sm"
            type="search"
            leftIcon={<Search />}
            placeholder="Buscar por nombre o dirección"
            aria-label="Buscar canchas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-64"
          />
          <div className="-mx-1 overflow-x-auto px-1">
            <SegmentedControl
              aria-label="Filtrar por estado"
              size="sm"
              items={FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
        {body}
        {!loading && !loadError && filtered.length > 0 && (
          <LoadMoreFooter
            className="border-t border-line px-4 py-3"
            shown={pager.visibleItems.length}
            total={pager.total}
            hasMore={pager.hasMore}
            onLoadMore={pager.loadMore}
          />
        )}
      </SectionCard>

      <Footer />

      <FieldFormModal
        open={Boolean(formState)}
        mode={formState?.mode || "create"}
        field={formState?.field || null}
        loading={saving}
        onClose={() => setFormState(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(fieldToToggle)}
        title={enabling ? "¿Habilitar cancha?" : "¿Deshabilitar cancha?"}
        description={
          enabling
            ? `"${fieldToToggle?.name || "La cancha"}" volverá a mostrarse en el catálogo y aceptará reservas.`
            : `"${fieldToToggle?.name || "La cancha"}" dejará de mostrarse en el catálogo y no aceptará nuevas reservas.`
        }
        confirmLabel={enabling ? "Habilitar" : "Deshabilitar"}
        variant={enabling ? "primary" : "danger"}
        loading={toggling}
        onConfirm={confirmToggle}
        onClose={() => setFieldToToggle(null)}
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
