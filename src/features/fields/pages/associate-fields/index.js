import { DashboardLayout, DashboardNavbar, Footer, DataTable } from "shared/components/layout";
import { Toast } from "shared/components/ui";
// src/features/fields/pages/associate-fields/index.js

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFieldsTableData from "./data/fieldsTableData";
import TableToolbar from "./components/TableToolbar";
import AddFieldModal from "./components/AddFieldModal";
import EditFieldModal from "./components/EditFieldModal";
import { createField, updateField, toggleFieldStatus } from "shared/services/firebaseService";
import ConfirmationDialog from "features/users/pages/admin-users/components/ConfirmationDialog";

function AssociateFields() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToToggle, setFieldToToggle] = useState(null);
  const [confirmActionText, setConfirmActionText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, color: "info", message: "" });
  const [pageSize, setPageSize] = useState(10);
  const entriesOptions = [10, 25, 50];
  const hasProcessedAddParam = useRef(false);

  // --- Manejadores de Modales y Acciones ---
  const handleEditField = (field) => {
    setFieldToEdit(field);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setFieldToEdit(null);
  };

  const handleToggleDisable = (field) => {
    const actionText = field.status === "disabled" ? "habilitar" : "deshabilitar";
    setFieldToToggle(field);
    setConfirmActionText(actionText);
    setIsConfirmOpen(true);
  };

  const confirmToggleDisable = async () => {
    if (!fieldToToggle) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      const result = await toggleFieldStatus(fieldToToggle.id);
      setSnackbar({ open: true, color: "success", message: result.message });
      setFieldToToggle(null);
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Hook de datos, pasando los manejadores de acción
  const { columns, rows, loading, error } = useFieldsTableData(
    searchTerm,
    statusFilter,
    handleEditField,
    handleToggleDisable
  );

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    // Limpiar el parámetro de la URL cuando se cierra el modal
    if (location.search.includes("add=true")) {
      navigate("/associate/fields", { replace: true });
    }
  };

  // Detectar parámetro 'add' en la URL y abrir modal automáticamente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldAdd = searchParams.get("add") === "true";

    if (shouldAdd && !isAddModalOpen && !hasProcessedAddParam.current) {
      hasProcessedAddParam.current = true;
      setIsAddModalOpen(true);
      // Limpiar el parámetro de la URL
      navigate("/associate/fields", { replace: true });
    }

    // Resetear la bandera cuando cambia el parámetro de la URL
    if (!shouldAdd) {
      hasProcessedAddParam.current = false;
    }
  }, [location.search, isAddModalOpen, navigate]);

  const handleCreateField = async (fieldData) => {
    setLoadingAction(true);
    try {
      await createField(fieldData);
      handleCloseAddModal();
      setSnackbar({ open: true, color: "success", message: "Cancha creada exitosamente." });
    } catch (error) {
      setSnackbar({ open: true, color: "error", message: error.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateField = async (fieldId, fieldData) => {
    setLoadingAction(true);
    try {
      await updateField(fieldId, fieldData);
      handleCloseEditModal();
      setSnackbar({ open: true, color: "success", message: "Cancha actualizada exitosamente." });
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
        <h1 className="text-2xl font-bold text-dark mb-6">Mis Canchas</h1>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-goaltime to-green-400 p-4 flex justify-between items-center">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-dark hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Registrar Cancha
            </button>
          </div>

          {/* Toolbar */}
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            statusFilter={statusFilter}
            onStatusChange={(newStatus) => {
              if (newStatus) setStatusFilter(newStatus);
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
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar canchas</h3>
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
      <AddFieldModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateField}
        loading={loadingAction}
      />
      <EditFieldModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateField}
        loading={loadingAction}
        field={fieldToEdit}
      />
      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setFieldToToggle(null);
        }}
        onConfirm={confirmToggleDisable}
        title={`Confirmar ${
          confirmActionText === "habilitar" ? "Habilitación" : "Deshabilitación"
        }`}
        message={`¿Estás seguro de que quieres ${confirmActionText} la cancha "${
          fieldToToggle?.name || "esta cancha"
        }"?`}
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

export default AssociateFields;
