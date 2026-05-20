export interface Cita {
  idCita?: number;
  usuarioId: number;
  mascotaId: number;
  veterinarioId: number;
  fecha: string; // formato YYYY-MM-DD
  hora: string; // formato HH:MM
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
}
