export interface Mascota {
  idMascota?: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  peso: number;
  sexo: 'Macho' | 'Hembra';
  esterilizado: boolean;
  descripcion: string;
  usuarioId: number; // ID del cliente propietario
}
