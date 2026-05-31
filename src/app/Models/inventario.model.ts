export interface InventarioProducto {
  idInventarioMedicamento?: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
  jefeInventario?: { id: number };
}
