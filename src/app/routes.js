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

import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Goal,
  User,
  LogIn,
  ClipboardList,
} from "lucide-react";

const navIcon = (IconCmp) => <IconCmp className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />;

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: navIcon(LayoutDashboard),
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
    icon: navIcon(Users),
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
    icon: navIcon(Building2),
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
    icon: navIcon(CalendarDays),
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
    icon: navIcon(Goal),
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
    icon: navIcon(CalendarDays),
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
    icon: navIcon(User),
    route: "/profile",
    component: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: navIcon(LogIn),
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
    icon: navIcon(ClipboardList),
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
