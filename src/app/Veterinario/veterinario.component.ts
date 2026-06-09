import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';

interface CitaRow {
  idCita?: number;
  fecha: string;
  motivo: string;
  paciente: string;
  dueno: string;
  estado: 'Pendiente' | 'Asignada' | 'En consulta' | 'Completada' | 'Cancelada';
  estadoOriginal: string;
  veterinarioId?: number;
}

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './veterinario.component.html',
  styleUrls: ['./veterinario.component.scss']
})
export class VeterinarioComponent implements OnInit {
  activeTab: string = 'agenda';

  citasHoy: CitaRow[] = [];
  historialCitas: CitaRow[] = [];

  filterText: string = '';
  historialFilterText: string = '';

  loading = false;
  error: string | null = null;
  usuarioId: number | null = null;

  mostrarModalProcesar = false;
  citaEnProceso: any = null;
  procesamientoForm!: FormGroup;
  guardando = false;
  mensajeExito: string | null = null;

  get filteredCitas() {
    const q = (this.filterText || '').trim().toLowerCase();
    if (!q) return this.citasHoy;
    return this.citasHoy.filter(c =>
      ((c.paciente || '') + ' ' + (c.dueno || '') + ' ' + (c.motivo || '')).toLowerCase().includes(q)
    );
  }

  get filteredHistorial() {
    const q = (this.historialFilterText || '').trim().toLowerCase();
    if (!q) return this.historialCitas;
    return this.historialCitas.filter(c =>
      (c.paciente || '').toLowerCase().includes(q)
    );
  }

  get citasPendientes(): number {
    return this.citasHoy.filter(c => c.estado === 'Pendiente').length;
  }

  get citasAsignadas(): number {
    return this.citasHoy.filter(c => c.estado === 'Asignada').length;
  }

  get citasCompletadas(): number {
    return this.citasHoy.filter(c => c.estado === 'Completada').length;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private citaService: CitaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const currentAuthUser = this.authService.obtenerUsuarioActual();
    this.usuarioId = currentAuthUser?.id ?? currentAuthUser?.userId ?? null;

    this.procesamientoForm = this.fb.group({
      diagnostico: ['', [Validators.required, Validators.minLength(1)]],
      tratamiento: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.cargarCitas();
    this.cargarHistorial();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  cargarCitas(): void {
    this.loading = true;
    this.error = null;

    this.citaService.obtenerTodas().subscribe({
      next: (citas) => {
        // Mostrar lo más nuevo arriba (Orden descendente por Fecha)
        this.citasHoy = citas
          .map(cita => this.mapearCita(cita))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        this.error = 'No se pudieron cargar las citas desde el servidor.';
        this.citasHoy = [];
        this.loading = false;
      }
    });
  }

  cargarHistorial(): void {
    if (!this.usuarioId) return;

    this.citaService.obtenerCitasPorVeterinario(this.usuarioId).subscribe({
      next: (citas) => {
        this.historialCitas = citas
          .filter(c => (c.estado || '').toLowerCase() === 'completada')
          .map(c => this.mapearCita(c))
          // Orden descendente por fecha (la más reciente primero)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.historialCitas = [];
      }
    });
  }

  private mapearCita(cita: Cita): CitaRow {
    return {
      idCita: cita.idCita,
      fecha: cita.fecha,
      motivo: cita.motivo,
      paciente: cita.mascota?.nombre || 'N/A',
      dueno: cita.cliente?.nombre || 'N/A',
      estado: this.normalizarEstado(cita.estado),
      estadoOriginal: cita.estado,
      veterinarioId: cita.veterinario?.id
    };
  }

  verDetalleCita(cita: CitaRow): void {
    this.router.navigate(['/veterinario/cita', cita.idCita]);
  }

  asignarme(cita: any) {
    if (!cita.idCita) { alert('La cita no tiene ID.'); return; }
    if (!this.usuarioId) { alert('No se pudo obtener tu ID de veterinario.'); return; }
    if (!confirm(`¿Deseas asignarte a la cita de ${cita.paciente}?`)) return;

    const citaActualizada: any = {
      estado: 'asignada',
      veterinario: { id: this.usuarioId }
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: () => { this.cargarCitas(); this.cargarHistorial(); },
      error: () => { alert('No se pudo asignar la cita.'); }
    });
  }

  abrirModalProcesar(cita: any) {
    this.citaEnProceso = cita;
    this.procesamientoForm.reset();
    this.mensajeExito = null;
    this.mostrarModalProcesar = true;
  }

  cerrarModalProcesar() {
    this.mostrarModalProcesar = false;
    this.citaEnProceso = null;
    this.procesamientoForm.reset();
    this.mensajeExito = null;
  }

  guardarProcesamiento() {
    if (this.procesamientoForm.invalid) {
      this.procesamientoForm.markAllAsTouched();
      return;
    }
    if (!this.citaEnProceso?.idCita) return;

    this.guardando = true;
    const { diagnostico, tratamiento } = this.procesamientoForm.value;

    const citaActualizada: any = {
      estado: 'completada',
      diagnostico: diagnostico.trim(),
      tratamiento: tratamiento.trim()
    };

    this.citaService.actualizarCita(this.citaEnProceso.idCita, citaActualizada).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = `Cita de ${this.citaEnProceso.paciente} procesada correctamente.`;
        this.cargarCitas();
        this.cargarHistorial();
        setTimeout(() => this.cerrarModalProcesar(), 1800);
      },
      error: () => {
        this.guardando = false;
        alert('No se pudo guardar el procesamiento. Intenta nuevamente.');
      }
    });
  }

  cancelarConObservacion(cita: any) {
    if (!cita.idCita) return;
    const obs = prompt('Ingresa el motivo de la cancelación (obligatorio):');
    if (obs === null) return;
    if (!obs.trim()) { alert('Debes ingresar una observación para cancelar.'); return; }
    if (!confirm('¿Confirmas la cancelación de esta cita?')) return;

    const citaActualizada: any = {
      estado: 'cancelada',
      observacionCancelacion: obs.trim()
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: () => { this.cargarCitas(); this.cargarHistorial(); },
      error: () => { alert('No se pudo cancelar la cita.'); }
    });
  }

  private normalizarEstado(estado: string): 'Pendiente' | 'Asignada' | 'En consulta' | 'Completada' | 'Cancelada' {
    switch ((estado || '').toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'asignada':
      case 'confirmada': return 'Asignada';
      case 'en consulta': return 'En consulta';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return 'Pendiente';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
