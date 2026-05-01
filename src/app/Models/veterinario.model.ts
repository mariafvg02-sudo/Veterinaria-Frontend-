export interface Veterinario {
  idVeterinario?: number; // Correspondiente a 'private long idVeterinario'
  documentoIdentidad: number;
  nombre: string;
  correo: string;
  telefono: string;
  especialidad: string;
  clave: string;
}
