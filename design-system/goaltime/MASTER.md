# GoalTime — Sistema de diseño (v3, angular)

> Documento fuente para todo rediseño de páginas. Si existe `design-system/pages/<página>.md`, sus reglas
> prevalecen sobre este archivo para esa página.
>
> Estilo: herramientas tipo Linear / Vercel / Stripe. Neutro, denso, con **bordes de 1px como jerarquía principal**,
> esquinas casi rectas y color usado con intención. Solo modo claro.

Fuentes de verdad en código:

| Qué | Dónde |
|---|---|
| Variables CSS (`--radius*`, `--border*`, `--shadow-*`) | `src/index.css` (`:root`) |
| Escalas Tailwind (colores, radios, sombras, fuentes) | `tailwind.config.js` |
| Primitivas React | `src/shared/components/ui/*` (importar desde `shared/components/ui`) |
| Gráficos | `src/shared/components/charts/*` |
| Capa de compatibilidad MUI | `src/shared/components/md-shims/*` (no usar en código nuevo) |

---

## 1. Reglas de oro

1. **Importa primitivas, no reinventes.** Botón, campo, tabla, modal, badge, vacío, skeleton → `shared/components/ui`.
2. **Radios ≤ 8px.** `rounded` (4px) para controles pequeños, `rounded-md` (6px) para botones/inputs, `rounded-lg` (8px) para tarjetas/modales.
   `rounded-xl/2xl/3xl` están colapsados a 8px por compatibilidad; **no los uses en código nuevo**.
3. **`rounded-full` solo** para avatares (`<Avatar>`), spinners y puntos de estado de 6–8px. Nada de pills, botones ni iconos en círculo.
4. **Bordes antes que sombras.** Tarjetas = `border border-line bg-white` sin sombra. Sombra `shadow-xs` en controles,
   `shadow-md` en popovers/toasts, `shadow-lg` solo en modales.
5. **Prohibido:** gradientes (`bg-gradient-*`), glass (`bg-white/70 backdrop-blur`), sombras de color
   (`shadow-goaltime`, `shadow-primary/…`), `hover:-translate-y-*`, `animate-bounce/float/shimmer`, texto en mayúsculas
   para títulos.
6. **Color con intención:** neutros zinc para casi todo; azul `primary` para acción principal, foco, enlaces y selección;
   naranja `cta` **solo** para el CTA de conversión (máx. 1 por vista, p. ej. "Reservar"); verde/ámbar/rojo solo para estados.
7. **Una familia: Inter.** Pesos 400 / 500 / 600 (700 solo en cifras de marketing). Texto base 14px (`text-sm`).
8. **Accesibilidad:** todo interactivo con foco visible (`focusRing` o `focus-visible:ring-2 ring-primary-500/40`),
   `aria-label` en botones solo-icono (usa `<IconButton label>`), labels asociados en formularios (los `Field` lo hacen solos),
   contraste AA (no uses `text-fg-faint` para texto informativo).

---

## 2. Tokens

### Color

| Token Tailwind | Hex | Uso |
|---|---|---|
| `bg-canvas` | `#FAFAFA` | Fondo de página (ya aplicado en `body`) |
| `bg-white` | `#FFFFFF` | Tarjetas, tablas, modales, inputs |
| `bg-zinc-50` | `#FAFAFA` | Cabeceras de tabla, pies de tarjeta/modal, hover de filas |
| `bg-zinc-100` | `#F4F4F5` | Hover de ghost, fondos de segmented, skeleton |
| `text-fg-strong` | `#0A0A0A` | Títulos, cifras |
| `text-fg` | `#18181B` | Texto principal (por defecto en `body`) |
| `text-fg-muted` | `#52525B` | Texto secundario, labels de tabla |
| `text-fg-subtle` | `#71717A` | Metadatos, hints, iconos inactivos |
| `text-fg-faint` | `#A1A1AA` | Solo deshabilitado |
| `border-line` / `border` | `#E4E4E7` | Borde estándar (el `border` sin color ya usa este) |
| `border-line-strong` | `#D4D4D8` | Bordes de inputs y botones secundarios, hover de tarjetas |
| `border-line-subtle` | `#F4F4F5` | Separadores internos (filas) |
| `primary-600` | `#2563EB` | Acento: botón primario, foco, links, selección (`primary-50/100/700` para tintes) |
| `cta-500` | `#F97316` | CTA principal de conversión **únicamente** |
| `green-*` / `success-*` | `#16A34A` | Estado OK — fondo `bg-green-50`, texto `text-green-700`, borde `border-green-200` |
| `amber-*` / `warning-*` | `#D97706` | Pendiente/aviso — `bg-amber-50 text-amber-800 border-amber-200` |
| `red-*` / `danger-*` | `#DC2626` | Error/destructivo — `bg-red-50 text-red-700 border-red-200` |

Nombres legacy reasignados (no romper clases existentes; **evítalos en código nuevo**):
`primary` = azul nuevo · `goaltime` = alias de `primary` (ya no es verde) · `secondary` = zinc (DEFAULT `#52525B`) ·
`surface` = zinc (DEFAULT `#FAFAFA`) · `dark` = zinc-900 (`dark-900` = `#0A0A0A`) · `gray` = zinc.

### Tipografía

| Rol | Clases |
|---|---|
| Título de página | `text-2xl font-semibold tracking-tight text-fg-strong` |
| Título de sección / tarjeta | `text-sm font-semibold text-fg-strong` (o `text-base` en modales) |
| Cuerpo | `text-sm text-fg` (14px, por defecto) |
| Secundario | `text-[13px] text-fg-muted` |
| Meta / hint / label tabla | `text-xs text-fg-subtle` · `text-xs font-medium text-fg-muted` |
| Eyebrow (opcional) | `text-xs font-medium text-fg-subtle` (sin `uppercase` salvo `text-2xs tracking-wider`) |
| KPI | `text-2xl font-semibold tracking-tight tabular` |
| Números en tablas | `tabular` (clase utilitaria: `font-variant-numeric: tabular-nums`) |

`font-heading` = Inter 600 (alias de compatibilidad). `text-2xs` = 11px.

### Radios (`--radius*`)

| Clase | Valor | Uso |
|---|---|---|
| `rounded-sm` | 2px | Checkboxes, barras de progreso, scrollbar |
| `rounded` | 4px | Badges, chips, tooltips, avatar cuadrado |
| `rounded-md` | 6px | Botones, inputs, selects, tiles de icono, toasts, StatusPill |
| `rounded-lg` | 8px | Tarjetas, tablas, modales, popovers |
| `rounded-full` | — | Solo Avatar / Spinner / punto de estado |

### Sombras (`--shadow-*`)

`shadow-xs` controles · `shadow-sm` hover de tarjeta interactiva · `shadow-md` popovers, dropdowns, toasts ·
`shadow-lg` modales. `shadow-xl/2xl/card/glass` están colapsadas por compatibilidad.

### Espaciado y layout

- Escala Tailwind por defecto (4px). Ritmo habitual: `gap-2` entre controles, `gap-4` entre tarjetas, `space-y-6` entre secciones.
- Contenedor de página: `mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8`.
- Padding de tarjeta: `p-5` (denso `p-4`). Cabeceras de tarjeta `px-5 py-4`.
- Alturas de control: `h-8` (sm) · `h-9` (md, por defecto) · `h-10` (lg).

### Movimiento

`transition-colors duration-150` en interactivos. Animaciones disponibles: `animate-fade-in`, `animate-slide-up`,
`animate-slide-down`, `animate-scale-in` (≤180ms). Se respeta `prefers-reduced-motion` globalmente.
Nada de rebotes ni elevaciones.

---

## 3. Primitivas (`import { … } from "shared/components/ui"`)

Todas aceptan `className` para ajustes de layout (márgenes, ancho, grid), no para re-estilizar.

### Button
```jsx
<Button variant="primary|cta|secondary|ghost|danger|dark" size="sm|md|lg|xl"
        loading fullWidth disabled leftIcon={<Plus />} rightIcon={<ArrowRight />}>Guardar</Button>
```
- `primary` azul sólido (acción principal de la vista) · `cta` naranja (conversión, 1 por vista) · `secondary` blanco + borde ·
  `ghost` terciario/toolbars · `danger` destructivo · `dark` zinc-900.
- Legacy: `goaltime` → primary, `glass` → secondary. **Ojo:** `primary` antes era naranja; ahora es azul.
- No define `type` por defecto (dentro de `<form>` es submit). Pon `type="button"` en botones que no envían.
- Iconos lucide: `className="h-4 w-4"` (`h-3.5 w-3.5` en `sm`).

### IconButton
```jsx
<IconButton label="Editar cancha" variant="ghost|secondary|danger" size="sm|md|lg"><Pencil /></IconButton>
```
Cuadrado, `type="button"` por defecto, `label` obligatorio (aria-label + title). Úsalo en acciones de fila.

### TextField · Textarea · SelectField / Select · FieldShell · Input
```jsx
<TextField label="Nombre" hint="Visible para clientes" error={errors.name} required optional
           size="sm|md|lg" leftIcon={<Search />} prefix="$" rightIcon={…} inputClassName="…" />
<Textarea label="Descripción" rows={4} />
<Select label="Estado" size="sm" placeholder="Todos" options={[{ value: "all", label: "Todos" }]} />
// o con children: <Select …><option …/></Select>
<FieldShell id="x" label="Horario" hint="…" error="…">{/* control propio */}</FieldShell>
```
- `Select` es alias de `SelectField`; todos funcionan sin `label` (uso en toolbars).
- `id` se genera solo; `aria-invalid` y `aria-describedby` (hint/error) se enlazan automáticamente.
- `Input` (label, error, helper, icon, iconEnd, fullWidth) se mantiene por compatibilidad; prefiere `TextField`.

### Card · SectionCard
```jsx
<Card variant="default|flat|dark" padding="p-5" hover>…</Card>
<SectionCard title="Reservas" subtitle="Últimos 30 días" eyebrow="…" icon={<Calendar className="h-4 w-4" />}
             actions={<Button size="sm" variant="secondary">Exportar</Button>}
             footer={…} padding="p-5" bodyClassName="…" as="section">…</SectionCard>
```
SectionCard con tabla a sangre: `padding="p-0"` + `<Table bare>`.

### PageHeader
```jsx
<PageHeader title="Canchas" subtitle="Gestiona tus canchas y su disponibilidad."
            eyebrow="Administración" meta={<StatusPill tone="info">3 pendientes</StatusPill>}
            actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Nueva cancha</Button>} bordered />
```

### StatCard
```jsx
<StatCard title="Pendientes" value={12} subtitle="Por revisar" trend={8} trendUp icon={Hourglass}
          color="primary|secondary|cta|success|warning|danger" onClick={…} />
```
Con `onClick` se renderiza como `<button>`. Grid recomendado: `grid grid-cols-2 gap-4 lg:grid-cols-4`.

### Badge · StatusPill
```jsx
<Badge variant="gray|info|success|warning|error|dark|goaltime|orange" size="sm|md|lg" dot>12</Badge>
<StatusPill tone="success|warning|danger|info|neutral|cta" size="sm|md|lg" dot icon={<Check />}>Confirmada</StatusPill>
```
`StatusPill` = estado de negocio (reserva, cancha, usuario). `Badge` = conteos/categorías. Ambos rectangulares; el `dot` es un cuadrado de 6px.
Mapeo sugerido: confirmada/aprobada → `success`, pendiente → `warning`, cancelada/rechazada → `danger`, deshabilitada → `neutral`.

### Modal
```jsx
<Modal open={open} onClose={close} title="Editar cancha" subtitle="…" eyebrow="…" icon={<Pencil className="h-4 w-4" />}
       size="sm|md|lg|xl|2xl|full" variant="panel|hero" hideClose closeOnBackdrop closeOnEsc
       bodyClassName="space-y-4" footerSticky
       footer={<><Button variant="secondary" type="button" onClick={close}>Cancelar</Button><Button>Guardar</Button></>}>
  …
</Modal>
```
- Focus trap, Escape (solo el modal superior de la pila), bloqueo de scroll con contador, restauración del foco al cerrar,
  `aria-labelledby`/`aria-describedby` automáticos. Marca un campo con `data-autofocus` para enfocarlo al abrir.
- En móvil se muestra como hoja inferior. `hero` = cabecera gris con icono azul (sin gradiente).

### Toast
```jsx
<Toast open={t.open} onClose={hide} message="Reserva creada" type="success|error|warning|info" duration={4000} />
```
Abajo-derecha, borde + barra de acento izquierda; `role="alert"` para error/warning. `duration={0}` = persistente.

### Spinner · Skeleton
```jsx
<Spinner size="sm|md|lg" label="Cargando reservas" />
<Skeleton className="h-4 w-40" />  <SkeletonText lines={3} />  <SkeletonCard />  <SkeletonGrid count={6} />
```
Prefiere skeletons con la forma del contenido final; Spinner para acciones puntuales.

### EmptyState
```jsx
<EmptyState icon={Inbox} title="Sin reservas" description="Cuando un cliente reserve aparecerá aquí."
            action={<Button size="sm">Crear reserva</Button>} secondaryAction={…} size="sm|md" bordered={false} />
```
`icon` acepta componente lucide o nodo. Dentro de tarjetas usa `bordered={false}`.

### Table
```jsx
<Table caption="Reservas" bare dense containerClassName="…">
  <TableHead sticky>
    <TableRow>
      <TableHeaderCell>Cliente</TableHeaderCell>
      <TableHeaderCell onSort={() => toggle("date")} sortDirection={sort.date /* "asc"|"desc"|null */}>Fecha</TableHeaderCell>
      <TableHeaderCell align="right" width={120}>Total</TableHeaderCell>
      <TableHeaderCell className="w-0"><span className="sr-only">Acciones</span></TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {rows.length === 0 ? (
      <TableEmpty colSpan={4}>No hay resultados para este filtro.</TableEmpty>
    ) : rows.map((r) => (
      <TableRow key={r.id} onClick={() => open(r)} selected={r.id === selectedId}>
        <TableCell>{r.name}</TableCell>
        <TableCell muted nowrap>{r.date}</TableCell>
        <TableCell align="right" numeric>{r.total}</TableCell>
        <TableCell><IconButton label="Más acciones" size="sm"><MoreHorizontal /></IconButton></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```
Scroll horizontal automático en móvil. Reemplaza las tablas ad hoc y, progresivamente, `layout/DataTable`.

### Tabs · SegmentedControl
```jsx
<Tabs aria-label="Secciones" variant="underline|segmented" size="sm|md" fullWidth idPrefix="perfil"
      items={[{ value: "info", label: "Información" }, { value: "res", label: "Reservas", count: 4, icon: <Calendar /> }]}
      value={tab} onChange={setTab} />
<div {...getTabPanelProps("perfil", tab)}>…</div>

<SegmentedControl aria-label="Estado" size="sm" value={status} onChange={setStatus}
                  items={[{ value: "all", label: "Todas" }, { value: "pending", label: "Pendientes", count: 3 }]} />
```
Teclado: flechas / Home / End. `Tabs` = secciones de página (tablist); `SegmentedControl` = filtros (radiogroup).

### Avatar
```jsx
<Avatar src={user.photoURL} name={user.displayName} size="xs|sm|md|lg|xl" shape="circle|square" />
```
Único círculo del sistema. Sin imagen (o si falla) muestra iniciales. `square` (4px) para canchas/organizaciones.

### Utilidades
`cx(...clases)` une clases condicionales · `focusRing` = clases de foco estándar para elementos propios.

---

## 4. Recetas

### Página
```jsx
<div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
  <PageHeader title="Reservas" subtitle="…" actions={…} />
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{/* StatCard × 4 */}</div>
  <SectionCard padding="p-0" title="Listado">{/* toolbar + Table bare */}</SectionCard>
</div>
```
(Si el layout del dashboard ya aporta padding, omite `px-*`/`py-*`.)

### Header de página (sin PageHeader)
```jsx
<header className="mb-6 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">Canchas</h1>
    <p className="mt-1.5 text-sm text-fg-muted">12 canchas activas</p>
  </div>
  <div className="flex items-center gap-2">{/* Buttons */}</div>
</header>
```

### Tarjeta
```jsx
<div className="rounded-lg border border-line bg-white">
  <div className="flex items-center justify-between border-b border-line px-5 py-4">
    <h3 className="text-sm font-semibold text-fg-strong">Detalle</h3>
    <Button size="sm" variant="ghost">Editar</Button>
  </div>
  <div className="p-5 text-sm text-fg">…</div>
</div>
```
Tarjeta clicable: añade `transition-colors hover:border-line-strong` (nunca `hover:-translate-y`).
Lista de pares clave/valor: `<dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm"><dt className="text-fg-muted">…</dt><dd>…</dd></dl>`.

### Tabla con toolbar de filtros
```jsx
<SectionCard padding="p-0">
  <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center">
    <TextField size="sm" leftIcon={<Search />} placeholder="Buscar…" className="sm:w-64" aria-label="Buscar" />
    <SegmentedControl size="sm" aria-label="Estado" items={…} value={…} onChange={…} />
    <Select size="sm" className="sm:w-44" aria-label="Cancha" options={…} />
    <div className="sm:ml-auto flex items-center gap-2">
      <Button size="sm" variant="ghost">Limpiar</Button>
      <Button size="sm" variant="secondary" leftIcon={<Download className="h-3.5 w-3.5" />}>Exportar</Button>
    </div>
  </div>
  <Table bare>…</Table>
  <div className="flex items-center justify-between border-t border-line px-4 py-3 text-xs text-fg-muted">
    <span>1–10 de 42</span>
    <div className="flex gap-1">
      <IconButton label="Anterior" variant="secondary" size="sm"><ChevronLeft /></IconButton>
      <IconButton label="Siguiente" variant="secondary" size="sm"><ChevronRight /></IconButton>
    </div>
  </div>
</SectionCard>
```

### Formulario
```jsx
<form onSubmit={submit} className="space-y-6">
  <section className="grid gap-4 sm:grid-cols-2">
    <TextField label="Nombre de la cancha" required error={e.name} className="sm:col-span-2" />
    <TextField label="Precio por hora" prefix="$" inputMode="numeric" />
    <Select label="Tipo" options={types} />
    <Textarea label="Descripción" optional className="sm:col-span-2" />
  </section>
  <div className="flex justify-end gap-2 border-t border-line pt-4">
    <Button type="button" variant="secondary" onClick={cancel}>Cancelar</Button>
    <Button type="submit" loading={saving}>Guardar cambios</Button>
  </div>
</form>
```
Agrupa secciones largas con `<h3 className="text-sm font-semibold">` + `<p className="text-[13px] text-fg-muted">`
y separa con `border-t border-line pt-6`. Errores bajo el campo (prop `error`), no en alertas genéricas.

### Modal de confirmación
```jsx
<Modal open={open} onClose={close} size="sm" title="¿Cancelar reserva?" subtitle="Esta acción no se puede deshacer."
       footer={<>
         <Button type="button" variant="secondary" onClick={close}>Volver</Button>
         <Button type="button" variant="danger" loading={busy} onClick={confirm}>Cancelar reserva</Button>
       </>}>
  <p className="text-sm text-fg-muted">La cancha quedará libre para otros clientes.</p>
</Modal>
```

### Botones: jerarquía por vista
1 `primary` (o 1 `cta` si es conversión) · N `secondary` · resto `ghost`. Destructivo: `danger` solo dentro de la confirmación;
el disparador puede ser `ghost`/`IconButton variant="danger"`. Orden en pies: secundario a la izquierda, primario a la derecha.

### Estados vacíos, carga y error
```jsx
{loading ? <SkeletonText lines={4} />
 : error ? <EmptyState icon={AlertTriangle} title="No pudimos cargar las reservas" description={error}
                       action={<Button size="sm" variant="secondary" onClick={retry}>Reintentar</Button>} />
 : items.length === 0 ? <EmptyState icon={Inbox} title="Aún no hay reservas" description="…" />
 : <Lista />}
```
Aviso en línea (sin componente): `<div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">…</div>`.

### Navegación lateral / items de menú
Item: `flex h-8 items-center gap-2 rounded-md px-2 text-sm text-fg-muted hover:bg-zinc-100 hover:text-fg`;
activo: `bg-zinc-100 text-fg-strong font-medium` (o `bg-white border border-line shadow-xs`). Iconos `h-4 w-4`.

---

## 5. Migración de clases legacy (al tocar un archivo)

| Antes | Ahora |
|---|---|
| `rounded-xl` / `rounded-2xl` / `rounded-3xl` | `rounded-lg` (tarjetas) o `rounded-md` (controles) |
| `rounded-full` en badges/botones/iconos | `rounded` / `rounded-md` |
| `shadow-card`, `shadow-lg`, `shadow-xl`, `hover:shadow-*` en tarjetas | `border border-line` sin sombra |
| `bg-gradient-to-*`, `from-*`, `to-*` | Color plano (`bg-white`, `bg-zinc-50`, `bg-primary-600`) |
| `backdrop-blur-*`, `bg-white/70` | `bg-white` |
| `text-dark`, `text-slate-900` | `text-fg-strong` / `text-fg` |
| `text-slate-500/600`, `text-gray-500` | `text-fg-muted` / `text-fg-subtle` |
| `border-slate-100/200`, `border-gray-100/200` | `border-line` (o `border-line-subtle` para separadores) |
| `bg-goaltime`, `text-goaltime` | `bg-primary-600`, `text-primary-600` (o tono de estado si era "éxito") |
| `font-heading font-bold` | `font-semibold` |
| `uppercase tracking-[0.14em]` en títulos | Quitar (sentence case) |
| `hover:-translate-y-*` | `hover:border-line-strong` / `hover:bg-zinc-50` |
| `<MDBox>`, `<MDTypography>`, `<MDButton>`… | `<div>` + Tailwind, `<p className=…>`, `<Button>` |
| `<table>` ad hoc / `layout/DataTable` | `<Table>` + subcomponentes |

## 6. Compatibilidad

- **md-shims** (`MDBox`, `MDTypography`, `MDButton`, `MDInput`, `MDSnackbar`, `MDAvatar`, `MDProgress`): API intacta, estilos
  del sistema. Las props "system" de MUI (`p`, `mb`, `display`, `sx`, `variant` en MDBox…) **se ignoran** y ya no llegan al DOM;
  si una página necesitaba ese espaciado, usa `className`. `MDTypography` mapea `color` (`text` → `text-fg-muted`, `dark`, `white`, `error`…),
  `fontWeight` y `textTransform`, y respeta `component`. Eliminados: `MDAlert`, `MDBadge`, `MDPagination`.
- **charts** (`ReportsBarChart`, `ReportsLineChart`): mismas props; barras rectas, línea 1.5px, rejilla `#F4F4F5`, tooltip zinc-900.
  El gráfico ocupa la altura del contenedor (dale `h-[280px]` o similar). El pie (título/descripción/fecha) solo aparece si hay contenido.
  `chartColors`, `chartTokens` y `chartBaseOptions()` exportados para gráficos nuevos.
- Tailwind ya **no** usa `important: "#app"`: las utilidades funcionan también en portales (`document.body`).
- Eliminados: `GlassCard`, la dependencia de fuentes Poppins/Open Sans/Material Icons y Leaflet CSS de `index.html`.
