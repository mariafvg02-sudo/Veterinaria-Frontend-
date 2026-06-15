export interface HistorialMedico {
  idHistorialMedico?: number; // Coincide con el Long de Java
  fecha: string; // LocalDate se recibe como string (YYYY-MM-DD)
  motivo: string; // Faltaba este campo (length 400 en Java)
  diagnostico: string;
  tratamiento: string;
  
  // Relación @ManyToOne con Mascota
  mascota: {
    idMascota: number;
  };
  
  // Relación @ManyToOne con User (Veterinario)
  veterinario: {
    userId: number;
  };

  // Relación @ManyToOne con User (Cliente)
  cliente: {
    userId: number;
  };

  // Relación @ManyToOne opcional con Cita
  cita?: {
    idCita?: number;
  };
}