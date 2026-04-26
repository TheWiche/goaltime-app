import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp as firestoreServerTimestamp,
} from "firebase/firestore";
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
  Modal,
  Toast,
  SelectField,
  Textarea,
} from "shared/components/ui";
import {
  Search,
  Eye,
  Pencil,
  Check,
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Banknote,
  Trophy,
  CalendarOff,
  Hourglass,
  CircleCheck,
  XCircle,
  Save,
} from "lucide-react";
import {
  db,
  notifyReservationConfirmed,
  notifyReservationCancelled,
  checkReservationConflict,
  updateReservationStatus,
  sendReservationStatusChangeEmail,
} from "shared/services/firebaseService";
import { useAuth } from "shared/context/AuthContext";
import ConfirmationDialog from "features/users/pages/admin-users/components/ConfirmationDialog";

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
  const d = value.seconds
    ? new Date(value.seconds * 1000)
    : value.toDate
    ? value.toDate()
    : new Date(value);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function AssociateReservations() {
  const { userProfile, currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientsMap, setClientsMap] = useState({});

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);

  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== "asociado") {
      setLoading(false);
      return undefined;
    }
    setLoading(true);

    const fieldsQuery = query(
      collection(db, "canchas"),
      where("ownerId", "==", currentUser.uid)
    );

    let unsubReservations = null;
    const unsubFields = onSnapshot(fieldsQuery, (fieldsSnap) => {
      const fieldIds = fieldsSnap.docs.map((d) => d.id);
      if (unsubReservations) unsubReservations();
      if (fieldIds.length === 0) {
        setReservations([]);
        setLoading(false);
        return;
      }
      const reservationsQuery = query(
        collection(db, "reservations"),
        orderBy("createdAt", "desc")
      );
      unsubReservations = onSnapshot(
        reservationsQuery,
        (snap) => {
          const data = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((r) => fieldIds.includes(r.fieldId));
          setReservations(data);
          setLoading(false);

          const uniqueClientIds = [
            ...new Set(data.map((r) => r.clientId).filter(Boolean)),
          ];
          const toFetch = uniqueClientIds.filter(
            (id) =>
              !clientsMap[id] && !data.find((r) => r.clientId === id)?.clientName
          );
          if (toFetch.length > 0) {
            (async () => {
              const results = await Promise.all(
                toFetch.map(async (id) => {
                  try {
                    const cd = await getDoc(doc(db, "users", id));
                    return { id, name: cd.exists() ? cd.data().name || "Cliente" : "Cliente" };
                  } catch {
                    return { id, name: "Cliente" };
                  }
                })
              );
              setClientsMap((prev) => {
                const next = { ...prev };
                results.forEach((c) => {
                  next[c.id] = c.name;
                });
                return next;
              });
            })();
          }
        },
        () => {
          setReservations([]);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubFields();
      if (unsubReservations) unsubReservations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userProfile]);

  const filtered = useMemo(() => {
    let list = [...reservations];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.fieldName?.toLowerCase().includes(q) ||
          r.fieldAddress?.toLowerCase().includes(q) ||
          r.clientName?.toLowerCase().includes(q)
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

  const handleApprove = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction("approve");
    setIsConfirmOpen(true);
  };

  const handleReject = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction("reject");
    setIsConfirmOpen(true);
  };

  const handleViewDetails = async (reservation) => {
    setSelectedReservation(reservation);
    setLoadingClientInfo(true);
    setIsDetailsModalOpen(true);
    try {
      if (reservation.clientId) {
        const cd = await getDoc(doc(db, "users", reservation.clientId));
        if (cd.exists()) setClientInfo(cd.data());
      }
    } finally {
      setLoadingClientInfo(false);
    }
  };

  const confirmActionHandler = async () => {
    if (!selectedReservation) return;
    setIsConfirmOpen(false);
    setLoadingAction(true);
    try {
      if (confirmAction === "approve") {
        const conflictCheck = await checkReservationConflict(
          selectedReservation.fieldId,
          selectedReservation.date,
          selectedReservation.startTime,
          selectedReservation.endTime,
          selectedReservation.id
        );
        if (conflictCheck.hasConflict) {
          setToast({
            open: true,
            type: "error",
            message: `No se puede aprobar. El horario ya está ocupado por ${conflictCheck.conflictingReservation.clientName}.`,
          });
          setLoadingAction(false);
          return;
        }
      }

      const reservationRef = doc(db, "reservations", selectedReservation.id);
      const status = confirmAction === "approve" ? "confirmed" : "cancelled";
      await updateDoc(reservationRef, {
        status,
        updatedAt: firestoreServerTimestamp(),
        reviewedAt: firestoreServerTimestamp(),
        reviewedBy: currentUser.uid,
      });

      try {
        if (confirmAction === "approve") {
          await notifyReservationConfirmed(
            selectedReservation.id,
            selectedReservation.fieldName || "la cancha",
            selectedReservation.clientId
          );
        } else {
          await notifyReservationCancelled(
            selectedReservation.id,
            selectedReservation.fieldName || "la cancha",
            selectedReservation.clientId
          );
        }
      } catch {
        /* notifications non-critical */
      }

      setToast({
        open: true,
        type: "success",
        message: `Reserva ${confirmAction === "approve" ? "confirmada" : "rechazada"} exitosamente.`,
      });
      setSelectedReservation(null);
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        message: error.message || "Error al procesar la reserva.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!selectedReservation || !newStatus) return;
    if (selectedReservation.status === newStatus) {
      setToast({ open: true, type: "warning", message: "La reserva ya está en ese estado." });
      return;
    }

    setChangingStatus(true);
    try {
      await updateReservationStatus(
        selectedReservation.id,
        newStatus,
        statusChangeReason,
        currentUser.uid
      );

      let clientEmail = "";
      let clientName = selectedReservation.clientName || "Cliente";
      try {
        if (selectedReservation.clientId) {
          const cd = await getDoc(doc(db, "users", selectedReservation.clientId));
          if (cd.exists()) {
            clientEmail = cd.data().email || "";
            clientName = cd.data().name || clientName;
          }
        }
      } catch {
        /* ignore */
      }

      try {
        if (newStatus === "confirmed") {
          await notifyReservationConfirmed(
            selectedReservation.id,
            selectedReservation.fieldName || "la cancha",
            selectedReservation.clientId
          );
        } else if (newStatus === "cancelled") {
          await notifyReservationCancelled(
            selectedReservation.id,
            selectedReservation.fieldName || "la cancha",
            selectedReservation.clientId
          );
        }
      } catch {
        /* ignore */
      }

      if (clientEmail) {
        try {
          await sendReservationStatusChangeEmail(
            { ...selectedReservation, previousStatus: selectedReservation.status },
            newStatus,
            statusChangeReason,
            clientEmail,
            clientName
          );
        } catch (emailError) {
          setToast({
            open: true,
            type: "warning",
            message: `Estado actualizado, pero no se pudo enviar el correo: ${emailError.message}`,
          });
        }
      }

      setToast({
        open: true,
        type: "success",
        message: `Estado actualizado a "${STATUS[newStatus]?.label || newStatus}".`,
      });

      setIsChangeStatusModalOpen(false);
      setNewStatus("");
      setStatusChangeReason("");
      setSelectedReservation(null);
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        message: error.message || "Error al cambiar el estado.",
      });
    } finally {
      setChangingStatus(false);
    }
  };

  if (userProfile?.role !== "asociado") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SectionCard>
          <h2 className="text-2xl font-semibold font-heading text-rose-600 mb-2">
            Acceso denegado
          </h2>
          <p className="text-slate-600">Solo los asociados pueden acceder a esta página.</p>
        </SectionCard>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        eyebrow="Asociado · Reservas"
        title="Gestión de reservas"
        subtitle="Aprueba, rechaza o cambia el estado de las reservas de tus canchas."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Calendar} color="primary" title="Total" value={counts.total} subtitle="Reservas" />
        <StatCard icon={Hourglass} color="warning" title="Pendientes" value={counts.pending} subtitle="Por revisar" />
        <StatCard icon={CircleCheck} color="success" title="Confirmadas" value={counts.confirmed} subtitle="Activas" />
        <StatCard icon={XCircle} color="danger" title="Canceladas" value={counts.cancelled} subtitle="Inactivas" />
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
              placeholder="Buscar por cancha, cliente o dirección..."
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

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Cargando reservas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary mx-auto mb-3 flex items-center justify-center">
              <CalendarOff className="h-7 w-7" strokeWidth={2} aria-hidden />
            </div>
            <p className="text-base font-semibold font-heading text-slate-900">
              {reservations.length === 0 ? "Aún no tienes reservas" : "Sin resultados"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {reservations.length === 0
                ? "Cuando los clientes reserven tus canchas aparecerán aquí."
                : "Intenta ajustar los filtros."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                  <th className="text-left font-semibold px-5 py-3">Cancha</th>
                  <th className="text-left font-semibold px-5 py-3 hidden md:table-cell">
                    Cliente
                  </th>
                  <th className="text-left font-semibold px-5 py-3 hidden lg:table-cell">
                    Fecha
                  </th>
                  <th className="text-left font-semibold px-5 py-3 hidden lg:table-cell">
                    Hora
                  </th>
                  <th className="text-right font-semibold px-5 py-3 hidden xl:table-cell">
                    Total
                  </th>
                  <th className="text-left font-semibold px-5 py-3">Estado</th>
                  <th className="text-right font-semibold px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const st = STATUS[r.status] || { label: r.status, tone: "neutral" };
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-50 to-secondary/10 flex items-center justify-center text-primary">
                            <Trophy className="h-5 w-5" strokeWidth={2} aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {r.fieldName || "Sin nombre"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {r.fieldAddress || "Sin dirección"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 hidden md:table-cell">
                        {r.clientName || clientsMap[r.clientId] || "Cliente"}
                      </td>
                      <td className="px-5 py-4 text-slate-600 hidden lg:table-cell">
                        {formatDate(r.date)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 hidden lg:table-cell">
                        {r.startTime} – {r.endTime}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-emerald-600 hidden xl:table-cell">
                        ${r.totalPrice?.toLocaleString() || 0}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill tone={st.tone} size="sm">
                          {st.label}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(r)}
                          >
                            <Eye className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                            Ver
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={changingStatus}
                            onClick={() => {
                              setSelectedReservation(r);
                              setNewStatus("");
                              setStatusChangeReason("");
                              setIsChangeStatusModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                            Estado
                          </Button>
                          {r.status === "pending" && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={loadingAction}
                                onClick={() => handleApprove(r)}
                              >
                                <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                Aprobar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={loadingAction}
                                onClick={() => handleReject(r)}
                              >
                                <X className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                                Rechazar
                              </Button>
                            </>
                          )}
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

      {/* Modal de detalles */}
      <Modal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setClientInfo(null);
        }}
        size="2xl"
        variant="hero"
        eyebrow="Asociado · Reservas"
        title="Detalles de la reserva"
        subtitle={selectedReservation?.fieldName || ""}
        icon={<Calendar className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />}
        footer={
          selectedReservation?.status === "pending" ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="danger"
                disabled={loadingAction}
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleReject(selectedReservation);
                }}
              >
                <X className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Rechazar
              </Button>
              <Button
                variant="primary"
                disabled={loadingAction}
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleApprove(selectedReservation);
                }}
              >
                <Check className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                Aprobar
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setIsDetailsModalOpen(false)}>
              Cerrar
            </Button>
          )
        }
      >
        {selectedReservation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              eyebrow="Cliente"
              title="Información"
              icon={<User className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              {loadingClientInfo ? (
                <p className="text-sm text-slate-500">Cargando...</p>
              ) : (
                <div className="space-y-3">
                  <DetailRow
                    icon={<User className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                    label="Nombre"
                    value={clientInfo?.name || selectedReservation.clientName || "—"}
                  />
                  <DetailRow
                    icon={<Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                    label="Correo"
                    value={clientInfo?.email || "—"}
                  />
                </div>
              )}
            </SectionCard>

            <SectionCard
              eyebrow="Reserva"
              title="Detalles"
              icon={<Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />}
            >
              <div className="space-y-3">
                <DetailRow
                  icon={<Trophy className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Cancha"
                  value={selectedReservation.fieldName || "—"}
                />
                <DetailRow
                  icon={<MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Dirección"
                  value={selectedReservation.fieldAddress || "—"}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Fecha"
                  value={formatDate(selectedReservation.date)}
                />
                <DetailRow
                  icon={<Clock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Horario"
                  value={`${selectedReservation.startTime} – ${selectedReservation.endTime}`}
                />
                <DetailRow
                  icon={<Banknote className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
                  label="Total"
                  value={
                    <span className="font-semibold text-emerald-600">
                      ${selectedReservation.totalPrice?.toLocaleString() || 0}
                    </span>
                  }
                />
              </div>
            </SectionCard>

            <div className="md:col-span-2 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Estado actual</span>
              <StatusPill tone={STATUS[selectedReservation.status]?.tone || "neutral"} size="md">
                {STATUS[selectedReservation.status]?.label || selectedReservation.status}
              </StatusPill>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal cambiar estado */}
      <Modal
        open={isChangeStatusModalOpen}
        onClose={() => {
          if (!changingStatus) {
            setIsChangeStatusModalOpen(false);
            setNewStatus("");
            setStatusChangeReason("");
            setSelectedReservation(null);
          }
        }}
        size="lg"
        eyebrow="Asociado · Reservas"
        title="Cambiar estado de reserva"
        subtitle="El cliente recibirá un correo con la actualización."
        icon={<Pencil className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={changingStatus}
              onClick={() => {
                setIsChangeStatusModalOpen(false);
                setNewStatus("");
                setStatusChangeReason("");
                setSelectedReservation(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={
                !newStatus ||
                !statusChangeReason ||
                changingStatus ||
                selectedReservation?.status === newStatus
              }
              onClick={handleStatusSubmit}
            >
              <Save className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
              {changingStatus ? "Guardando..." : "Guardar cambio"}
            </Button>
          </>
        }
      >
        {selectedReservation && (
          <div className="space-y-4">
            <SectionCard padding="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Cancha</p>
                  <p className="font-semibold text-slate-900">{selectedReservation.fieldName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Cliente</p>
                  <p className="font-semibold text-slate-900">
                    {selectedReservation.clientName ||
                      clientsMap[selectedReservation.clientId] ||
                      "Cliente"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Fecha</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(selectedReservation.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Hora</p>
                  <p className="font-semibold text-slate-900">
                    {selectedReservation.startTime} – {selectedReservation.endTime}
                  </p>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.1em] text-slate-500">
                    Estado actual
                  </span>
                  <StatusPill
                    tone={STATUS[selectedReservation.status]?.tone || "neutral"}
                    size="sm"
                  >
                    {STATUS[selectedReservation.status]?.label || selectedReservation.status}
                  </StatusPill>
                </div>
              </div>
            </SectionCard>

            <SelectField
              label="Nuevo estado"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              disabled={changingStatus}
            >
              <option value="">Selecciona un estado</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
              <option value="completed">Completada</option>
            </SelectField>

            <Textarea
              label="Razón del cambio"
              value={statusChangeReason}
              onChange={(e) => setStatusChangeReason(e.target.value)}
              rows={4}
              placeholder="Ej: Cliente solicitó cancelación por motivos personales..."
              hint="Esta información se enviará al cliente por correo."
              disabled={changingStatus}
              required
            />
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedReservation(null);
        }}
        onConfirm={confirmActionHandler}
        title={`Confirmar ${confirmAction === "approve" ? "aprobación" : "rechazo"}`}
        message={`¿Estás seguro de que quieres ${
          confirmAction === "approve" ? "aprobar" : "rechazar"
        } la reserva para "${selectedReservation?.fieldName || ""}"?`}
        confirmColor={confirmAction === "approve" ? "success" : "error"}
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

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-words">{value}</p>
      </div>
    </div>
  );
}

DetailRow.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default AssociateReservations;
