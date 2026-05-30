import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Pago {
  id: number;
  cliente: string;
  mascota: string;
  fecha: Date;
  monto: number;
  metodo: 'efectivo' | 'tarjeta' | 'transferencia';
  estado: 'pagado' | 'pendiente' | 'vencido';
  descripcion: string;
}

@Component({
  selector: 'app-pagos-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-facturas.component.html',
  styleUrls: ['./pagos-facturas.component.scss']
})
export class PagosFacturasComponent implements OnInit {
  pagos: Pago[] = [];
  filteredPagos: Pago[] = [];
  searchTerm = '';
  selectedEstado = 'todos';
  loading = false;
  message: string | null = null;

  stats = [
    { label: 'Total recaudado', value: '$0', icon: 'fa-dollar-sign' },
    { label: 'Pagos pendientes', value: '0', icon: 'fa-clock' },
    { label: 'Facturas emitidas', value: '0', icon: 'fa-file-invoice' },
    { label: 'Métodos de pago', value: '3', icon: 'fa-credit-card' }
  ];

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.loading = true;
    this.message = null;
    
    // Datos de ejemplo
    this.pagos = [
      {
        id: 1,
        cliente: 'Juan Pérez',
        mascota: 'Firulais',
        fecha: new Date('2024-05-25'),
        monto: 150.00,
        metodo: 'tarjeta',
        estado: 'pagado',
        descripcion: 'Consulta veterinaria + vacunación'
      },
      {
        id: 2,
        cliente: 'María López',
        mascota: 'Mimi',
        fecha: new Date('2024-05-26'),
        monto: 85.50,
        metodo: 'efectivo',
        estado: 'pagado',
        descripcion: 'Limpieza dental'
      },
      {
        id: 3,
        cliente: 'Carlos García',
        mascota: 'Rex',
        fecha: new Date('2024-05-27'),
        monto: 220.00,
        metodo: 'transferencia',
        estado: 'pendiente',
        descripcion: 'Cirugía menor'
      },
      {
        id: 4,
        cliente: 'Ana Martínez',
        mascota: 'Bella',
        fecha: new Date('2024-05-15'),
        monto: 95.00,
        metodo: 'tarjeta',
        estado: 'vencido',
        descripcion: 'Consulta dermatológica'
      },
      {
        id: 5,
        cliente: 'Roberto Torres',
        mascota: 'Max',
        fecha: new Date('2024-05-28'),
        monto: 175.50,
        metodo: 'efectivo',
        estado: 'pagado',
        descripcion: 'Baño y corte de uñas'
      }
    ];

    setTimeout(() => {
      this.loading = false;
      this.filtrarPagos();
      this.actualizarEstadisticas();
    }, 500);
  }

  filtrarPagos(): void {
    this.filteredPagos = this.pagos.filter(pago => {
      const matchesSearch =
        pago.cliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pago.mascota.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pago.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesEstado =
        this.selectedEstado === 'todos' || pago.estado === this.selectedEstado;

      return matchesSearch && matchesEstado;
    });
  }

  actualizarEstadisticas(): void {
    const totalRecaudado = this.pagos
      .filter(p => p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0);

    const pendientes = this.pagos.filter(p => p.estado === 'pendiente').length;
    const facturadas = this.pagos.length;

    this.stats = [
      {
        label: 'Total recaudado',
        value: `$${totalRecaudado.toFixed(2)}`,
        icon: 'fa-dollar-sign'
      },
      {
        label: 'Pagos pendientes',
        value: `${pendientes}`,
        icon: 'fa-clock'
      },
      {
        label: 'Facturas emitidas',
        value: `${facturadas}`,
        icon: 'fa-file-invoice'
      },
      {
        label: 'Métodos de pago',
        value: '3',
        icon: 'fa-credit-card'
      }
    ];
  }

  onSearchChange(): void {
    this.filtrarPagos();
  }

  onEstadoChange(): void {
    this.filtrarPagos();
  }

  refrescarPagos(): void {
    this.cargarPagos();
  }

  descargarFactura(pago: Pago): void {
    console.log('Descargando factura:', pago.id);
    this.message = `Factura #${pago.id} descargada exitosamente.`;
    setTimeout(() => (this.message = null), 3000);
  }

  enviarComprobante(pago: Pago): void {
    console.log('Enviando comprobante:', pago.id);
    this.message = `Comprobante enviado a ${pago.cliente}.`;
    setTimeout(() => (this.message = null), 3000);
  }
}
