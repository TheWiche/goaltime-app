// Archivo: src/components/admin/PanelAdmin.js (versión completa y final)

import React from 'react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from '../../firebase';
import { useNotification } from '../../context/NotificationContext';
import { Typography, Box, Paper, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';

// El componente ahora solo recibe la vista activa como prop
function PanelAdmin({ activeView }) {
    const { showNotification } = useNotification();
    const [canchasPendientes, setCanchasPendientes] = useState([]);
    const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const qCanchas = query(collection(db, "canchas"), where("estado", "==", "pendiente"));
        const qSolicitudes = query(collection(db, "solicitudesDeSocios"), where("estado", "==", "pendiente"));
        const qUsuarios = query(collection(db, "users"));

        const unsubCanchas = onSnapshot(qCanchas, snapshot => setCanchasPendientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubSolicitudes = onSnapshot(qSolicitudes, snapshot => setSolicitudesPendientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        const unsubUsuarios = onSnapshot(qUsuarios, snapshot => {
            setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => { unsubCanchas(); unsubSolicitudes(); unsubUsuarios(); };
    }, []);
    
    // --- LÓGICA PARA APROBAR SOCIOS ---
    const handleAprobarSocio = async (solicitud) => {
        const batch = writeBatch(db);
        const solicitudRef = doc(db, "solicitudesDeSocios", solicitud.id);
        batch.update(solicitudRef, { estado: "aprobada" });
        const userRef = doc(db, "users", solicitud.userId);
        batch.update(userRef, { rol: "asociado" });

        try {
            await batch.commit();
            showNotification('Socio aprobado y rol actualizado con éxito.', 'success');
        } catch (error) {
            console.error("Error al aprobar socio: ", error);
            showNotification('Error al aprobar la solicitud.', 'error');
        }
    };

    const handleRechazarSocio = async (solicitudId) => {
        const solicitudRef = doc(db, "solicitudesDeSocios", solicitudId);
        try {
            await updateDoc(solicitudRef, { estado: "rechazada" });
            showNotification('La solicitud ha sido rechazada.', 'warning');
        } catch (error) {
            showNotification('Error al rechazar la solicitud.', 'error');
        }
    };
  
    // --- LÓGICA PARA APROBAR CANCHAS ---
    const handleAprobarCancha = async (canchaId) => {
        const canchaRef = doc(db, "canchas", canchaId);
        try {
            await updateDoc(canchaRef, { estado: "aprobado" });
            showNotification("Cancha aprobada con éxito.", 'success');
        } catch (error) {
            showNotification('Error al aprobar la cancha.', 'error');
        }
    };

    const handleRechazarCancha = async (canchaId) => {
        const canchaRef = doc(db, "canchas", canchaId);
        try {
            await updateDoc(canchaRef, { estado: "rechazado" });
            showNotification("La cancha ha sido rechazada.", 'warning');
        } catch (error) {
            showNotification('Error al rechazar la cancha.', 'error');
        }
    };

    if (loading) return <CircularProgress />;

    // Basado en la 'activeView' que recibe, muestra una cosa u otra
    switch (activeView) {
        case 'dashboard':
            return (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Total de Usuarios</Typography>
                            <Typography variant="h3">{usuarios.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.dark' }}>
                            <Typography variant="h6">Solicitudes de Socios</Typography>
                            <Typography variant="h3">{solicitudesPendientes.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'info.dark' }}>
                            <Typography variant="h6">Canchas por Aprobar</Typography>
                            <Typography variant="h3">{canchasPendientes.length}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            );
        case 'usuarios':
            return (
                <Paper>
                    <Typography variant="h5" sx={{ p: 2 }}>Lista de Usuarios Registrados</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Rol</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.nombre}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.rol.toUpperCase()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            );
        case 'solicitudes':
             return (
                <Box>
                    <Typography variant="h5" gutterBottom>Solicitudes de Nuevos Asociados</Typography>
                    {solicitudesPendientes.length > 0 ? (
                        solicitudesPendientes.map(solicitud => (
                            <Paper key={solicitud.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography><strong>Usuario:</strong> {solicitud.nombreUsuario} ({solicitud.email})</Typography>
                                <Typography><strong>Negocio:</strong> {solicitud.nombreNegocio}</Typography>
                                <Typography><strong>Teléfono:</strong> {solicitud.telefono}</Typography>
                                <Box mt={1}>
                                    <Button variant="contained" onClick={() => handleAprobarSocio(solicitud)} sx={{ mr: 1 }}>Aprobar Socio</Button>
                                    <Button variant="outlined" color="error" onClick={() => handleRechazarSocio(solicitud.id)}>Rechazar</Button>
                                </Box>
                            </Paper>
                        ))
                    ) : (
                        <Typography>No hay nuevas solicitudes de socios.</Typography>
                    )}
                </Box>
            );
        case 'canchas':
            return (
                <Box>
                    <Typography variant="h5" gutterBottom>Canchas Pendientes de Aprobación</Typography>
                    {canchasPendientes.length > 0 ? (
                        canchasPendientes.map(cancha => (
                            <Paper key={cancha.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography><strong>Nombre:</strong> {cancha.nombre}</Typography>
                                <Typography><strong>Dirección:</strong> {cancha.direccion}</Typography>
                                <Typography variant="caption"><strong>ID Dueño:</strong> {cancha.ownerId}</Typography>
                                <Box mt={1}>
                                    <Button variant="contained" onClick={() => handleAprobarCancha(cancha.id)} sx={{ mr: 1 }}>Aprobar Cancha</Button>
                                    <Button variant="outlined" color="error" onClick={() => handleRechazarCancha(cancha.id)}>Rechazar</Button>
                                </Box>
                            </Paper>
                        ))
                    ) : (
                        <Typography>No hay canchas pendientes de aprobación.</Typography>
                    )}
                </Box>
            );
        default:
            return <Typography>Selecciona una opción del menú.</Typography>;
    }
}

export default PanelAdmin;