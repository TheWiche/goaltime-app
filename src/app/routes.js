// src/app/routes.js
//
// Registro único de rutas. Campos de cada entrada:
//  - key / route / component: identificador, path y elemento (ya envuelto en ProtectedRoute/GuestRoute).
//  - layout: "dashboard" (con Sidenav), "auth" o "public" (sin Sidenav).
//  - roles: LISTA BLANCA de roles que ven la ruta en el menú. Debe coincidir con <ProtectedRoute roles>.
//  - type: "collapse" → aparece en el Sidenav (App.js lo filtra por `roles`).

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

import { LayoutDashboard, Users, Building2, CalendarDays, Goal, User } from "lucide-react";

const navIcon = (IconCmp) => <IconCmp className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />;

const ADMIN = "admin";
const ASOCIADO = "asociado";
const CLIENTE = "cliente";

/** Rutas del panel (requieren sesión y rol). */
const dashboardRoutes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: navIcon(LayoutDashboard),
    route: "/dashboard",
    roles: [ADMIN, ASOCIADO],
    component: (
      <ProtectedRoute roles={[ADMIN, ASOCIADO]}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Usuarios",
    key: "admin-users",
    icon: navIcon(Users),
    route: "/admin/users",
    roles: [ADMIN],
    component: (
      <ProtectedRoute roles={[ADMIN]}>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Mis Canchas",
    key: "associate-fields",
    icon: navIcon(Building2),
    route: "/associate/fields",
    roles: [ASOCIADO],
    component: (
      <ProtectedRoute roles={[ASOCIADO]}>
        <AssociateFields />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Reservas",
    key: "associate-reservations",
    icon: navIcon(CalendarDays),
    route: "/associate/reservations",
    roles: [ASOCIADO],
    component: (
      <ProtectedRoute roles={[ASOCIADO]}>
        <AssociateReservations />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Canchas",
    key: "canchas",
    icon: navIcon(Goal),
    route: "/canchas",
    roles: [ADMIN, ASOCIADO, CLIENTE],
    component: (
      <ProtectedRoute roles={[ADMIN, ASOCIADO, CLIENTE]}>
        <Canchas />
      </ProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Mis Reservaciones",
    key: "reservations",
    icon: navIcon(CalendarDays),
    route: "/reservations",
    roles: [CLIENTE],
    component: (
      <ProtectedRoute roles={[CLIENTE]}>
        <Reservations />
      </ProtectedRoute>
    ),
  },
  {
    name: "Perfil",
    key: "profile",
    icon: navIcon(User),
    route: "/profile",
    roles: [ADMIN, ASOCIADO, CLIENTE],
    component: (
      <ProtectedRoute roles={[ADMIN, ASOCIADO, CLIENTE]}>
        <Profile />
      </ProtectedRoute>
    ),
  },
].map((route) => ({ ...route, layout: "dashboard" }));

/** Autenticación: solo invitados (GuestRoute gestiona sesión activa, verificación y rol). */
const authRoutes = [
  {
    key: "sign-in",
    route: "/authentication/sign-in",
    component: (
      <GuestRoute>
        <SignIn />
      </GuestRoute>
    ),
  },
  {
    key: "sign-up",
    route: "/authentication/sign-up",
    component: (
      <GuestRoute>
        <SignUp />
      </GuestRoute>
    ),
  },
  {
    // Se muestra aunque haya sesión sin verificar (GuestRoute lo deja pasar): es la pantalla
    // a la que se llega justo tras el registro.
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
    // El enlace del correo debe funcionar aunque ya haya otra sesión abierta.
    key: "confirm-reset-password",
    route: "/authentication/reset-password/confirm",
    component: (
      <GuestRoute allowAuthenticated>
        <ConfirmResetPassword />
      </GuestRoute>
    ),
  },
  {
    key: "handle-firebase-action",
    route: "/__/auth/action",
    component: <HandleFirebaseAction />,
  },
].map((route) => ({ ...route, layout: "auth" }));

/** Páginas públicas (accesibles con o sin sesión). */
const publicRoutes = [
  { key: "homepage", route: "/", component: <Homepage /> },
  { key: "privacy-policy", route: "/politica-de-privacidad", component: <PrivacyPolicy /> },
  { key: "terms-of-service", route: "/terminos-y-condiciones", component: <TermsOfService /> },
  { key: "about-us", route: "/sobre-nosotros", component: <AboutUs /> },
  { key: "blog", route: "/blog", component: <Blog /> },
  { key: "license", route: "/licencia", component: <License /> },
].map((route) => ({ ...route, layout: "public" }));

const routes = [...dashboardRoutes, ...authRoutes, ...publicRoutes];

export default routes;
