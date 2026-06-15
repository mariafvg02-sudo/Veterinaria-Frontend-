import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../Core/Service/pago.service';
import { FacturaService } from '../Core/Service/factura.service';

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
  pagos: any[] = [];
  filteredPagos: any[] = [];
  searchTerm = '';
  selectedEstado = 'todos';
  loading = false;
  message: string | null = null;

  constructor(
    private pagoService: PagoService,
    private facturaService: FacturaService
  ) {}

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
    
    this.pagoService.listarPagos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.filtrarPagos();
        this.actualizarEstadisticas();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al conectar con el servicio de pagos.';
      }
    });
  }

  filtrarPagos(): void {
    this.filteredPagos = this.pagos.filter(pago => {
      const clienteNombre = pago.cliente?.nombre || '';
      const mascotaNombre = pago.mascota?.nombre || '';
      
      const matchesSearch = 
        clienteNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mascotaNombre.toLowerCase().includes(this.searchTerm.toLowerCase());

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

  descargarFactura(pago: any): void {
    this.facturaService.descargarFacturaPdf(pago.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${pago.id}.pdf`;
        a.click();
        this.message = 'Factura descargada correctamente.';
        setTimeout(() => (this.message = null), 3000);
      },
      error: () => alert('No se pudo generar la factura real.')
    });
  }

  enviarComprobante(pago: Pago): void {
    this.message = `Comprobante enviado a ${pago.cliente}.`;
    setTimeout(() => (this.message = null), 3000);
  }
}
