export interface Cita {
  idCita?: number;
  fecha: string; // formato LocalDateTime ISO-like (fecha parte)
  hora?: string; // hora en formato HH:mm (opcional)
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  usuarioId?: number; // id del usuario (cliente/recepcionista)
  clienteId?: number;
  mascotaId?: number;
  veterinarioId?: number;
  notas?: string;
  // Campos opcionales para mostrar nombres en la UI
  clienteNombre?: string;
  veterinarioNombre?: string;
  recepcionistaNombre?: string;
}
