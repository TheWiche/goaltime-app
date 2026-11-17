import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Building2, Heart } from "lucide-react";
import { Button, PageHeader, SegmentedControl, Select } from "shared/components/ui";
import {
  addToFavorites,
  createReservation,
  notifyReservationCreated,
  notifyReservationReceived,
  removeFromFavorites,
  subscribeToFavorites,
} from "shared/services/firebaseService";
import useDebounce from "shared/hooks/useDebounce";
import useLoadMore from "shared/hooks/useLoadMore";
import useFieldsSubscription from "../hooks/useFieldsSubscription";
import useScrollToField from "../hooks/useScrollToField";
import FieldCard from "./FieldCard";
import FieldDetailModal from "./FieldDetailModal";
import FieldsGrid, { FieldsToolbar } from "./FieldsGrid";
import ReservationModal from "./ReservationModal";
import { SORT_OPTIONS, matchesFieldSearch, sortFields } from "features/fields/utils/fieldSearch";

/**
 * Catálogo público de canchas aprobadas (cliente y asociado).
 * - cliente: favoritas, filtro "Favoritas" y reserva.
 * - asociado: filtro "Mis canchas" (solo lectura; se gestionan en /associate/fields).
 */
function CatalogCanchasView({ role, currentUser, userProfile, showToast }) {
  const navigate = useNavigate();
  const isClient = role === "cliente";
  const uid = currentUser?.uid || null;
  const { fields, loading, error, retry } = useFieldsSubscription(role);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [scope, setScope] = useState("all"); // all | favorites | mine
  const [sort, setSort] = useState("recent");

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [busyFavorites, setBusyFavorites] = useState(() => new Set());
  const busyFavoritesRef = useRef(new Set());

  const [detailField, setDetailField] = useState(null);
  const [reserveField, setReserveField] = useState(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (!isClient || !uid) {
      setFavoriteIds([]);
      return undefined;
    }
    const unsubscribe = subscribeToFavorites(uid, setFavoriteIds);
    return () => unsubscribe?.();
  }, [isClient, uid]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const filtered = useMemo(() => {
    const list = fields.filter((f) => {
      if (scope === "favorites" && !favoriteSet.has(f.id)) return false;
      if (scope === "mine" && f.ownerId !== uid) return false;
      return matchesFieldSearch(f, debouncedSearch);
    });
    return sortFields(list, sort);
  }, [fields, scope, favoriteSet, uid, debouncedSearch, sort]);

  const pager = useLoadMore(filtered, { resetKey: `${scope}|${sort}|${debouncedSearch}` });
  const { highlightedId, registerNode } = useScrollToField({
    items: filtered,
    visibleItems: pager.visibleItems,
    loading,
    ensureVisible: pager.ensureVisible,
  });

  const setFavoriteBusy = (fieldId, busy) => {
    if (busy) busyFavoritesRef.current.add(fieldId);
    else busyFavoritesRef.current.delete(fieldId);
    setBusyFavorites(new Set(busyFavoritesRef.current));
  };

  // Doble clic seguro: el ref bloquea de forma síncrona una segunda petición en curso.
  const handleToggleFavorite = useCallback(
    async (fieldId) => {
      if (!isClient || !uid || busyFavoritesRef.current.has(fieldId)) return;
      const wasFavorite = favoriteSet.has(fieldId);
      setFavoriteBusy(fieldId, true);
      try {
        if (wasFavorite) {
          await removeFromFavorites(fieldId);
          showToast("Cancha quitada de favoritas.", "info");
        } else {
          await addToFavorites(fieldId);
          showToast("Cancha agregada a favoritas.", "success");
        }
      } catch (err) {
        showToast(err.message || "No se pudieron actualizar tus favoritas.", "error");
      } finally {
        setFavoriteBusy(fieldId, false);
      }
    },
    [isClient, uid, favoriteSet, showToast]
  );

  const handleCreateReservation = async (data) => {
    if (!reserveField || reserving) return;
    const field = reserveField;
    setReserving(true);
    try {
      const reservation = await createReservation({
        ...data,
        fieldAddress: field.address || "",
        clientName: userProfile?.name || currentUser?.displayName || "Cliente",
      });
      const fieldName = reservation.fieldName || field.name || "la cancha";
      const ownerId = reservation.ownerId || field.ownerId;
      // Notificaciones no críticas (safeNotify no lanza).
      await Promise.all([
        uid ? notifyReservationCreated(reservation.id, fieldName, uid) : null,
        ownerId
          ? notifyReservationReceived(reservation.id, fieldName, ownerId, userProfile?.name || "Un cliente")
          : null,
      ]);
      setReserveField(null);
      showToast("Reserva creada. El dueño de la cancha la revisará pronto.", "success");
    } catch (err) {
      showToast(err.message || "No se pudo crear la reserva.", "error");
    } finally {
      setReserving(false);
    }
  };

  const scopeItems = isClient
    ? [
        { value: "all", label: "Todas", count: fields.length },
        { value: "favorites", label: "Favoritas", count: favoriteIds.length, icon: <Heart /> },
      ]
    : [
        { value: "all", label: "Todas", count: fields.length },
        { value: "mine", label: "Mis canchas", count: fields.filter((f) => f.ownerId === uid).length },
      ];

  const clearFilters =
    search || scope !== "all"
      ? () => {
          setSearch("");
          setScope("all");
        }
      : undefined;

  let emptyTitle = "No hay canchas disponibles";
  let emptyDescription = "Vuelve pronto: estamos sumando nuevas canchas.";
  if (search) {
    emptyTitle = "Sin resultados";
    emptyDescription = `Ninguna cancha coincide con "${search}".`;
  } else if (scope === "favorites") {
    emptyTitle = "Aún no tienes favoritas";
    emptyDescription = "Marca el corazón de una cancha para encontrarla rápido.";
  } else if (scope === "mine") {
    emptyTitle = "Ninguna de tus canchas está publicada";
    emptyDescription = "Las canchas aparecen aquí cuando un administrador las aprueba.";
  }

  return (
    <>
      <PageHeader
        title="Canchas"
        subtitle={
          isClient
            ? "Encuentra una cancha, revisa su disponibilidad y reserva en segundos."
            : "Así ven los clientes el catálogo de canchas publicadas."
        }
        actions={
          !isClient ? (
            <Button type="button" variant="secondary" onClick={() => navigate("/associate/fields")}>
              Gestionar mis canchas
            </Button>
          ) : null
        }
      />

      <FieldsToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre, dirección o ciudad"
        filters={
          <SegmentedControl aria-label="Mostrar" size="sm" items={scopeItems} value={scope} onChange={setScope} />
        }
        extra={
          <Select
            size="sm"
            aria-label="Ordenar"
            className="w-full md:w-52"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORT_OPTIONS}
          />
        }
      />

      <FieldsGrid
        loading={loading}
        error={error}
        onRetry={retry}
        pager={pager}
        emptyIcon={scope === "favorites" ? Heart : Building2}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onClearFilters={clearFilters}
        renderCard={(field) => (
          <FieldCard
            key={field.id}
            ref={registerNode(field.id)}
            field={field}
            role={role}
            isOwn={!isClient && field.ownerId === uid}
            isFavorite={favoriteSet.has(field.id)}
            favoriteBusy={busyFavorites.has(field.id)}
            highlighted={highlightedId === field.id}
            onOpen={setDetailField}
            onReserve={setReserveField}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      />

      <FieldDetailModal
        open={Boolean(detailField)}
        field={detailField}
        role={role}
        onClose={() => setDetailField(null)}
        onReserve={(f) => {
          setDetailField(null);
          setReserveField(f);
        }}
      />

      {isClient && (
        <ReservationModal
          open={Boolean(reserveField)}
          field={reserveField}
          loading={reserving}
          onClose={() => setReserveField(null)}
          onSubmit={handleCreateReservation}
        />
      )}
    </>
  );
}

CatalogCanchasView.propTypes = {
  role: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  userProfile: PropTypes.object,
  showToast: PropTypes.func.isRequired,
};

export default CatalogCanchasView;
