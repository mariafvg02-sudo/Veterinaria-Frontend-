
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['../administrador/administrador.component.scss']
})
export class InventarioComponent {
  activeTab: string = 'productos';

  filterText: string = '';

  productos = [
    { nombre: 'Vacuna Antirrábica', stock: 50, categoria: 'Medicamentos', alerta: false },
    { nombre: 'Concentrado Adulto 10kg', stock: 3, categoria: 'Alimentos', alerta: true },
    { nombre: 'Shampoo Antipulgas', stock: 12, categoria: 'Aseo', alerta: false }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  get filteredProducts() {
    const txt = (this.filterText || '').trim().toLowerCase();
    if (!txt) return this.productos;
    return this.productos.filter(p => (p.nombre + ' ' + p.categoria).toLowerCase().includes(txt));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}