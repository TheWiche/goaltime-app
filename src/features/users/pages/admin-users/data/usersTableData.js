import { MDBox, MDTypography, MDAvatar, MDButton } from "shared/components/md-shims";
// src/layouts/admin-users/data/usersTableData.js

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "shared/services/firebaseService";
import useDebounce from "shared/hooks/useDebounce";

import { Pencil, CircleCheck, Ban } from "lucide-react";
import { StatusPill } from "shared/components/ui";

// 👇 CORRECCIÓN: Se añaden onEditRole y onToggleDisable a los parámetros
export default function useUsersTableData(searchTerm, roleFilter, onEditRole, onToggleDisable) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Validar que roleFilter sea válido
    if (
      !roleFilter ||
      (roleFilter !== "all" && !["admin", "asociado", "cliente"].includes(roleFilter))
    ) {
      console.warn("Filtro de rol inválido:", roleFilter);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let q;
    let unsubscribe;

    try {
      const normalizedSearchTerm = debouncedSearchTerm
        ? debouncedSearchTerm.charAt(0).toUpperCase() + debouncedSearchTerm.slice(1).toLowerCase()
        : "";

      // Construir la query de forma segura
      if (roleFilter !== "all") {
        // Para filtros específicos, no usar orderBy para evitar necesidad de índice compuesto
        // Ordenaremos en memoria después
        q = query(collection(db, "users"), where("role", "==", roleFilter));
      } else {
        // Solo para "all" usamos orderBy
        try {
          q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        } catch (orderByError) {
          // Si falla orderBy, usar query simple
          console.warn("Error con orderBy, usando query simple:", orderByError);
          q = query(collection(db, "users"));
        }
      }

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          try {
            let usersData = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || "",
                email: data.email || "",
                role: data.role || "",
                status: data.status || "active",
                createdAt: data.createdAt || null,
                ...data,
              };
            });

            // Ordenar por fecha de creación si no hay orderBy en la query
            if (roleFilter !== "all") {
              usersData.sort((a, b) => {
                const aTime = a.createdAt?.seconds || 0;
                const bTime = b.createdAt?.seconds || 0;
                return bTime - aTime; // Descendente
              });
            }

            if (normalizedSearchTerm) {
              const lowercasedFilter = normalizedSearchTerm.toLowerCase();
              // Validar que user.name y user.email existan antes de llamar a toLowerCase()
              usersData = usersData.filter((user) => {
                try {
                  const nameMatch =
                    user.name && typeof user.name === "string"
                      ? user.name.toLowerCase().includes(lowercasedFilter)
                      : false;
                  const emailMatch =
                    user.email && typeof user.email === "string"
                      ? user.email.toLowerCase().includes(lowercasedFilter)
                      : false;
                  return nameMatch || emailMatch;
                } catch (filterError) {
                  console.warn("Error al filtrar usuario:", filterError, user);
                  return false;
                }
              });
            }

            setUsers(usersData);
            setLoading(false);
            setError(null);
          } catch (processingError) {
            console.error("Error al procesar datos de usuarios:", processingError);
            setUsers([]);
            setLoading(false);
            setError("Error al procesar los datos. Por favor, intenta de nuevo.");
          }
        },
        (error) => {
          console.error("Error al obtener usuarios:", error);
          setUsers([]);
          setLoading(false);
          setError("Error al cargar los usuarios. Por favor, recarga la página.");

          // Si el error es por falta de índice, mostrar mensaje más específico
          if (error.code === "failed-precondition") {
            setError("Se requiere un índice en Firestore. Por favor, contacta al administrador.");
          }
        }
      );
    } catch (queryError) {
      console.error("Error al construir la query:", queryError);
      setUsers([]);
      setLoading(false);
      setError("Error al construir la consulta. Por favor, intenta de nuevo.");
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [debouncedSearchTerm, roleFilter]);

  const User = ({ name, email, photoURL }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={photoURL || ""} alt={name || "Usuario"} size="sm" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name || "Nombre no disponible"}
        </MDTypography>
        <MDTypography variant="caption">{email || "Email no disponible"}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const rows = users.map((user) => {
    let roleTone = "neutral";
    if (user.role === "admin") roleTone = "info";
    else if (user.role === "asociado") roleTone = "cta";

    const isDisabled = user.status === "disabled";
    const statusText = isDisabled ? "Deshabilitado" : "Activo";
    const statusTone = isDisabled ? "neutral" : "success";

    const getRoleText = (role) => {
      const roleMap = {
        admin: "Administrador",
        asociado: "Asociado",
        cliente: "Cliente",
      };
      return roleMap[role] || role || "N/A";
    };

    return {
      usuario: <User name={user.name} email={user.email} photoURL={user.photoURL} />,
      rol: (
        <div className="-ml-1 flex justify-center">
          <StatusPill tone={roleTone} size="sm" className="font-bold">
            {getRoleText(user.role)}
          </StatusPill>
        </div>
      ),
      estado: (
        <div className="-ml-1 flex justify-center">
          <StatusPill tone={statusTone} size="sm" className="font-bold">
            {statusText}
          </StatusPill>
        </div>
      ),
      fecha_creacion: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {user.createdAt?.seconds
            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </MDTypography>
      ),
      acciones: (
        <div className="flex flex-wrap justify-center gap-2">
          <MDButton
            variant="outlined"
            color="info"
            size="small"
            className="inline-flex items-center gap-1.5"
            onClick={() => {
              if (onEditRole) onEditRole(user);
            }}
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Editar Rol
          </MDButton>
          <MDButton
            variant="outlined"
            color={isDisabled ? "success" : "error"}
            size="small"
            className="inline-flex items-center gap-1.5"
            onClick={() => {
              if (onToggleDisable) onToggleDisable(user);
            }}
          >
            {isDisabled ? (
              <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            ) : (
              <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            )}
            {isDisabled ? "Habilitar" : "Deshabilitar"}
          </MDButton>
        </div>
      ),
    };
  });

  return {
    columns: [
      { Header: "usuario", accessor: "usuario", width: "35%", align: "left" },
      { Header: "rol", accessor: "rol", align: "center" },
      { Header: "estado", accessor: "estado", align: "center" },
      { Header: "fecha de creación", accessor: "fecha_creacion", align: "center" },
      { Header: "acciones", accessor: "acciones", align: "center" },
    ],
    rows,
    loading,
    error,
  };
}
