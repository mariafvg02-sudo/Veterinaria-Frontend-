export interface Mascota {
  idMascota?: number;
  id_mascota?: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  peso: number;
  sexo?: 'Macho' | 'Hembra' | string;
  esterilizado?: boolean;
  descripcion?: string;
  usuarioId?: number; // ID del cliente propietario
  idCliente?: number;
  id_cliente?: number;
  idVeterinario?: number | null;
  id_veterinario?: number | null;
}
