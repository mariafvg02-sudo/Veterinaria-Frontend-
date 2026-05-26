export interface Cita {
  idCita?: number;
  fecha: string; // formato LocalDateTime ISO-like
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}
