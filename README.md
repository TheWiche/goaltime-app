# 🏟️ GoalTime

**GoalTime** es una aplicación web diseñada para facilitar la **reserva de canchas sintéticas** de manera rápida, sencilla y confiable.  
El objetivo es conectar a los jugadores con los escenarios deportivos, optimizando la experiencia de agendar partidos y gestionando horarios disponibles.

Este proyecto fue creado con [Create React App](https://github.com/facebook/create-react-app).

---

## 🚀 Características principales

- 📅 Reserva de canchas en línea en tiempo real.  
- ⏰ Gestión de horarios disponibles.   
- ✅ Integración con Google Maps para ubicar canchas cercanas.  
- 📱 Interfaz moderna, responsive y fácil de usar.  


---

## 🛠️ Tecnologías utilizadas

- ⚛️ **React** – Frontend principal.  
- 🔥 **Firebase** – Hosting, autenticación y base de datos.  
- 🎨 **Material-UI (MUI)** – Estilos rápidos y personalizables.  

---

## 🚀 Cómo Empezar

Sigue estas instrucciones para obtener una copia del proyecto y ejecutarla en tu máquina local para desarrollo y pruebas.

### ✅ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

* **Node.js** (versión LTS recomendada). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
* **Firebase CLI** (Command Line Interface). Si no lo tienes, instálalo globalmente abriendo una terminal y ejecutando:
    ```sh
    npm install -g firebase-tools
    ```

---

### 📋 Guía de Instalación

Sigue estos pasos para poner en marcha el proyecto:

1.  **Clona el Repositorio**
    Abre tu terminal, navega a la carpeta donde quieres guardar el proyecto y ejecuta:
    ```sh
    git clone https://github.com/TheWiche/goaltime-app.git
    ```
    
2.  **Navega al Directorio del Proyecto**
    ```sh
    cd goaltime-app
    ```

3.  **Instala las Dependencias**
    Este comando leerá el archivo `package.json` y descargará todas las librerías necesarias para que el proyecto funcione (React, Material-UI, Firebase, etc.).
    ```sh
    npm install
    ```

4.  **Configura tus Variables de Entorno (¡Paso Crucial!)**
    Por seguridad, las credenciales del proyecto no se guardan en el repositorio. Debes crearlas localmente.

    * En la **carpeta raíz de tu proyecto** (al mismo nivel que `package.json`), crea un nuevo archivo llamado `.env`.
    * Abre el archivo `.env` y pega las credenciasles (Dichas credenciales debes pedirselas al propietario).

5.  **Ejecuta la Aplicación**
    Una vez instaladas las dependencias y configurado el archivo `.env`, inicia el servidor de desarrollo local. **Es muy importante reiniciar el servidor si ya estaba corriendo para que cargue las nuevas variables de entorno.**
    ```sh
    npm start
    ```
    La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`.

---

## 🔧 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

* `npm start`: Inicia la app en modo de desarrollo.
* `npm run build`: Compila la app para producción en la carpeta `build`.
* `npm test`: Ejecuta el lanzador de pruebas (si está configurado).

---

## 📖 Aprende más

- Documentación oficial de [Create React App](https://facebook.github.io/create-react-app/docs/getting-started)  
- Documentación oficial de [React](https://reactjs.org/)  

---

## ✨ Futuras mejoras

- ✅ Pasarela de pagos para reservar en línea.  
- ✅ Sistema de notificaciones push.  
- ✅ Posibilidad de crear equipos y compartir partidos. 
- ✅ Búsqueda por ubicación.  

---

## 👨‍💻 Autor

**Nelson Cotes**  
Estudiante de Ingeniería de Sistemas – Universidad de La Guajira.  
Apasionado por el desarrollo de soluciones innovadoras que mejoren la vida de las personas.  

---

📌 *GoalTime – Porque jugar nunca fue tan fácil.*
