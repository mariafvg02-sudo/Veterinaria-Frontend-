
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['../administrador/administrador.component.scss']
})
export class InventarioComponent {
  activeTab: string = 'productos';

  productos = [
    { nombre: 'Vacuna Antirrábica', stock: 50, categoria: 'Medicamentos', alerta: false },
    { nombre: 'Concentrado Adulto 10kg', stock: 3, categoria: 'Alimentos', alerta: true },
    { nombre: 'Shampoo Antipulgas', stock: 12, categoria: 'Aseo', alerta: false }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}