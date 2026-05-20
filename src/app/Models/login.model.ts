export interface Login {
Userid? : number; // El '?' indica que es opcional (generado por la DB)
correo: string;
clave: string;
}