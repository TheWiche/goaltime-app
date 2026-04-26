// src/app/routes.js

import Dashboard from "features/dashboard/pages/dashboard";
import AdminUsers from "features/users/pages/admin-users";
import AssociateFields from "features/fields/pages/associate-fields";
import AssociateReservations from "features/reservations/pages/associate-reservations";
import Canchas from "features/fields/pages/canchas";
import Profile from "features/profile/pages/profile";
import Reservations from "features/reservations/pages/reservations";
import SignIn from "features/auth/pages/sign-in";
import SignUp from "features/auth/pages/sign-up";
import VerifyEmail from "features/auth/pages/verify-email";
import ResetPassword from "features/auth/pages/reset-password/cover";
import ConfirmResetPassword from "features/auth/pages/reset-password/confirm";
import HandleFirebaseAction from "features/auth/pages/reset-password/handle-action";
import AboutUs from "features/public/pages/about-us";
import Blog from "features/public/pages/blog";
import License from "features/public/pages/license";
import PrivacyPolicy from "features/public/pages/privacy-policy";
import TermsOfService from "features/public/pages/terms-of-service";
import Homepage from "features/public/pages/homepage";

import GuestRoute from "shared/components/routing/GuestRoute";
import ProtectedRoute from "shared/components/routing/ProtectedRoute";

import Icon from "@mui/material/Icon";

const routes = [
  // --- Rutas Protegidas (Solo para usuarios logueados) ---
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Usuarios",
    key: "admin-users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/admin/users",
    component: (
      <ProtectedRoute>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Mis Canchas",
    key: "associate-fields",
    icon: <Icon fontSize="small">stadium</Icon>,
    route: "/associate/fields",
    component: (
      <ProtectedRoute>
        <AssociateFields />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Reservas",
    key: "associate-reservations",
    icon: <Icon fontSize="small">event</Icon>,
    route: "/associate/reservations",
    component: (
      <ProtectedRoute>
        <AssociateReservations />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Canchas",
    key: "canchas",
    icon: <Icon fontSize="small">sports_soccer</Icon>,
    route: "/canchas",
    component: (
      <ProtectedRoute>
        <Canchas />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Mis Reservaciones",
    key: "reservations",
    icon: <Icon fontSize="small">event</Icon>,
    route: "/reservations",
    component: (
      <ProtectedRoute>
        <Reservations />
      </ProtectedRoute>
    ),
  },
  {
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  // --- Rutas de Invitado (Solo para usuarios NO logueados) ---
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: (
      <GuestRoute>
        <SignIn />
      </GuestRoute>
    ),
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: (
      <GuestRoute>
        <SignUp />
      </GuestRoute>
    ),
  },
  {
    key: "verify-email",
    route: "/authentication/verify-email",
    component: (
      <GuestRoute>
        <VerifyEmail />
      </GuestRoute>
    ),
  },
  {
    key: "reset-password",
    route: "/authentication/reset-password",
    component: (
      <GuestRoute>
        <ResetPassword />
      </GuestRoute>
    ),
  },
  {
    key: "confirm-reset-password",
    route: "/authentication/reset-password/confirm",
    component: (
      <GuestRoute>
        <ConfirmResetPassword />
      </GuestRoute>
    ),
  },
  {
    key: "handle-firebase-action",
    route: "/__/auth/action",
    component: <HandleFirebaseAction />,
  },

  // --- Rutas Públicas (Visibles para TODOS, pero no en el menú) ---
  {
    key: "homepage",
    route: "/",
    component: <Homepage />,
  },
  {
    key: "privacy-policy",
    route: "/politica-de-privacidad",
    component: <PrivacyPolicy />,
  },
  {
    key: "terms-of-service",
    route: "/terminos-y-condiciones",
    component: <TermsOfService />,
  },
  {
    key: "about-us",
    route: "/sobre-nosotros",
    component: <AboutUs />,
  },
  {
    key: "blog",
    route: "/blog",
    component: <Blog />,
  },
  {
    key: "license",
    route: "/licencia",
    component: <License />,
  },
];

export default routes;
