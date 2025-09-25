// Archivo: src/components/dueño/PanelAsociado.js

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"; 
import { db } from '../../firebase'; // Subimos un nivel para encontrar firebase.js
import { useNotification } from '../../context/NotificationContext'; 

// Este componente recibe 'currentUser' como un "prop" desde App.js
function PanelAsociado({ currentUser }) {
  const { showNotification } = useNotification();

  // --- ESTADO DEL FORMULARIO ---
  const [nombreCancha, setNombreCancha] = useState('');
  const [direccion, setDireccion] = useState('');

  // --- LÓGICA DE ENVÍO ---
  const handleRegistroCancha = async (e) => {
    e.preventDefault();

    if (!nombreCancha || !direccion) {
      alert("Por favor, completa todos los campos de la cancha.");
      return;
    }

    try {
      // Usamos la función addDoc para crear un nuevo documento en la colección "canchas"
      await addDoc(collection(db, "canchas"), {
        ownerId: currentUser.uid, // Guardamos el ID del dueño que está registrando
        nombre: nombreCancha,
        direccion: direccion,
        estado: "pendiente", // El estado inicial siempre será "pendiente" de aprobación
        fechaCreacion: serverTimestamp() // Guarda la fecha y hora del servidor
      });

      if (currentUser.rol === 'cliente') {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          rol: "dueño"
        });
        showNotification('¡Felicidades! Tu rol ha sido actualizado a Asociado.', 'info');
      }
      
      showNotification('¡Cancha enviada para aprobación con éxito!', 'success'); 
      // Limpiamos los campos del formulario después del envío exitoso
      setNombreCancha('');
      setDireccion('');

    } catch (error) {
      console.error("Error al registrar el cancha: ", error);
      showNotification("Hubo un error al registrar tu cancha.", 'error'); 
    }
  };

  // --- APARIENCIA DEL PANEL ---
  return (
    <div style={{ border: '1px solid white', padding: '20px', marginTop: '20px' }}>
      <h3>Panel de Dueño de Cancha</h3>
      <p>Aquí puedes registrar tu cancha deportivo para que sea aprobado.</p>
      
      <form onSubmit={handleRegistroCancha}>
        <h4>Registrar Nuevo Cancha</h4>
        <input 
          type="text"
          placeholder="Nombre del Cancha"
          value={nombreCancha}
          onChange={(e) => setNombreCancha(e.target.value)}
        />
        <br />
        <input 
          type="text"
          placeholder="Dirección del Cancha"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        <br /><br />
        <button type="submit">Enviar para Aprobación</button>
      </form>

      {/* A futuro, aquí mostraremos la lista de canchas ya registrados por este dueño */}
    </div>
  );
}

export default PanelAsociado;