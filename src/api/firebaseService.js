import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, setDoc, addDoc, serverTimestamp, getDocs, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

//------------------------------------------------------------------------------------------------
/**
 * Registra un nuevo usuario en Authentication y crea su perfil en Firestore.
 * @param {string} nombre - El nombre completo del usuario.
 * @param {string} email - El correo para el nuevo usuario.
 * @param {string} password - La contraseña para el nuevo usuario.
 * @returns {Promise<UserCredential>} El objeto con las credenciales del nuevo usuario.
 */
export const registerUser = async (nombre, email, password) => {
  // 1. Crear el usuario en el sistema de autenticación de Firebase
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Crear el documento del usuario en la colección "users" de Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    nombre: nombre,
    rol: 'cliente' // Todos los nuevos usuarios se registran como clientes por defecto
  });

  return userCredential;
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param {string} email - El correo del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<UserCredential>} El objeto con las credenciales del usuario.
 */
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// --- FUNCIONES DE LISTENER (TIEMPO REAL) ---
/**
 * Escucha en tiempo real los cambios en la colección de usuarios.
 * @param {function} callback - Función que se ejecuta con la lista de usuarios.
 * @returns {function} Función para cancelar la suscripción del listener.
 */
export const listenToAllUsers = (callback) => {
  const q = query(collection(db, "users"));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
};
/**
 * Escucha en tiempo real las canchas con estado "pendiente".
 * @param {function} callback - Función que se ejecuta con la lista de canchas.
 * @returns {function} Función para cancelar la suscripción.
 */
export const listenToPendingCourts = (callback) => {
  const q = query(collection(db, "canchas"), where("estado", "==", "pendiente"));
  return onSnapshot(q, (snapshot) => {
    const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(courts);
  });
};
/**
 * Escucha en tiempo real las solicitudes de socio con estado "pendiente".
 * @param {function} callback - Función que se ejecuta con la lista de solicitudes.
 * @returns {function} Función para cancelar la suscripción.
 */
export const listenToPendingPartnerRequests = (callback) => {
  const q = query(collection(db, "solicitudesDeSocios"), where("estado", "==", "pendiente"));
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(requests);
  });
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
// --- FUNCIONES DE ACCIÓN (ESCRITURA) ---
/**
 * Aprueba una solicitud de socio, actualizando la solicitud y el rol del usuario.
 * @param {object} solicitud - El objeto completo de la solicitud.
 */
export const approvePartnerRequest = async (solicitud) => {
  const batch = writeBatch(db);
  const solicitudRef = doc(db, "solicitudesDeSocios", solicitud.id);
  batch.update(solicitudRef, { estado: "aprobada" });
  const userRef = doc(db, "users", solicitud.userId);
  batch.update(userRef, { rol: "asociado" });
  await batch.commit();
};
/**
 * Actualiza el estado de una solicitud de socio.
 * @param {string} solicitudId - El ID de la solicitud a actualizar.
 * @param {string} status - El nuevo estado ('rechazada').
 */
export const updatePartnerRequestStatus = (solicitudId, status) => {
  const solicitudRef = doc(db, "solicitudesDeSocios", solicitudId);
  return updateDoc(solicitudRef, { estado: status });
};
/**
 * Actualiza el estado de una cancha.
 * @param {string} canchaId - El ID de la cancha a actualizar.
 * @param {string} status - El nuevo estado ('aprobado' o 'rechazado').
 */
export const updateCourtStatus = (canchaId, status) => {
  const canchaRef = doc(db, "canchas", canchaId);
  return updateDoc(canchaRef, { estado: status });
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Registra una nueva cancha para un asociado, dejándola en estado pendiente.
 * @param {object} courtData - Objeto con los datos de la cancha { ownerId, nombre, direccion }.
 * @returns {Promise<DocumentReference>} La referencia al nuevo documento de la cancha.
 */
export const registerCourt = (courtData) => {
  return addDoc(collection(db, "canchas"), {
    ...courtData,
    estado: "pendiente",
    fechaCreacion: serverTimestamp()
  });
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Verifica si un usuario ya tiene una solicitud de socio pendiente.
 * @param {string} userId - El ID del usuario a verificar.
 * @returns {Promise<boolean>} Devuelve true si existe una solicitud pendiente, false si no.
 */
export const hasPendingPartnerRequest = async (userId) => {
  const q = query(collection(db, "solicitudesDeSocios"), where("userId", "==", userId), where("estado", "==", "pendiente"));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Crea una nueva solicitud de socio en la base de datos.
 * @param {object} requestData - Los datos de la solicitud { currentUser, formData }.
 */
export const createPartnerRequest = (requestData) => {
  const { currentUser, formData } = requestData;
  return addDoc(collection(db, "solicitudesDeSocios"), {
    userId: currentUser.uid,
    nombreUsuario: currentUser.nombre,
    email: currentUser.email,
    telefono: formData.telefono,
    nombreNegocio: formData.nombreNegocio,
    mensaje: formData.mensaje,
    estado: "pendiente",
    fechaCreacion: serverTimestamp()
  });
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Escucha en tiempo real las canchas con estado "aprobado".
 * @param {function} callback - Función que se ejecuta con la lista de canchas aprobadas.
 * @returns {function} Función para cancelar la suscripción del listener.
 */
export const listenToApprovedCourts = (callback) => {
  const q = query(collection(db, "canchas"), where("estado", "==", "aprobado"));
  
  return onSnapshot(q, (querySnapshot) => {
    const approvedCourts = [];
    querySnapshot.forEach((doc) => {
      approvedCourts.push({ id: doc.id, ...doc.data() });
    });
    callback(approvedCourts);
  });
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Cierra la sesión del usuario actual.
 */
export const logoutUser = () => {
  return signOut(auth);
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Obtiene todas las reservas para una cancha específica en una fecha determinada.
 * @param {string} canchaId - El ID de la cancha.
 * @param {string} fecha - La fecha en formato 'AAAA-MM-DD'.
 * @returns {Promise<Array>} Un array con las horas ya reservadas.
 */
export const getReservationsForCourtOnDate = async (canchaId, fecha) => {
  const reservations = [];
  const q = query(
    collection(db, "reservas"),
    where("canchaId", "==", canchaId),
    where("fecha", "==", fecha)
  );
  
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    reservations.push(doc.data().hora);
  });
  
  return reservations; // Ej: ["18:00", "20:00"]
};

/**
 * Crea un nuevo documento de reserva en la base de datos.
 * @param {object} reservationData - Los datos de la reserva.
 */
export const createReservation = (reservationData) => {
  return addDoc(collection(db, "reservas"), {
    ...reservationData,
    estado: "confirmada" // Estado por defecto
  });
};
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * Escucha los cambios de estado de autenticación y obtiene el perfil del usuario de Firestore.
 * @param {function} callback - Función que se ejecuta con el perfil del usuario (o null si no hay sesión).
 * @returns {function} Función para cancelar la suscripción del listener.
 */
export const onAuthAndProfileStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Si el usuario inicia sesión, buscamos su documento de perfil
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        // Devolvemos el perfil completo
        callback({ uid: user.uid, ...userDoc.data() });
      } else {
        // Caso raro: el usuario existe en Auth pero no en Firestore.
        callback(null);
      }
    } else {
      // Si el usuario cierra sesión, devolvemos null
      callback(null);
    }
  });
};
//------------------------------------------------------------------------------------------------