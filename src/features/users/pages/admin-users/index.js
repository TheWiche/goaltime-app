// src/features/users/pages/admin-users/index.js

import { useState } from "react";
import { DashboardLayout, DashboardNavbar, Footer, DataTable } from "shared/components/layout";
import useUsersTableData from "./data/usersTableData";
import TableToolbar from "./components/TableToolbar";
import AddUserModal from "./components/AddUserModal";
import EditUserRoleModal from "./components/EditUserRoleModal";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { Toast } from "shared/components/ui";
import {
  callCreateUserRequest,
  callToggleUserStatusRequest,
  callSetUserRoleRequest,
} from "shared/services/firebaseService";

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [confirmActionText, setConfirmActionText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [pageSize, setPageSize] = useState(10);
  const entriesOptions = [10, 25, 50];

  // --- Manejadores de Modales y Acciones ---
  const handleEditRole = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
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
      setSnackbar({ open: true, color: "success", message: result.message });
      setUserToToggle(null);
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Hook de datos
  const { columns, rows, loading, error } = useUsersTableData(
    searchTerm,
    roleFilter,
    handleEditRole,
    handleToggleDisable
  );

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleCreateUser = async (userData) => {
    setLoadingAction(true);
    try {
      const result = await callCreateUserRequest(userData);
      handleCloseAddModal();
      setSnackbar({ open: true, color: "success", message: result.message });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveRole = async (editedUser, newRole) => {
    setLoadingAction(true);
    try {
      const result = await callSetUserRoleRequest(editedUser.id, newRole);
      handleCloseEditModal();
      setSnackbar({ open: true, color: "success", message: result.message });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // --- Renderizado del Componente ---
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-dark mb-6">Gestión de Usuarios</h1>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-goaltime to-green-400 p-4 flex justify-between items-center">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-dark hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Crear Usuario
            </button>
          </div>

          {/* Toolbar */}
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            roleFilter={roleFilter}
            onRoleChange={(newRole) => {
              if (newRole) setRoleFilter(newRole);
            }}
            entriesPerPage={pageSize}
            onEntriesChange={setPageSize}
            entriesOptions={entriesOptions}
          />

          {/* Table Container */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-goaltime border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar usuarios</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-goaltime hover:bg-goaltime-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Recargar página
                </button>
              </div>
            ) : (
              <DataTable
                table={{ columns, rows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries
                noEndBorder
                canSearch={false}
                initialState={{ pageSize: pageSize }}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Modales */}
      <AddUserModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateUser}
        loading={loadingAction}
      />
      <EditUserRoleModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
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
          confirmActionText === "habilitar" ? "Habilitación" : "Deshabilitación"
        }`}
        message={`¿Estás seguro de que quieres ${confirmActionText} a ${
          userToToggle?.name || "este usuario"
        }?`}
        confirmColor={confirmActionText === "habilitar" ? "success" : "error"}
      />

      {/* Toast Notifications */}
      {snackbar.open && (
        <Toast
          type={snackbar.color === "success" ? "success" : snackbar.color === "error" ? "error" : "info"}
          message={snackbar.message}
          onClose={closeSnackbar}
        />
      )}
    </DashboardLayout>
  );
}

export default AdminUsers;
