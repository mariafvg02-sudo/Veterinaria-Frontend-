export interface Login {
  userId? : number; // El '?' indica que es opcional (generado por la DB)
correo: string;
clave: string;
}