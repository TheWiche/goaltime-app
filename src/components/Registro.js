// Archivo: src/components/Registro.js

import React, { useState } from 'react'; // Importamos React y una función clave: useState
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Importamos nuestras configuraciones de firebase

// Definimos nuestro componente, que es básicamente una función que devuelve HTML
function Registro() {
  // --- ESTADO DEL COMPONENTE ---
  // Usamos useState para "recordar" lo que el usuario escribe en cada campo.
  // Es como tener una pequeña caja de memoria para cada input.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('cliente'); // Por defecto, el rol es 'cliente'

  // --- LÓGICA DEL FORMULARIO ---
  // Esta función se ejecutará cuando el usuario haga clic en el botón de "Registrarse".
  const handleRegistro = async (e) => {
    e.preventDefault(); // Esto previene que la página se recargue al enviar el formulario.

    // Validaciones básicas para asegurarnos de que los campos no estén vacíos.
    if (!email || !password || !nombre) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      // 1. Usamos la función de Firebase para crear el usuario en el sistema de Autenticación.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Si el paso 1 fue exitoso, creamos un documento en nuestra base de datos Firestore
      //    para guardar la información adicional del usuario, como su nombre y su rol.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: nombre,
        rol: 'cliente'
      });

      alert("¡Usuario registrado con éxito!");
      // Aquí podrías redirigir al usuario a otra página.

    } catch (error) {
      // Si algo sale mal (ej: el email ya está en uso), Firebase nos dará un error.
      console.error("Error al registrar: ", error);
      alert("Hubo un error al registrar. Revisa la consola para más detalles.");
    }
  };

  // --- APARIENCIA DEL COMPONENTE (HTML con JSX) ---
  // Esto es lo que se verá en la pantalla.
  return (
    <div>
      <h2>Formulario de Registro</h2>
      <form onSubmit={handleRegistro}>
        <input
          type="text"
          placeholder="Nombre Completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)} // Cada vez que escribes, actualiza la "caja" nombre
        />
        <br />
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Actualiza la "caja" email
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Actualiza la "caja" password
        />
        <br />
        <br /><br />
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Registro; // Exportamos el componente para poder usarlo en otras partes de la app.