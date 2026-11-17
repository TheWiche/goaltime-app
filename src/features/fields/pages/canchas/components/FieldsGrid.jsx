import PropTypes from "prop-types";
import { AlertTriangle, Search } from "lucide-react";
import { Button, EmptyState, LoadMoreFooter, SkeletonGrid, TextField } from "shared/components/ui";

/** Barra de filtros sobre el grid: búsqueda + filtros + extra a la derecha. */
export function FieldsToolbar({ search, onSearchChange, placeholder, filters, extra }) {
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-line bg-white p-3 md:flex-row md:items-center">
      <TextField
        size="sm"
        type="search"
        leftIcon={<Search />}
        placeholder={placeholder}
        aria-label="Buscar canchas"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:w-72"
      />
      {filters && <div className="-mx-1 overflow-x-auto px-1 pb-0.5 md:pb-0">{filters}</div>}
      {extra && <div className="flex items-center gap-2 md:ml-auto">{extra}</div>}
    </div>
  );
}

FieldsToolbar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  filters: PropTypes.node,
  extra: PropTypes.node,
};

/**
 * Grid de canchas con estados de carga / error / vacío y paginación "Cargar más".
 * `renderCard(field)` devuelve la tarjeta (con su `key`).
 */
function FieldsGrid({ loading, error, onRetry, pager, renderCard, emptyTitle, emptyDescription, emptyIcon, onClearFilters }) {
  if (loading) return <SkeletonGrid count={6} className="xl:grid-cols-3" />;
  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No pudimos cargar las canchas"
        description={error}
        action={
          onRetry ? (
            <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null
        }
      />
    );
  }
  if (pager.total === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          onClearFilters ? (
            <Button type="button" size="sm" variant="secondary" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          ) : null
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pager.visibleItems.map(renderCard)}
      </div>
      <LoadMoreFooter
        shown={pager.visibleItems.length}
        total={pager.total}
        hasMore={pager.hasMore}
        onLoadMore={pager.loadMore}
      />
    </div>
  );
}

FieldsGrid.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  pager: PropTypes.shape({
    visibleItems: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
    hasMore: PropTypes.bool.isRequired,
    loadMore: PropTypes.func.isRequired,
  }).isRequired,
  renderCard: PropTypes.func.isRequired,
  emptyTitle: PropTypes.string.isRequired,
  emptyDescription: PropTypes.string,
  emptyIcon: PropTypes.elementType,
  onClearFilters: PropTypes.func,
};

export default FieldsGrid;
