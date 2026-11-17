import { useNavigate } from "react-router-dom";
import { useAuth } from "shared/context/AuthContext";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import AdminView from "./AdminView";
import AssociateView from "./AssociateView";
import ClientWelcome from "./ClientWelcome";

/** Panel por rol: admin y asociado ven métricas; el resto (cliente) ve la bienvenida. */
function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const role = userProfile?.role;
  const firstName = userProfile?.name?.trim().split(/\s+/)[0] || "operador";

  let content;
  if (role === "admin") {
    content = <AdminView firstName={firstName} />;
  } else if (role === "asociado" && userProfile.uid) {
    content = <AssociateView uid={userProfile.uid} firstName={firstName} />;
  } else {
    content = <ClientWelcome onExplore={() => navigate("/canchas")} />;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {content}
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
