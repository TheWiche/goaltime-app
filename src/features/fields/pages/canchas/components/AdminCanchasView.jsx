import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { PageHeader, SegmentedControl } from "shared/components/ui";
import {
  callApproveFieldRequest,
  getFieldById,
  updateFieldAsAdmin,
} from "shared/services/firebaseService";
import useDebounce from "shared/hooks/useDebounce";
import useLoadMore from "shared/hooks/useLoadMore";
import FieldFormModal from "features/fields/components/FieldFormModal";
import ConfirmDialog from "features/fields/components/ConfirmDialog";
import useFieldsSubscription from "../hooks/useFieldsSubscription";
import useScrollToField from "../hooks/useScrollToField";
import FieldCard from "./FieldCard";
import FieldDetailModal from "./FieldDetailModal";
import FieldsGrid, { FieldsToolbar } from "./FieldsGrid";
import { matchesFieldSearch } from "features/fields/utils/fieldSearch";

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "disabled", label: "Deshabilitadas" },
];
const VALID_STATUS = STATUS_FILTERS.map((f) => f.value);

/** Catálogo de canchas para administradores: moderación, edición y filtros por estado. */
function AdminCanchasView({ showToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { fields, loading, error, retry } = useFieldsSubscription("admin");

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const statusParam = params.get("status");
  const statusFilter = VALID_STATUS.includes(statusParam) ? statusParam : "all";
  const editParam = params.get("edit");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const [detailField, setDetailField] = useState(null);
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [moderation, setModeration] = useState(null); // { field, action }
  const [moderating, setModerating] = useState(false);
  const processedEditRef = useRef(null);
  const mountedRef = useRef(true);

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(location.search);
      if (value === null || value === undefined) next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
    },
    [location.pathname, location.search, navigate]
  );

  const counts = useMemo(() => {
    const c = { all: fields.length, pending: 0, approved: 0, rejected: 0, disabled: 0 };
    fields.forEach((f) => {
      if (c[f.status] !== undefined) c[f.status] += 1;
    });
    return c;
  }, [fields]);

  const filtered = useMemo(
    () =>
      fields.filter(
        (f) =>
          (statusFilter === "all" || f.status === statusFilter) && matchesFieldSearch(f, debouncedSearch)
      ),
    [fields, statusFilter, debouncedSearch]
  );

  const pager = useLoadMore(filtered, { resetKey: `${statusFilter}|${debouncedSearch}` });
  const { highlightedId, registerNode } = useScrollToField({
    items: filtered,
    visibleItems: pager.visibleItems,
    loading,
    ensureVisible: pager.ensureVisible,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ?edit=<id> abre el modal de edición (p.ej. desde una notificación).
  useEffect(() => {
    if (!editParam) {
      processedEditRef.current = null;
      return;
    }
    if (loading || processedEditRef.current === editParam) return;
    processedEditRef.current = editParam;
    const inList = fields.find((f) => f.id === editParam);
    if (inList) {
      setFieldToEdit(inList);
      setParam("edit", null);
      return;
    }
    getFieldById(editParam)
      .then((field) => {
        if (!mountedRef.current) return;
        if (field) setFieldToEdit(field);
        else showToast("La cancha no fue encontrada.", "error");
        setParam("edit", null);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        showToast("Error al cargar la cancha.", "error");
        setParam("edit", null);
      });
  }, [editParam, loading, fields, setParam, showToast]);

  const handleSave = async (fieldId, data) => {
    setSaving(true);
    try {
      await updateFieldAsAdmin(fieldId, data);
      setFieldToEdit(null);
      showToast("Cancha actualizada.", "success");
    } catch (err) {
      showToast(err.message || "No se pudo actualizar la cancha.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleModerate = async () => {
    if (!moderation || moderating) return;
    setModerating(true);
    try {
      const result = await callApproveFieldRequest(moderation.field.id, moderation.action);
      showToast(
        result?.message || (moderation.action === "approve" ? "Cancha aprobada." : "Cancha rechazada."),
        "success"
      );
      setModeration(null);
    } catch (err) {
      showToast(err.message || "No se pudo procesar la solicitud.", "error");
    } finally {
      setModerating(false);
    }
  };

  const clearFilters =
    search || statusFilter !== "all"
      ? () => {
          setSearch("");
          setParam("status", null);
        }
      : undefined;

  const isApprove = moderation?.action === "approve";

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Canchas"
        subtitle="Modera solicitudes y mantén al día la información de cada cancha."
        meta={
          counts.pending > 0 ? (
            <button
              type="button"
              onClick={() => setParam("status", "pending")}
              className="text-[13px] font-medium text-amber-800 underline-offset-2 hover:underline"
            >
              {counts.pending === 1 ? "1 cancha pendiente de revisión" : `${counts.pending} canchas pendientes de revisión`}
            </button>
          ) : null
        }
      />

      <FieldsToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre, dirección o descripción"
        filters={
          <SegmentedControl
            aria-label="Filtrar por estado"
            size="sm"
            items={STATUS_FILTERS.map((f) => ({ ...f, count: counts[f.value] }))}
            value={statusFilter}
            onChange={(v) => setParam("status", v === "all" ? null : v)}
          />
        }
      />

      <FieldsGrid
        loading={loading}
        error={error}
        onRetry={retry}
        pager={pager}
        emptyIcon={Building2}
        emptyTitle={search ? "Sin resultados" : "No hay canchas en este estado"}
        emptyDescription={
          search ? `Ninguna cancha coincide con "${search}".` : "Cambia el filtro para ver otras canchas."
        }
        onClearFilters={clearFilters}
        renderCard={(field) => (
          <FieldCard
            key={field.id}
            ref={registerNode(field.id)}
            field={field}
            role="admin"
            highlighted={highlightedId === field.id}
            actionsDisabled={moderating}
            onOpen={setDetailField}
            onEdit={setFieldToEdit}
            onApprove={(f) => setModeration({ field: f, action: "approve" })}
            onReject={(f) => setModeration({ field: f, action: "reject" })}
          />
        )}
      />

      <FieldDetailModal
        open={Boolean(detailField)}
        field={detailField}
        role="admin"
        onClose={() => setDetailField(null)}
        onEdit={(f) => {
          setDetailField(null);
          setFieldToEdit(f);
        }}
      />

      <FieldFormModal
        open={Boolean(fieldToEdit)}
        mode="admin"
        field={fieldToEdit}
        loading={saving}
        onClose={() => setFieldToEdit(null)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(moderation)}
        title={isApprove ? "¿Aprobar cancha?" : "¿Rechazar cancha?"}
        description={
          isApprove
            ? `"${moderation?.field?.name || "La cancha"}" será visible para los clientes y podrá recibir reservas.`
            : `"${moderation?.field?.name || "La cancha"}" no se publicará. El dueño recibirá una notificación.`
        }
        confirmLabel={isApprove ? "Aprobar" : "Rechazar"}
        variant={isApprove ? "primary" : "danger"}
        loading={moderating}
        onConfirm={handleModerate}
        onClose={() => setModeration(null)}
      />
    </>
  );
}

AdminCanchasView.propTypes = { showToast: PropTypes.func.isRequired };

export default AdminCanchasView;
