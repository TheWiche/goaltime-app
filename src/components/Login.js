// Archivo: src/components/Login.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Importamos solo 'auth' porque no guardaremos datos aquí

function Login() {
  // --- ESTADO DEL COMPONENTE ---
  // Creamos "cajas de memoria" para el email y la contraseña que el usuario escriba.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- LÓGICA DEL FORMULARIO ---
  // Esta función se ejecutará al hacer clic en "Iniciar Sesión".
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevenimos que la página se recargue.

    if (!email || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
      // Usamos la función de Firebase para iniciar sesión con las credenciales proporcionadas.
      await signInWithEmailAndPassword(auth, email, password);
      
      alert("¡Has iniciado sesión con éxito!");
      // En un futuro, aquí es donde redirigiríamos al usuario a su panel principal.

    } catch (error) {
      // Si las credenciales son incorrectas o el usuario no existe, Firebase nos dará un error.
      console.error("Error al iniciar sesión: ", error);
      alert("Credenciales incorrectas. Por favor, verifica tu correo y contraseña.");
    }
  };

  // --- APARIENCIA DEL COMPONENTE (HTML con JSX) ---
  return (
    <div>
      <h2>Formulario de Inicio de Sesión</h2>
      <form onSubmit={handleLogin}>
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
        <br /><br />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login; // Exportamos el componente.