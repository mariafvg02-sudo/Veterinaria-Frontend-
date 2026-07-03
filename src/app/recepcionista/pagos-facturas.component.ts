import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../Core/Service/pago.service';
import { FacturaService } from '../Core/Service/factura.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';
import { DataTableComponent } from '../shared/data-table/data-table.component';

@Component({
  selector: 'app-pagos-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './pagos-facturas.component.html',
  styleUrls: ['./pagos-facturas.component.scss']
})
export class PagosFacturasComponent implements OnInit {
  activeSubTab: 'facturas' | 'pagos' = 'facturas';

  // Facturas
  facturas: any[] = [];
  filteredFacturas: any[] = [];
  searchFactura = '';
  selectedEstadoFactura = 'todos';
  loadingFacturas = false;
  facturaDetalle: any = null;

  // Crear factura
  showCrearFactura = false;
  citasCompletadas: Cita[] = [];
  citaSeleccionada: Cita | null = null;
  montoFactura: number = 0;
  loadingCitas = false;
  creandoFactura = false;

  // Pagos
  pagos: any[] = [];
  filteredPagos: any[] = [];
  searchPago = '';
  selectedEstadoPago = 'todos';
  loadingPagos = false;

  // Crear pago
  showCrearPago = false;
  facturasParaPago: any[] = [];
  facturaSeleccionadaPago: any = null;
  metodoPago: string = 'efectivo';
  montoPago: number = 0;
  loadingFacturasPago = false;
  creandoPago = false;

  message: string | null = null;
  messageType: 'success' | 'error' = 'success';

  constructor(
    private pagoService: PagoService,
    private facturaService: FacturaService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
  }

  setSubTab(tab: 'facturas' | 'pagos'): void {
    this.activeSubTab = tab;
    this.showCrearFactura = false;
    this.showCrearPago = false;
    this.facturaDetalle = null;
    if (tab === 'facturas' && this.facturas.length === 0) this.cargarFacturas();
    if (tab === 'pagos' && this.pagos.length === 0) this.cargarPagos();
  }

  // ── FACTURAS ──

  cargarFacturas(): void {
    this.loadingFacturas = true;
    this.facturaService.listarFacturas().subscribe({
      next: (data) => {
        this.facturas = data;
        this.filtrarFacturas();
        this.loadingFacturas = false;
      },
      error: () => {
        this.loadingFacturas = false;
        this.showMessage('Error al cargar las facturas.', 'error');
      }
    });
  }

  filtrarFacturas(): void {
    const q = (this.searchFactura || '').trim().toLowerCase();
    this.filteredFacturas = this.facturas.filter(f => {
      const clienteNombre = (f.cita?.cliente?.nombre || '').toLowerCase();
      const mascotaNombre = (f.cita?.mascota?.nombre || '').toLowerCase();
      const idStr = (f.idFactura || '').toString();
      const matchSearch = !q || clienteNombre.includes(q) || mascotaNombre.includes(q) || idStr.includes(q);
      const matchEstado = this.selectedEstadoFactura === 'todos' ||
        (f.estado || '').toLowerCase() === this.selectedEstadoFactura;
      return matchSearch && matchEstado;
    });
  }

  get statsFacturas() {
    const total = this.facturas.length;
    const emitidas = this.facturas.filter(f => (f.estado || '').toLowerCase() === 'emitida').length;
    const pagadas = this.facturas.filter(f => (f.estado || '').toLowerCase() === 'pagada').length;
    const montoTotal = this.facturas.reduce((sum: number, f: any) => sum + (f.total || 0), 0);
    return [
      { label: 'Total facturas', value: total, icon: 'fa-file-invoice' },
      { label: 'Emitidas', value: emitidas, icon: 'fa-file-circle-plus' },
      { label: 'Pagadas', value: pagadas, icon: 'fa-file-circle-check' },
      { label: 'Monto total', value: '$' + montoTotal.toLocaleString('es-CO', { minimumFractionDigits: 0 }), icon: 'fa-dollar-sign' }
    ];
  }

  verDetalleFactura(factura: any): void {
    this.facturaDetalle = factura;
  }

  cerrarDetalle(): void {
    this.facturaDetalle = null;
  }

  // ── CREAR FACTURA ──

  abrirCrearFactura(): void {
    this.showCrearFactura = true;
    this.citaSeleccionada = null;
    this.montoFactura = 0;
    this.cargarCitasSinFactura();
  }

  cerrarCrearFactura(): void {
    this.showCrearFactura = false;
    this.citaSeleccionada = null;
    this.montoFactura = 0;
  }

  cargarCitasSinFactura(): void {
    this.loadingCitas = true;
    this.citaService.obtenerTodas().subscribe({
      next: (citas) => {
        const completadas = citas.filter(c => c.estado === 'completada');
        const idsConFactura = new Set(
          this.facturas.map(f => f.cita?.idCita).filter(Boolean)
        );
        this.citasCompletadas = completadas.filter(c => !idsConFactura.has(c.idCita));
        this.loadingCitas = false;
      },
      error: () => {
        this.loadingCitas = false;
        this.showMessage('Error al cargar las citas.', 'error');
      }
    });
  }

  seleccionarCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.montoFactura = cita.costo || 0;
  }

  crearFactura(): void {
    if (!this.citaSeleccionada?.idCita || this.montoFactura <= 0) return;

    this.creandoFactura = true;
    const factura = {
      fechaHora: new Date().toISOString(),
      estado: 'emitida',
      total: this.montoFactura,
      cita: { idCita: this.citaSeleccionada.idCita }
    };

    this.facturaService.crearFactura(factura).subscribe({
      next: (nueva) => {
        this.facturas = [nueva, ...this.facturas];
        this.filtrarFacturas();
        this.creandoFactura = false;
        this.showCrearFactura = false;
        this.citaSeleccionada = null;
        this.montoFactura = 0;
        this.showMessage('Factura creada correctamente.', 'success');
      },
      error: () => {
        this.creandoFactura = false;
        this.showMessage('Error al crear la factura. Verifique que la cita no tenga factura asociada.', 'error');
      }
    });
  }

  descargarFactura(factura: any): void {
    this.facturaService.descargarFacturaPdf(factura.idFactura).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${factura.idFactura}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showMessage('Factura descargada.', 'success');
      },
      error: () => this.showMessage('No se pudo descargar la factura.', 'error')
    });
  }

  // ── PAGOS ──

  cargarPagos(): void {
    this.loadingPagos = true;
    this.pagoService.listarPagos().subscribe({
      next: (data) => {
        this.pagos = data;
        this.filtrarPagos();
        this.loadingPagos = false;
      },
      error: () => {
        this.loadingPagos = false;
        this.showMessage('Error al cargar los pagos.', 'error');
      }
    });
  }

  filtrarPagos(): void {
    const q = (this.searchPago || '').trim().toLowerCase();
    this.filteredPagos = this.pagos.filter(p => {
      const clienteNombre = (p.factura?.cita?.cliente?.nombre || '').toLowerCase();
      const idStr = (p.idPago || '').toString();
      const matchSearch = !q || clienteNombre.includes(q) || idStr.includes(q);
      const matchEstado = this.selectedEstadoPago === 'todos' ||
        (p.estado || '').toLowerCase() === this.selectedEstadoPago.toLowerCase();
      return matchSearch && matchEstado;
    });
  }

  get statsPagos() {
    const total = this.pagos.length;
    const completados = this.pagos.filter(p => (p.estado || '').toUpperCase() === 'COMPLETADO');
    const anulados = this.pagos.filter(p => (p.estado || '').toUpperCase() === 'ANULADO').length;
    const totalRecaudado = completados.reduce((sum: number, p: any) => sum + (Number(p.monto) || 0), 0);
    return [
      { label: 'Total pagos', value: total, icon: 'fa-receipt' },
      { label: 'Completados', value: completados.length, icon: 'fa-circle-check' },
      { label: 'Anulados', value: anulados, icon: 'fa-circle-xmark' },
      { label: 'Recaudado', value: '$' + totalRecaudado.toLocaleString('es-CO', { minimumFractionDigits: 0 }), icon: 'fa-dollar-sign' }
    ];
  }

  // ── CREAR PAGO ──

  abrirCrearPago(): void {
    this.showCrearPago = true;
    this.facturaSeleccionadaPago = null;
    this.metodoPago = 'efectivo';
    this.montoPago = 0;
    this.cargarFacturasParaPago();
  }

  cerrarCrearPago(): void {
    this.showCrearPago = false;
    this.facturaSeleccionadaPago = null;
    this.montoPago = 0;
  }

  cargarFacturasParaPago(): void {
    this.loadingFacturasPago = true;
    this.facturaService.listarFacturas().subscribe({
      next: (facturas) => {
        this.facturasParaPago = facturas.filter(
          (f: any) => (f.estado || '').toLowerCase() === 'emitida'
        );
        this.loadingFacturasPago = false;
      },
      error: () => {
        this.loadingFacturasPago = false;
        this.showMessage('Error al cargar facturas pendientes.', 'error');
      }
    });
  }

  seleccionarFacturaPago(factura: any): void {
    this.facturaSeleccionadaPago = factura;
    this.montoPago = factura?.total || 0;
  }

  crearPago(): void {
    if (!this.facturaSeleccionadaPago || this.montoPago <= 0) return;

    this.creandoPago = true;
    const pago = {
      fechaHora: new Date().toISOString(),
      metodo: this.metodoPago,
      monto: this.montoPago,
      factura: { idFactura: this.facturaSeleccionadaPago.idFactura }
    };

    this.pagoService.crearPago(pago).subscribe({
      next: (nuevoPago) => {
        this.pagos = [nuevoPago, ...this.pagos];
        this.filtrarPagos();

        this.facturaService.actualizarFactura(
          this.facturaSeleccionadaPago.idFactura,
          { ...this.facturaSeleccionadaPago, estado: 'pagada' }
        ).subscribe({
          next: (facturaActualizada) => {
            this.facturas = this.facturas.map(f =>
              f.idFactura === facturaActualizada.idFactura ? facturaActualizada : f
            );
            this.filtrarFacturas();
          }
        });

        this.creandoPago = false;
        this.showCrearPago = false;
        this.facturaSeleccionadaPago = null;
        this.montoPago = 0;
        this.showMessage('Pago registrado correctamente.', 'success');
      },
      error: () => {
        this.creandoPago = false;
        this.showMessage('Error al registrar el pago.', 'error');
      }
    });
  }

  anularPago(pago: any): void {
    if (!confirm('¿Está seguro de anular este pago? Esta acción no se puede revertir.')) return;

    this.pagoService.anularPago(pago.idPago).subscribe({
      next: (pagoAnulado) => {
        this.pagos = this.pagos.map(p =>
          p.idPago === pagoAnulado.idPago ? pagoAnulado : p
        );
        this.filtrarPagos();
        this.showMessage('Pago anulado correctamente.', 'success');
      },
      error: () => this.showMessage('Error al anular el pago.', 'error')
    });
  }

  // ── UTILIDADES ──

  getEstadoFacturaClass(estado: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'emitida': return 'emitida';
      case 'pagada': return 'pagada';
      case 'anulada': return 'anulada';
      default: return '';
    }
  }

  getEstadoPagoClass(estado: string): string {
    switch ((estado || '').toUpperCase()) {
      case 'COMPLETADO': return 'pagada';
      case 'ANULADO': return 'anulada';
      default: return '';
    }
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = null), 4000);
  }
}
