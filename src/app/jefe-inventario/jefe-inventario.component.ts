import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Soluciona NG8103, NG8002 y NG8004
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // Soluciona errores de formGroup
import { Router } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-jefe-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './jefe-inventario.component.html'
})
export class JefeInventarioComponent implements OnInit {
  // --- Propiedades requeridas por el HTML (Resuelven errores NG9) ---
  currentView: string = 'stats';
  editingId: number | null = null;
  usuario: any = null;
  productos: Producto[] = [];
  stats: Stat[] = [];

  // Formulario reactivo para la gestión de productos
  productForm: FormGroup;

  constructor(private router: Router) {
    // Inicialización del formulario
    this.productForm = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      categoria: new FormControl('ALIMENTOS', [Validators.required]),
      precio: new FormControl('', [Validators.required, Validators.min(0)]),
      cantidad: new FormControl('', [Validators.required, Validators.min(0)]),
    });
  }

  ngOnInit(): void {
    try {
      const storedUser = localStorage.getItem('usuario');
      this.usuario = storedUser ? JSON.parse(storedUser) : { nombre: 'Jefe de Inventario' };
    } catch (e) {
      this.usuario = { nombre: 'Jefe de Inventario' };
    }

    // Cargar datos iniciales de prueba
    this.loadStats();
    this.loadProducts();
  }

  // --- Métodos requeridos por el HTML (Resuelven errores NG9) ---

  setView(view: string): void {
    this.currentView = view;
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  onEdit(prod: Producto): void {
    this.editingId = prod.id;
    this.productForm.patchValue(prod); // Rellena el formulario con los datos del producto
    this.setView('add');
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
      this.loadStats(); // Actualizar las tarjetas de estadísticas
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Datos del producto:', this.productForm.value);
      // Aquí iría la llamada a tu servicio para guardar en la base de datos
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.productForm.reset();
    this.setView('list');
  }

  // Métodos de carga de datos (Simulados)
  private loadStats(): void {
    this.stats = [
      { label: 'Stock Total', value: 120, icon: 'fa-boxes-stacked' },
      { label: 'Bajo Stock', value: 5, icon: 'fa-triangle-exclamation' }
    ];
  }

  private loadProducts(): void {
    this.productos = [
      { id: 1, nombre: 'Ejemplo Producto 1', categoria: 'ALIMENTOS', precio: 25.50, cantidad: 10 },
      { id: 2, nombre: 'Ejemplo Producto 2', categoria: 'MEDICAMENTOS', precio: 10.00, cantidad: 0 }
    ];
  }
}
