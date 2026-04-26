import { MDBox, MDTypography, MDButton } from "shared/components/md-shims";
// src/layouts/admin-fields/data/pendingFieldsTableData.js

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import useDebounce from "shared/hooks/useDebounce";

import { Check, X } from "lucide-react";
import { StatusPill } from "shared/components/ui";

export default function usePendingFieldsTableData(searchTerm, statusFilter, onApprove, onReject) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Validar que statusFilter sea válido
    if (
      !statusFilter ||
      (statusFilter !== "all" &&
        !["pending", "approved", "rejected", "disabled"].includes(statusFilter))
    ) {
      console.warn("Filtro de estado inválido:", statusFilter);
      setFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let q;
    let unsubscribe;

    try {
      // Construir la query de forma segura
      if (statusFilter !== "all") {
        // Para filtros específicos, no usar orderBy para evitar necesidad de índice compuesto
        // Ordenaremos en memoria después
        q = query(collection(db, "canchas"), where("status", "==", statusFilter));
      } else {
        // Solo para "all" intentamos usar orderBy
        try {
          q = query(collection(db, "canchas"), orderBy("createdAt", "desc"));
        } catch (orderByError) {
          // Si falla orderBy, usar query simple
          console.warn("Error con orderBy, usando query simple:", orderByError);
          q = query(collection(db, "canchas"));
        }
      }

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          try {
            let fieldsData = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "",
                address: data.address || "",
                status: data.status || "pending",
                pricePerHour: data.pricePerHour || 0,
                createdAt: data.createdAt || null,
                ...data,
              };
            });

            // Ordenar por fecha de creación si no hay orderBy en la query
            if (statusFilter !== "all") {
              fieldsData.sort((a, b) => {
                const aTime = a.createdAt?.seconds || 0;
                const bTime = b.createdAt?.seconds || 0;
                return bTime - aTime; // Descendente
              });
            }

            if (debouncedSearchTerm) {
              const lowercasedFilter = debouncedSearchTerm.toLowerCase();
              fieldsData = fieldsData.filter((field) => {
                try {
                  const nameMatch =
                    field.name && typeof field.name === "string"
                      ? field.name.toLowerCase().includes(lowercasedFilter)
                      : false;
                  const addressMatch =
                    field.address && typeof field.address === "string"
                      ? field.address.toLowerCase().includes(lowercasedFilter)
                      : false;
                  return nameMatch || addressMatch;
                } catch (filterError) {
                  console.warn("Error al filtrar cancha:", filterError, field);
                  return false;
                }
              });
            }

            setFields(fieldsData);
            setLoading(false);
            setError(null);
          } catch (processingError) {
            console.error("Error al procesar datos de canchas:", processingError);
            setFields([]);
            setLoading(false);
            setError("Error al procesar los datos. Por favor, intenta de nuevo.");
          }
        },
        (error) => {
          console.error("Error al obtener canchas:", error);
          setFields([]);
          setLoading(false);
          setError("Error al cargar las canchas. Por favor, recarga la página.");

          // Si el error es por falta de índice, mostrar mensaje más específico
          if (error.code === "failed-precondition") {
            setError("Se requiere un índice en Firestore. Por favor, contacta al administrador.");
          }
        }
      );
    } catch (queryError) {
      console.error("Error al construir la query:", queryError);
      setFields([]);
      setLoading(false);
      setError("Error al construir la consulta. Por favor, intenta de nuevo.");
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [debouncedSearchTerm, statusFilter]);

  const getStatusTone = (status) => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "danger";
    if (status === "disabled") return "neutral";
    return "neutral";
  };

  const getStatusText = (status) => {
    const statusMap = {
      approved: "Aprobada",
      pending: "Pendiente",
      rejected: "Rechazada",
      disabled: "Deshabilitada",
    };
    return statusMap[status] || status;
  };

  const rows = fields.map((field) => {
    return {
      nombre: (
        <MDTypography variant="button" fontWeight="medium">
          {field.name || "Sin nombre"}
        </MDTypography>
      ),
      direccion: (
        <MDTypography variant="caption" color="text">
          {field.address || "Sin dirección"}
        </MDTypography>
      ),
      precio: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          ${field.pricePerHour || "0"} / hora
        </MDTypography>
      ),
      estado: (
        <div className="-ml-1 flex justify-center">
          <StatusPill tone={getStatusTone(field.status)} size="sm" className="font-bold">
            {getStatusText(field.status)}
          </StatusPill>
        </div>
      ),
      fecha_creacion: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {field.createdAt?.seconds
            ? new Date(field.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </MDTypography>
      ),
      acciones: (
        <div className="flex flex-wrap justify-center gap-2">
          {field.status === "pending" && (
            <>
              <MDButton
                variant="contained"
                color="success"
                size="small"
                className="inline-flex items-center gap-1.5 !bg-emerald-600 !text-white hover:!bg-emerald-700"
                onClick={() => onApprove(field)}
              >
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                Aprobar
              </MDButton>
              <MDButton
                variant="contained"
                color="error"
                size="small"
                className="inline-flex items-center gap-1.5 !bg-rose-600 !text-white hover:!bg-rose-700"
                onClick={() => onReject(field)}
              >
                <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                Rechazar
              </MDButton>
            </>
          )}
        </div>
      ),
    };
  });

  return {
    columns: [
      { Header: "nombre", accessor: "nombre", width: "20%", align: "left" },
      { Header: "dirección", accessor: "direccion", width: "25%", align: "left" },
      { Header: "precio/hora", accessor: "precio", align: "center" },
      { Header: "estado", accessor: "estado", align: "center" },
      { Header: "fecha de creación", accessor: "fecha_creacion", align: "center" },
      { Header: "acciones", accessor: "acciones", align: "center" },
    ],
    rows,
    loading,
    error,
  };
}
