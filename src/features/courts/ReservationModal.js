import React, { useState, useEffect } from 'react';
import { getReservationsForCourtOnDate, createReservation } from '../../api/firebaseService';
import { useNotification } from '../../context/NotificationContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, TextField } from '@mui/material';

// Generamos los horarios disponibles (ej: de 8 AM a 10 PM)
const timeSlots = Array.from({ length: 15 }, (_, i) => `${8 + i}:00`);

function ReservationModal({ open, onClose, court, currentUser }) {
    const { showNotification } = useNotification();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);

    // Este efecto se ejecuta cada vez que cambia la fecha o la cancha seleccionada
    useEffect(() => {
        if (open && court && selectedDate) {
            setLoadingSlots(true);
            getReservationsForCourtOnDate(court.id, selectedDate)
                .then(reservations => {
                    setBookedSlots(reservations);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingSlots(false));
        }
    }, [open, court, selectedDate]);

    const handleReservation = async (hora) => {
        setBooking(true);
        const reservationData = {
            canchaId: court.id,
            clienteId: currentUser.uid,
            clienteNombre: currentUser.nombre,
            fecha: selectedDate,
            hora: hora
        };
        try {
            await createReservation(reservationData);
            showNotification(`¡Cancha "${court.nombre}" reservada para el ${selectedDate} a las ${hora}!`, 'success');
            onClose(); // Cierra el modal
        } catch (error) {
            showNotification('Hubo un error al crear la reserva.', 'error');
        } finally {
            setBooking(false);
        }
    };
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Reservar Cancha: <strong>{court?.nombre}</strong></DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{mb: 2}}>Dirección: {court?.direccion}</Typography>
                
                <TextField
                    label="Selecciona una fecha"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />

                <Typography sx={{ mt: 3, mb: 1 }}>Horarios Disponibles:</Typography>
                {loadingSlots ? <CircularProgress /> : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {timeSlots.map(slot => {
                            const isBooked = bookedSlots.includes(slot);
                            return (
                                <Button 
                                    key={slot} 
                                    variant={isBooked ? "outlined" : "contained"} 
                                    disabled={isBooked || booking}
                                    onClick={() => handleReservation(slot)}
                                >
                                    {slot}
                                </Button>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ReservationModal;
