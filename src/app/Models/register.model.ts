export interface Register {
  Userid? : number; // El '?' indica que es opcional (generado por la DB)
  nombre: string;
  correo: string;
  clave: string;
  telefono: string;
  rol?: string; // Agregado para roles de usuario
}