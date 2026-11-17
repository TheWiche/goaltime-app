import { Skeleton } from "shared/components/ui";

/** Fila de 4 KPIs con la forma de StatCard. */
export function StatGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando indicadores"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-line bg-white p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Tarjeta de sección con cabecera y `rows` filas simuladas. */
export function SectionSkeleton({ rows = 4, className = "" }) {
  return (
    <div className={`rounded-lg border border-line bg-white ${className}`} aria-hidden="true">
      <div className="border-b border-line px-5 py-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-line-subtle">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <Skeleton className="h-12 w-12 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
