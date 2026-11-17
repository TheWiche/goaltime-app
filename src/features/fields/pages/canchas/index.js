import { useCallback, useState } from "react";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import { SkeletonGrid, Toast } from "shared/components/ui";
import { useAuth } from "shared/context/AuthContext";
import AdminCanchasView from "./components/AdminCanchasView";
import CatalogCanchasView from "./components/CatalogCanchasView";

/**
 * /canchas
 *  - admin: moderación y edición de todo el catálogo (filtro por estado vía ?status=).
 *  - cliente / asociado: catálogo de canchas aprobadas.
 * Parámetros: ?fieldId= (desplaza y resalta), ?edit= (admin, abre edición).
 */
function Canchas() {
  const { userProfile, currentUser } = useAuth();
  const role = userProfile?.role;
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });

  const showToast = useCallback((message, type = "info") => setToast({ open: true, message, type }), []);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {!role ? (
        <SkeletonGrid count={6} />
      ) : role === "admin" ? (
        <AdminCanchasView showToast={showToast} />
      ) : (
        <CatalogCanchasView
          role={role}
          currentUser={currentUser}
          userProfile={userProfile}
          showToast={showToast}
        />
      )}

      <Footer />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </DashboardLayout>
  );
}

export default Canchas;
