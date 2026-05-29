import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
}

interface Stat {
  label: string;
  value: number | string;
  icon: string;
}

type CategoriaFiltro = 'TODAS' | 'ALIMENTOS' | 'MEDICAMENTOS' | 'ACCESORIOS' | 'HIGIENE';

const STORAGE_KEY = 'jefe-inventario-productos';
const STOCK_BAJO_UMBRAL = 10;

@Component({
  selector: 'app-jefe-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './jefe-inventario.component.html',
  styleUrl: './jefe-inventario.component.scss'
})
export class JefeInventarioComponent implements OnInit {
  currentView: string = 'stats';
  editingId: number | null = null;
  usuario: { nombre?: string } | null = null;
  productos: Producto[] = [];
  stats: Stat[] = [];
  searchTerm = '';
  categoriaFiltro: CategoriaFiltro = 'TODAS';
  readonly categorias: CategoriaFiltro[] = ['TODAS', 'ALIMENTOS', 'MEDICAMENTOS', 'ACCESORIOS', 'HIGIENE'];

  productForm: FormGroup;

  constructor(private router: Router) {
    this.productForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
      categoria: new FormControl<CategoriaFiltro>('ALIMENTOS', [Validators.required]),
      precio: new FormControl<number | string>('', [Validators.required, Validators.min(0)]),
      cantidad: new FormControl<number | string>('', [Validators.required, Validators.min(0)]),
    });
  }

  ngOnInit(): void {
    try {
      const storedUser = localStorage.getItem('usuario');
      this.usuario = storedUser ? JSON.parse(storedUser) : { nombre: 'Jefe de Inventario' };
    } catch (e) {
      this.usuario = { nombre: 'Jefe de Inventario' };
    }

    this.loadProducts();
    this.refreshStats();
  }

  setView(view: string): void {
    this.currentView = view;
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  onEdit(prod: Producto): void {
    this.editingId = prod.id;
    this.productForm.patchValue({
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      cantidad: prod.cantidad
    });
    this.setView('add');
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
      this.persistProducts();
      if (this.editingId === id) {
        this.cancelEdit();
      }
      this.refreshStats();
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    const payload: Producto = {
      id: this.editingId ?? this.getNextId(),
      nombre: String(formValue.nombre ?? '').trim(),
      categoria: String(formValue.categoria ?? 'ALIMENTOS'),
      precio: Number(formValue.precio ?? 0),
      cantidad: Number(formValue.cantidad ?? 0)
    };

    if (this.editingId) {
      this.productos = this.productos.map(producto => producto.id === this.editingId ? payload : producto);
    } else {
      this.productos = [payload, ...this.productos];
    }

    this.persistProducts();
    this.refreshStats();
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.productForm.reset({
      nombre: '',
      categoria: 'ALIMENTOS',
      precio: '',
      cantidad: ''
    });
    this.setView('list');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoriaFiltro = 'TODAS';
  }

  trackByProductoId(_: number, producto: Producto): number {
    return producto.id;
  }

  get productosFiltrados(): Producto[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.productos.filter(producto => {
      const coincideBusqueda = !search || [producto.nombre, producto.categoria].some(campo => campo.toLowerCase().includes(search));
      const coincideCategoria = this.categoriaFiltro === 'TODAS' || producto.categoria === this.categoriaFiltro;

      return coincideBusqueda && coincideCategoria;
    });
  }

  get productosBajoStock(): Producto[] {
    return this.productos
      .filter(producto => producto.cantidad <= STOCK_BAJO_UMBRAL)
      .slice(0, 4);
  }

  get totalStock(): number {
    return this.productos.reduce((acumulado, producto) => acumulado + producto.cantidad, 0);
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalCategorias(): number {
    return new Set(this.productos.map(producto => producto.categoria)).size;
  }

  get productosAgotados(): number {
    return this.productos.filter(producto => producto.cantidad === 0).length;
  }

  get stockBajo(): number {
    return this.productos.filter(producto => producto.cantidad > 0 && producto.cantidad <= STOCK_BAJO_UMBRAL).length;
  }

  estadoProducto(producto: Producto): string {
    if (producto.cantidad === 0) {
      return 'Agotado';
    }

    if (producto.cantidad <= STOCK_BAJO_UMBRAL) {
      return 'Stock bajo';
    }

    return 'Normal';
  }

  estadoClase(producto: Producto): string {
    if (producto.cantidad === 0) {
      return 'agotado';
    }

    if (producto.cantidad <= STOCK_BAJO_UMBRAL) {
      return 'bajo';
    }

    return 'normal';
  }

  reabastecer(producto: Producto): void {
    this.productos = this.productos.map(item => item.id === producto.id
      ? { ...item, cantidad: item.cantidad + 10 }
      : item);
    this.persistProducts();
    this.refreshStats();
  }

  private refreshStats(): void {
    this.stats = [
      { label: 'Productos', value: this.totalProductos, icon: 'fa-boxes-stacked' },
      { label: 'Stock total', value: this.totalStock, icon: 'fa-cubes' },
      { label: 'Bajo stock', value: this.stockBajo, icon: 'fa-triangle-exclamation' },
      { label: 'Agotados', value: this.productosAgotados, icon: 'fa-circle-xmark' }
    ];
  }

  private loadProducts(): void {
    const fallback: Producto[] = [
      { id: 1, nombre: 'Concentrado premium', categoria: 'ALIMENTOS', precio: 125000, cantidad: 18 },
      { id: 2, nombre: 'Vacuna antirrábica', categoria: 'MEDICAMENTOS', precio: 38000, cantidad: 6 },
      { id: 3, nombre: 'Jeringa 5ml', categoria: 'ACCESORIOS', precio: 1200, cantidad: 32 },
      { id: 4, nombre: 'Shampoo antipulgas', categoria: 'HIGIENE', precio: 25000, cantidad: 0 }
    ];

    try {
      const storedProducts = localStorage.getItem(STORAGE_KEY);
      const parsedProducts = storedProducts ? JSON.parse(storedProducts) : null;

      if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
        this.productos = parsedProducts.map((producto, index) => ({
          id: Number(producto.id ?? index + 1),
          nombre: String(producto.nombre ?? ''),
          categoria: String(producto.categoria ?? 'ALIMENTOS'),
          precio: Number(producto.precio ?? 0),
          cantidad: Number(producto.cantidad ?? 0)
        }));
        return;
      }
    } catch (error) {
      console.warn('No se pudo leer el inventario guardado.', error);
    }

    this.productos = fallback;
    this.persistProducts();
  }

  private persistProducts(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productos));
  }

  private getNextId(): number {
    return this.productos.reduce((maximo, producto) => Math.max(maximo, producto.id), 0) + 1;
  }
}
