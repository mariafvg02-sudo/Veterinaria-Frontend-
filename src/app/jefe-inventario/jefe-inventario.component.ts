import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InventarioService } from '../Core/Service/inventario.service';
import { InventarioProducto } from '../Models/inventario.model';

interface Stat {
  label: string;
  value: number | string;
  icon: string;
}

type CategoriaFiltro = 'TODAS' | 'ALIMENTOS' | 'MEDICAMENTOS' | 'ACCESORIOS' | 'HIGIENE';

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
  styleUrls: ['./jefe-inventario.component.scss']
})
export class JefeInventarioComponent implements OnInit {
  currentView: string = 'stats';
  editingId: number | null = null;
  usuario: { nombre?: string; id?: number } | null = null;
  productos: InventarioProducto[] = [];
  stats: Stat[] = [];
  searchTerm = '';
  categoriaFiltro: CategoriaFiltro = 'TODAS';
  isLoading = false;
  errorMessage = '';
  readonly categorias: CategoriaFiltro[] = ['TODAS', 'ALIMENTOS', 'MEDICAMENTOS', 'ACCESORIOS', 'HIGIENE'];

  productForm: FormGroup;

  constructor(
    private router: Router,
    private inventarioService: InventarioService
  ) {
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

    this.cargarProductos();
  }

  setView(view: string): void {
    this.currentView = view;
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  onEdit(prod: InventarioProducto): void {
    this.editingId = prod.idInventarioMedicamento ?? null;
    this.productForm.patchValue({
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      cantidad: prod.cantidad
    });
    this.setView('add');
  }

  onDelete(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.inventarioService.eliminar(id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.idInventarioMedicamento !== id);
          this.refreshStats();
          if (this.editingId === id) {
            this.cancelEdit();
          }
        },
        error: () => {
          this.errorMessage = 'Error al eliminar el producto. Inténtalo de nuevo.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    const payload: InventarioProducto = {
      nombre: String(formValue.nombre ?? '').trim(),
      categoria: String(formValue.categoria ?? 'ALIMENTOS'),
      precio: Number(formValue.precio ?? 0),
      cantidad: Number(formValue.cantidad ?? 0),
      jefeInventario: this.usuario?.id ? { id: this.usuario.id } : undefined
    };

    this.isLoading = true;
    this.errorMessage = '';

    if (this.editingId) {
      this.inventarioService.actualizar(this.editingId, payload).subscribe({
        next: (updated) => {
          this.productos = this.productos.map(p =>
            p.idInventarioMedicamento === this.editingId ? updated : p
          );
          this.refreshStats();
          this.cancelEdit();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Error al actualizar el producto.';
          this.isLoading = false;
        }
      });
    } else {
      this.inventarioService.crear(payload).subscribe({
        next: (nuevo) => {
          this.productos = [nuevo, ...this.productos];
          this.refreshStats();
          this.cancelEdit();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Error al registrar el producto.';
          this.isLoading = false;
        }
      });
    }
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

  trackByProductoId(_: number, producto: InventarioProducto): number {
    return producto.idInventarioMedicamento ?? 0;
  }

  get productosFiltrados(): InventarioProducto[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.productos.filter(producto => {
      const coincideBusqueda = !search || [producto.nombre, producto.categoria].some(campo => campo.toLowerCase().includes(search));
      const coincideCategoria = this.categoriaFiltro === 'TODAS' || producto.categoria === this.categoriaFiltro;
      return coincideBusqueda && coincideCategoria;
    });
  }

  get productosBajoStock(): InventarioProducto[] {
    return this.productos
      .filter(producto => producto.cantidad <= STOCK_BAJO_UMBRAL)
      .slice(0, 4);
  }

  get totalStock(): number {
    return this.productos.reduce((acc, p) => acc + p.cantidad, 0);
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get totalCategorias(): number {
    return new Set(this.productos.map(p => p.categoria)).size;
  }

  get productosAgotados(): number {
    return this.productos.filter(p => p.cantidad === 0).length;
  }

  get stockBajo(): number {
    return this.productos.filter(p => p.cantidad > 0 && p.cantidad <= STOCK_BAJO_UMBRAL).length;
  }

  estadoProducto(producto: InventarioProducto): string {
    if (producto.cantidad === 0) return 'Agotado';
    if (producto.cantidad <= STOCK_BAJO_UMBRAL) return 'Stock bajo';
    return 'Normal';
  }

  estadoClase(producto: InventarioProducto): string {
    if (producto.cantidad === 0) return 'agotado';
    if (producto.cantidad <= STOCK_BAJO_UMBRAL) return 'bajo';
    return 'normal';
  }

  reabastecer(producto: InventarioProducto): void {
    if (!producto.idInventarioMedicamento) return;
    const actualizado: InventarioProducto = {
      ...producto,
      cantidad: producto.cantidad + 10,
      jefeInventario: this.usuario?.id ? { id: this.usuario.id } : undefined
    };
    this.inventarioService.actualizar(producto.idInventarioMedicamento, actualizado).subscribe({
      next: (updated) => {
        this.productos = this.productos.map(p =>
          p.idInventarioMedicamento === producto.idInventarioMedicamento ? updated : p
        );
        this.refreshStats();
      },
      error: () => {
        this.errorMessage = 'Error al reabastecer el producto.';
      }
    });
  }

  private cargarProductos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.inventarioService.listar().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.refreshStats();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar el inventario. Verifica la conexión con el servidor.';
        this.isLoading = false;
      }
    });
  }

  private refreshStats(): void {
    this.stats = [
      { label: 'Productos', value: this.totalProductos, icon: 'fa-boxes-stacked' },
      { label: 'Stock total', value: this.totalStock, icon: 'fa-cubes' },
      { label: 'Bajo stock', value: this.stockBajo, icon: 'fa-triangle-exclamation' },
      { label: 'Agotados', value: this.productosAgotados, icon: 'fa-circle-xmark' }
    ];
  }
}
