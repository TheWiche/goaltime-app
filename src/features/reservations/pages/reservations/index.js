import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { DashboardLayout, DashboardNavbar, Footer } from "shared/components/layout";
import {
  PageHeader,
  SectionCard,
  StatusPill,
  Button,
  StatCard,
} from "shared/components/ui";
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CalendarOff,
  Hourglass,
  CircleCheck,
  XCircle,
  Banknote,
  Trophy,
} from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import { db } from "shared/services/firebaseService";
import TicketModal from "./components/TicketModal";

const STATUS = {
  pending: { label: "Pendiente", tone: "warning" },
  confirmed: { label: "Confirmada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "danger" },
  completed: { label: "Completada", tone: "info" },
};

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "completed", label: "Completadas" },
  { value: "cancelled", label: "Canceladas" },
];

function formatDate(value) {
  if (!value) return "—";
  let d;
  if (value.seconds) d = new Date(value.seconds * 1000);
  else if (typeof value === "string" && value.includes("-")) d = new Date(value);
  else if (value instanceof Date) d = value;
  else return "—";
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
}

function Reservations() {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "cliente") {
      setLoadingReservations(false);
      return undefined;
    }

    setLoadingReservations(true);

    const reservationsQuery = query(
      collection(db, "reservations"),
      where("clientId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snap) => {
        setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingReservations(false);
      },
      (error) => {
        if (error.code === "failed-precondition" || error.message?.includes("index")) {
          const simpleQuery = query(
            collection(db, "reservations"),
            where("clientId", "==", currentUser.uid)
          );
          const unsubSimple = onSnapshot(simpleQuery, (snap) => {
            const data = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setReservations(data);
            setLoadingReservations(false);
          });
          return unsubSimple;
        }
        setLoadingReservations(false);
        return undefined;
      }
    );

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  const filtered = useMemo(() => {
    let list = [...reservations];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.fieldName?.toLowerCase().includes(q) ||
          r.fieldAddress?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list;
  }, [reservations, searchTerm, statusFilter]);

  const counts = useMemo(
    () => ({
      total: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
    }),
    [reservations]
  );

  if (userProfile?.role !== "cliente") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SectionCard>
          <h2 className="text-2xl font-semibold font-heading text-slate-900 mb-2">
            Acceso restringido
          </h2>
          <p className="text-slate-600">Esta página está disponible solo para clientes.</p>
        </SectionCard>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        eyebrow="Cliente · Reservas"
        title="Mis reservaciones"
        subtitle="Gestiona y consulta el historial completo de tus reservas."
        actions={
          <Button variant="primary" size="md" onClick={() => navigate("/canchas")}>
            <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            Nueva reserva
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Ticket} color="primary" title="Total" value={counts.total} subtitle="Reservas históricas" />
        <StatCard icon={Hourglass} color="warning" title="Pendientes" value={counts.pending} subtitle="En espera" />
        <StatCard icon={CircleCheck} color="success" title="Confirmadas" value={counts.confirmed} subtitle="Listas" />
        <StatCard icon={XCircle} color="danger" title="Canceladas" value={counts.cancelled} subtitle="No realizadas" />
      </div>

      <SectionCard padding="p-4 sm:p-5" className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Buscar por cancha o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
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
      </SectionCard>

      {loadingReservations ? (
        <SectionCard>
          <p className="text-center text-slate-500 py-8">Cargando reservaciones...</p>
        </SectionCard>
      ) : filtered.length === 0 ? (
        <SectionCard padding="p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary mx-auto mb-4 flex items-center justify-center">
              <CalendarOff className="h-8 w-8" strokeWidth={2} aria-hidden />
            </div>
            <h3 className="text-xl font-semibold font-heading text-slate-900 mb-2">
              {reservations.length === 0
                ? "No tienes reservaciones aún"
                : "Sin resultados"}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {reservations.length === 0
                ? "¡Comienza a reservar canchas y aparecerán aquí!"
                : "Intenta ajustar los filtros."}
            </p>
            {reservations.length === 0 && (
              <Button variant="primary" size="md" onClick={() => navigate("/canchas")}>
                <Trophy className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Ver canchas disponibles
              </Button>
            )}
          </div>
        </SectionCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const st = STATUS[r.status] || { label: r.status, tone: "neutral" };
            return (
              <article
                key={r.id}
                className="rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30"
              >
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  <div className="lg:col-span-7 min-w-0">
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-secondary/15 flex items-center justify-center text-primary">
                        <Trophy className="h-6 w-6" strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold font-heading text-slate-900 truncate">
                          {r.fieldName || "Cancha"}
                        </h3>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                            <span className="truncate">{r.fieldAddress || "Sin dirección"}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                            {formatDate(r.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                            {r.startTime} – {r.endTime}
                          </span>
                          {r.totalPrice && (
                            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                              <Banknote className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />${r.totalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex items-center justify-start lg:justify-center gap-3">
                    <StatusPill tone={st.tone} size="md" dot>
                      {st.label}
                    </StatusPill>
                  </div>

                  <div className="lg:col-span-2 flex justify-start lg:justify-end">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setSelectedReservation(r);
                        setIsTicketModalOpen(true);
                      }}
                    >
                      <Ticket className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                      Ver ticket
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <TicketModal
        open={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        userProfile={userProfile}
      />

      <Footer />
    </DashboardLayout>
  );
}

export default Reservations;
