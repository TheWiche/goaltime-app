import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { collection, onSnapshot } from "firebase/firestore";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import ConfirmationDialog from "shared/components/layout/ConfirmationDialog";
import {
  Avatar,
  Button,
  EmptyState,
  IconButton,
  PageHeader,
  SectionCard,
  Skeleton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  TextField,
  Toast,
  getTabPanelProps,
} from "shared/components/ui";
import { Plus, Search, Pencil, UserCheck, UserX, TriangleAlert, Users } from "lucide-react";
import {
  db,
  callCreateUserRequest,
  callToggleUserStatusRequest,
  callSetUserRoleRequest,
} from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import useDebounce from "shared/hooks/useDebounce";
import { toDate, formatDateEs } from "shared/utils/date";
import { logger } from "shared/utils/logger";
import AddUserModal from "./components/AddUserModal";
import EditUserRoleModal from "./components/EditUserRoleModal";

const ROLE_META = {
  admin: { label: "Administrador", tone: "info", rank: 3 },
  asociado: { label: "Asociado", tone: "cta", rank: 2 },
  cliente: { label: "Cliente", tone: "neutral", rank: 1 },
};

const roleMeta = (role) => ROLE_META[role] || { label: role || "N/A", tone: "neutral", rank: 0 };

const TAB_PREFIX = "users-role";

const createdMillis = (u) => toDate(u.createdAt)?.getTime() || 0;

/** Cambios de rol que exigen confirmación extra: dar admin o bajar de rol. */
const needsRoleConfirmation = (from, to) =>
  to === "admin" || roleMeta(to).rank < roleMeta(from || "cliente").rank;

function RowActions({ user, isSelf, busy, onEditRole, onToggle }) {
  const name = user.name || user.email || "usuario";
  const isDisabled = user.status === "disabled";
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton
        label={isSelf ? "Tu propio rol no se puede editar" : `Editar rol de ${name}`}
        disabled={isSelf || busy}
        onClick={() => onEditRole(user)}
      >
        <Pencil aria-hidden />
      </IconButton>
      {isDisabled ? (
        <IconButton label={`Habilitar a ${name}`} disabled={busy} onClick={() => onToggle(user)}>
          <UserCheck aria-hidden />
        </IconButton>
      ) : (
        <IconButton
          label={isSelf ? "Tu propia cuenta no se puede deshabilitar" : `Deshabilitar a ${name}`}
          variant="danger"
          disabled={isSelf || busy}
          onClick={() => onToggle(user)}
        >
          <UserX aria-hidden />
        </IconButton>
      )}
    </div>
  );
}

RowActions.propTypes = {
  user: PropTypes.object.isRequired,
  isSelf: PropTypes.bool.isRequired,
  busy: PropTypes.bool.isRequired,
  onEditRole: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

function UserIdentity({ user, isSelf }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={user.photoURL} name={user.name || user.email} size="md" />
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-fg-strong">
          <span className="truncate">{user.name || "Sin nombre"}</span>
          {isSelf && (
            <span className="shrink-0 rounded border border-line bg-zinc-50 px-1.5 py-0.5 text-2xs font-medium text-fg-muted">
              Tú
            </span>
          )}
        </p>
        <p className="truncate text-xs text-fg-muted">{user.email || "Sin correo"}</p>
      </div>
    </div>
  );
}

UserIdentity.propTypes = {
  user: PropTypes.object.isRequired,
  isSelf: PropTypes.bool.isRequired,
};

function AdminUsers() {
  const { currentUser } = useAuth();
  const currentUid = currentUser?.uid;

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Una sola suscripción con TODOS los usuarios; filtros y contadores se calculan en cliente.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [roleChange, setRoleChange] = useState(null); // { user, newRole }
  const [userToToggle, setUserToToggle] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  const showToast = (type, message) => setToast({ open: true, type, message });

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => createdMillis(b) - createdMillis(a));
        setUsers(data);
        setLoading(false);
      },
      (error) => {
        logger.error("admin-users: onSnapshot", error);
        setUsers([]);
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [reloadKey]);

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      asociado: users.filter((u) => u.role === "asociado").length,
      cliente: users.filter((u) => u.role === "cliente").length,
    }),
    [users]
  );

  const tabItems = useMemo(
    () => [
      { value: "all", label: "Todos", count: counts.all },
      { value: "admin", label: "Administradores", count: counts.admin },
      { value: "asociado", label: "Asociados", count: counts.asociado },
      { value: "cliente", label: "Clientes", count: counts.cliente },
    ],
    [counts]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });
  }, [users, roleFilter, debouncedSearch]);

  const handleEditRole = (user) => {
    if (user.id === currentUid) return;
    setUserToEdit(user);
  };

  const handleToggleDisable = (user) => {
    if (user.id === currentUid && user.status !== "disabled") return;
    setUserToToggle(user);
  };

  const confirmToggleDisable = async () => {
    if (!userToToggle) return;
    setLoadingAction(true);
    try {
      const result = await callToggleUserStatusRequest(userToToggle.id);
      showToast("success", result.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setLoadingAction(false);
      setUserToToggle(null);
    }
  };

  const handleCreateUser = async (userData) => {
    setLoadingAction(true);
    try {
      const result = await callCreateUserRequest(userData);
      setIsAddModalOpen(false);
      showToast("success", result.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const applyRoleChange = async (user, newRole) => {
    setLoadingAction(true);
    try {
      const result = await callSetUserRoleRequest(user.id, newRole);
      setUserToEdit(null);
      showToast("success", result.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setLoadingAction(false);
      setRoleChange(null);
    }
  };

  const handleSaveRole = async (editedUser, newRole) => {
    if (editedUser.id === currentUid) return;
    if (needsRoleConfirmation(editedUser.role, newRole)) {
      setRoleChange({ user: editedUser, newRole });
      return;
    }
    await applyRoleChange(editedUser, newRole);
  };

  const hasSearch = debouncedSearch.trim().length > 0;
  const isToggleEnable = userToToggle?.status === "disabled";
  const toggleName = userToToggle?.name || userToToggle?.email || "este usuario";

  const roleChangeIsGrant = roleChange?.newRole === "admin";
  const roleChangeMessage = roleChange
    ? roleChangeIsGrant
      ? `${roleChange.user.name || "Este usuario"} tendrá acceso total: podrá gestionar usuarios, canchas y reservas de toda la plataforma.`
      : `${roleChange.user.name || "Este usuario"} pasará de ${roleMeta(roleChange.user.role).label} a ${roleMeta(roleChange.newRole).label} y perderá los permisos del rol actual.`
    : "";

  let content;
  if (loading) {
    content = (
      <div className="divide-y divide-line-subtle" aria-busy="true" aria-label="Cargando usuarios">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-10 w-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (loadError) {
    content = (
      <EmptyState
        bordered={false}
        icon={TriangleAlert}
        title="No pudimos cargar los usuarios"
        description="Revisa tu conexión e inténtalo de nuevo."
        action={
          <Button size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Reintentar
          </Button>
        }
      />
    );
  } else if (filtered.length === 0) {
    content = (
      <EmptyState
        bordered={false}
        icon={hasSearch ? Search : Users}
        title={hasSearch ? "Sin resultados" : "No hay usuarios"}
        description={
          hasSearch
            ? `No se encontró ningún usuario para "${debouncedSearch.trim()}".`
            : "Aún no hay usuarios con este rol."
        }
      />
    );
  } else {
    content = (
      <>
        {/* Móvil: tarjetas */}
        <ul className="m-0 list-none divide-y divide-line-subtle p-0 md:hidden">
          {filtered.map((user) => {
            const role = roleMeta(user.role);
            const isDisabled = user.status === "disabled";
            const isSelf = user.id === currentUid;
            return (
              <li key={user.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <UserIdentity user={user} isSelf={isSelf} />
                  <RowActions
                    user={user}
                    isSelf={isSelf}
                    busy={loadingAction}
                    onEditRole={handleEditRole}
                    onToggle={handleToggleDisable}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-[52px]">
                  <StatusPill tone={role.tone} size="sm">
                    {role.label}
                  </StatusPill>
                  <StatusPill tone={isDisabled ? "neutral" : "success"} size="sm" dot>
                    {isDisabled ? "Deshabilitado" : "Activo"}
                  </StatusPill>
                  <span className="text-xs text-fg-subtle">
                    {formatDateEs(user.createdAt, { day: "numeric", month: "short", year: "numeric" }, "—")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Escritorio: tabla */}
        <div className="hidden md:block">
          <Table bare caption="Usuarios del sistema">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Usuario</TableHeaderCell>
                <TableHeaderCell>Rol</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell className="hidden lg:table-cell">Creado</TableHeaderCell>
                <TableHeaderCell align="right" width={104}>
                  <span className="sr-only">Acciones</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => {
                const role = roleMeta(user.role);
                const isDisabled = user.status === "disabled";
                const isSelf = user.id === currentUid;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserIdentity user={user} isSelf={isSelf} />
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={role.tone} size="sm">
                        {role.label}
                      </StatusPill>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={isDisabled ? "neutral" : "success"} size="sm" dot>
                        {isDisabled ? "Deshabilitado" : "Activo"}
                      </StatusPill>
                    </TableCell>
                    <TableCell muted nowrap className="hidden lg:table-cell">
                      {formatDateEs(user.createdAt, { day: "numeric", month: "short", year: "numeric" }, "—")}
                    </TableCell>
                    <TableCell align="right">
                      <RowActions
                        user={user}
                        isSelf={isSelf}
                        busy={loadingAction}
                        onEditRole={handleEditRole}
                        onToggle={handleToggleDisable}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        eyebrow="Administración"
        title="Gestión de usuarios"
        subtitle="Crea usuarios, edita sus roles y administra el acceso al sistema."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setIsAddModalOpen(true)}>
            Crear usuario
          </Button>
        }
      />

      <SectionCard padding="p-0">
        <Tabs
          aria-label="Filtrar usuarios por rol"
          idPrefix={TAB_PREFIX}
          items={tabItems}
          value={roleFilter}
          onChange={setRoleFilter}
          className="px-4 sm:px-5"
        />
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <TextField
            size="sm"
            type="search"
            aria-label="Buscar usuarios por nombre o correo"
            placeholder="Buscar por nombre o correo"
            leftIcon={<Search aria-hidden />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        <div {...getTabPanelProps(TAB_PREFIX, roleFilter)}>{content}</div>

        {!loading && !loadError && users.length > 0 && (
          <div className="border-t border-line px-4 py-2.5 text-xs text-fg-muted sm:px-5" aria-live="polite">
            Mostrando {filtered.length} de {users.length} usuarios
          </div>
        )}
      </SectionCard>

      <Footer />

      <AddUserModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUser}
        loading={loadingAction}
      />
      <EditUserRoleModal
        open={Boolean(userToEdit)}
        onClose={() => setUserToEdit(null)}
        onSubmit={handleSaveRole}
        loading={loadingAction}
        user={userToEdit}
      />
      <ConfirmationDialog
        open={Boolean(roleChange)}
        onClose={() => setRoleChange(null)}
        onConfirm={() => applyRoleChange(roleChange.user, roleChange.newRole)}
        loading={loadingAction}
        title={roleChangeIsGrant ? "Dar rol de administrador" : "Reducir el rol del usuario"}
        message={roleChangeMessage}
        confirmColor={roleChangeIsGrant ? "warning" : "error"}
        confirmLabel="Cambiar rol"
      />
      <ConfirmationDialog
        open={Boolean(userToToggle)}
        onClose={() => setUserToToggle(null)}
        onConfirm={confirmToggleDisable}
        loading={loadingAction}
        title={isToggleEnable ? "Habilitar usuario" : "Deshabilitar usuario"}
        message={
          isToggleEnable
            ? `${toggleName} volverá a poder iniciar sesión.`
            : `${toggleName} no podrá iniciar sesión hasta que lo habilites de nuevo.`
        }
        confirmColor={isToggleEnable ? "success" : "error"}
        confirmLabel={isToggleEnable ? "Habilitar" : "Deshabilitar"}
      />

      <Toast
        open={toast.open}
        message={toast.message || " "}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </DashboardLayout>
  );
}

export default AdminUsers;
