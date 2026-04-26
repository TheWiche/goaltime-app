import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import {
  DashboardLayout,
  DashboardNavbar,
  Footer,
} from "shared/components/layout";
import {
  PageHeader,
  SectionCard,
  StatusPill,
  Button,
  StatCard,
  Toast,
} from "shared/components/ui";
import {
  Plus,
  Search,
  Pencil,
  CircleCheck,
  X,
  User,
  Shield,
  UserCog,
  Users,
} from "lucide-react";
import {
  db,
  callCreateUserRequest,
  callToggleUserStatusRequest,
  callSetUserRoleRequest,
} from "shared/services/firebaseService";
import useDebounce from "shared/hooks/useDebounce";
import AddUserModal from "./components/AddUserModal";
import EditUserRoleModal from "./components/EditUserRoleModal";
import ConfirmationDialog from "./components/ConfirmationDialog";

const ROLE_LABEL = {
  admin: { label: "Administrador", tone: "info" },
  asociado: { label: "Asociado", tone: "cta" },
  cliente: { label: "Cliente", tone: "neutral" },
};

const ROLE_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "admin", label: "Administradores" },
  { value: "asociado", label: "Asociados" },
  { value: "cliente", label: "Clientes" },
];

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [confirmActionText, setConfirmActionText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  useEffect(() => {
    setLoading(true);
    const q =
      roleFilter === "all"
        ? query(collection(db, "users"), orderBy("createdAt", "desc"))
        : query(collection(db, "users"), where("role", "==", roleFilter));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (roleFilter !== "all") {
          data.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
        }
        setUsers(data);
        setLoading(false);
      },
      () => {
        setUsers([]);
        setLoading(false);
        setToast({ open: true, type: "error", message: "Error al cargar usuarios." });
      }
    );
    return () => unsub();
  }, [roleFilter]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return users;
    const q = debouncedSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, debouncedSearch]);

  const counts = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      asociado: users.filter((u) => u.role === "asociado").length,
      cliente: users.filter((u) => u.role === "cliente").length,
    }),
    [users]
  );

  const handleEditRole = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleToggleDisable = (user) => {
    const actionText = user.status === "disabled" ? "habilitar" : "deshabilitar";
    setUserToToggle(user);
    setConfirmActionText(actionText);
    setIsConfirmOpen(true);
  };

  const confirmToggleDisable = async () => {
    if (!userToToggle) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await callToggleUserStatusRequest(userToToggle.id);
      setToast({ open: true, type: "success", message: result.message });
      setUserToToggle(null);
    } catch (error) {
      setToast({ open: true, type: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateUser = async (userData) => {
    setLoadingAction(true);
    try {
      const result = await callCreateUserRequest(userData);
      setIsAddModalOpen(false);
      setToast({ open: true, type: "success", message: result.message });
    } catch (error) {
      setToast({ open: true, type: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveRole = async (editedUser, newRole) => {
    setLoadingAction(true);
    try {
      const result = await callSetUserRoleRequest(editedUser.id, newRole);
      setIsEditModalOpen(false);
      setUserToEdit(null);
      setToast({ open: true, type: "success", message: result.message });
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
        eyebrow="Administración · Usuarios"
        title="Gestión de usuarios"
        subtitle="Crea, edita roles y administra el acceso de cada miembro del sistema."
        actions={
          <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Crear usuario
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} color="primary" title="Total" value={counts.total} subtitle="Usuarios" />
        <StatCard icon={Shield} color="secondary" title="Admins" value={counts.admin} subtitle="Acceso completo" />
        <StatCard icon={UserCog} color="cta" title="Asociados" value={counts.asociado} subtitle="Dueños de canchas" />
        <StatCard icon={User} color="success" title="Clientes" value={counts.cliente} subtitle="Reservan canchas" />
      </div>

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
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((opt) => {
              const active = roleFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoleFilter(opt.value)}
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
          <div className="p-12 text-center text-sm text-slate-500">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary mx-auto mb-3 flex items-center justify-center">
              <Users className="h-7 w-7" strokeWidth={2} aria-hidden />
            </div>
            <p className="text-base font-semibold font-heading text-slate-900">
              {searchTerm ? "Sin resultados" : "No hay usuarios"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm
                ? `No se encontró nada para "${searchTerm}"`
                : "Aún no hay usuarios registrados con este filtro."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="text-left font-semibold px-5 py-3">Usuario</th>
                  <th className="text-left font-semibold px-5 py-3">Rol</th>
                  <th className="text-left font-semibold px-5 py-3">Estado</th>
                  <th className="text-left font-semibold px-5 py-3 hidden lg:table-cell">
                    Fecha de creación
                  </th>
                  <th className="text-right font-semibold px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => {
                  const role = ROLE_LABEL[user.role] || {
                    label: user.role || "N/A",
                    tone: "neutral",
                  };
                  const isDisabled = user.status === "disabled";
                  const created = user.createdAt?.seconds
                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                    : "—";
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name || ""}
                              className="shrink-0 w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold flex items-center justify-center">
                              {user.name ? user.name[0].toUpperCase() : "U"}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {user.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {user.email || "Sin correo"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill tone={role.tone} size="sm">
                          {role.label}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill tone={isDisabled ? "neutral" : "success"} size="sm" dot>
                          {isDisabled ? "Deshabilitado" : "Activo"}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">
                        {created}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(user)}
                          >
                            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                            Editar rol
                          </Button>
                          <Button
                            variant={isDisabled ? "primary" : "danger"}
                            size="sm"
                            disabled={loadingAction}
                            onClick={() => handleToggleDisable(user)}
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

      <AddUserModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUser}
        loading={loadingAction}
      />
      <EditUserRoleModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }}
        onSubmit={handleSaveRole}
        loading={loadingAction}
        user={userToEdit}
      />
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setUserToToggle(null);
        }}
        onConfirm={confirmToggleDisable}
        title={`Confirmar ${
          confirmActionText === "habilitar" ? "habilitación" : "deshabilitación"
        }`}
        message={`¿Estás seguro de que quieres ${confirmActionText} a ${
          userToToggle?.name || "este usuario"
        }?`}
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

export default AdminUsers;
