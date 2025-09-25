// Archivo: src/components/admin/PanelAdmin.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase';
import { useNotification } from '../../context/NotificationContext'; 

function PanelAdmin() {
  const { showNotification } = useNotification();
  // --- ESTADO ---
  // Guardaremos la lista de canchas pendientes en un array.
  const [canchasPendientes, setCanchasPendientes] = useState([]);
  
  // --- EFECTO PARA ESCUCHAR CAMBIOS EN TIEMPO REAL ---
  useEffect(() => {
    // 1. Creamos una consulta a la colección 'canchas' pidiendo solo
    //    aquellas cuyo 'estado' sea exactamente 'pendiente'.
    const q = query(collection(db, "canchas"), where("estado", "==", "pendiente"));

    // 2. onSnapshot es un oyente en tiempo real. Se ejecuta una vez al cargar
    //    y luego cada vez que los resultados de la consulta cambian.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const canchas = [];
      querySnapshot.forEach((doc) => {
        canchas.push({ id: doc.id, ...doc.data() });
      });
      // 3. Actualizamos nuestro estado con la lista de canchas obtenida.
      setCanchasPendientes(canchas);
    });

    // 4. Limpiamos el oyente cuando el componente se desmonta.
    return () => unsubscribe();
  }, []); // El array vacío asegura que esto se configure solo una vez.

  // --- LÓGICA DE ACCIONES ---
  const handleAprobar = async (canchaId) => {
    const canchaRef = doc(db, "canchas", canchaId);
    try {
      await updateDoc(canchaRef, {
        estado: "aprobado"
      });
      showNotification("Cancha aprobada con éxito.", 'success'); 
    } catch (error) {
      console.error("Error al aprobar: ", error);
    }
  };

  const handleRechazar = async (canchaId) => {
    const canchaRef = doc(db, "canchas", canchaId);
    try {
      // Podríamos también borrar el documento, pero cambiar el estado es más seguro.
      await updateDoc(canchaRef, {
        estado: "rechazado"
      });
      showNotification("La cancha ha sido rechazada.", 'warning'); 
    } catch (error) {
      console.error("Error al rechazar: ", error);
    }
  };

  // --- APARIENCIA DEL PANEL ---
  return (
    <div style={{ border: '1px solid white', padding: '20px', marginTop: '20px' }}>
      <h3>Panel de Administrador</h3>
      <h4>Canchas Pendientes de Aprobación</h4>
      
      {canchasPendientes.length > 0 ? (
        canchasPendientes.map(cancha => (
          <div key={cancha.id} style={{ border: '1px solid grey', padding: '10px', margin: '10px' }}>
            <p><strong>Nombre:</strong> {cancha.nombre}</p>
            <p><strong>Dirección:</strong> {cancha.direccion}</p>
            <p><strong>ID Dueño:</strong> {cancha.ownerId}</p>
            <button onClick={() => handleAprobar(cancha.id)} style={{marginRight: '10px'}}>Aprobar</button>
            <button onClick={() => handleRechazar(cancha.id)}>Rechazar</button>
          </div>
        ))
      ) : (
        <p>No hay canchas pendientes de aprobación en este momento.</p>
      )}
    </div>
  );
}

export default PanelAdmin;