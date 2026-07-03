export interface CitaUsuario {
  id?: number;
  nombre?: string;
  correo?: string;
}

export interface Cita {
  idCita?: number;
  fecha: string;
  hora?: string;
  motivo: string;
  estado: string;
  observacionCancelacion?: string;
  diagnostico?: string;
  tratamiento?: string;
  costo?: number;

  // Objetos anidados — vienen del backend en las respuestas
  cliente?: CitaUsuario;
  veterinario?: CitaUsuario;
  recepcionista?: CitaUsuario;
  mascota?: { idMascota?: number; nombre?: string; especie?: string; raza?: string };

  // IDs planos — usados en formularios y requests legacy
  usuarioId?: number;
  clienteId?: number;
  mascotaId?: number;
  veterinarioId?: number;
  notas?: string;

  // Nombres para mostrar en la UI
  clienteNombre?: string;
  veterinarioNombre?: string;
  recepcionistaNombre?: string;
}
