import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './veterinario.component.html',
  styleUrls: ['./veterinario.component.scss']
})
export class VeterinarioComponent implements OnInit {
  activeTab: string = 'agenda';

  citasHoy: Array<{
    idCita?: number;
    fecha: string;
    motivo: string;
    paciente?: string;
    dueno?: string;
    estado: 'Pendiente' | 'Asignada' | 'En consulta' | 'Completada' | 'Cancelada';
    estadoOriginal: string;
  }> = [];

  filterText: string = '';
  loading = false;
  error: string | null = null;
  usuarioId: number | null = null;

  // Modal de procesamiento (AC1, AC2, AC3, AC4)
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
    const usuario = this.authService.obtenerUsuarioActual();
    this.usuarioId = usuario?.id ?? usuario?.userId ?? null;
    this.procesamientoForm = this.fb.group({
      diagnostico: ['', [Validators.required, Validators.minLength(1)]],
      tratamiento: ['', [Validators.required, Validators.minLength(1)]]
    });
    this.cargarCitas();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  cargarCitas(): void {
    this.loading = true;
    this.error = null;

    this.citaService.obtenerTodas().subscribe({
      next: (citas) => {
        this.citasHoy = citas.map(cita => ({
          idCita: cita.idCita,
          fecha: cita.fecha,
          motivo: cita.motivo,
          paciente: cita.cliente?.nombre || 'N/A',
          dueno: cita.cliente?.correo || 'N/A',
          estado: this.normalizarEstado(cita.estado),
          estadoOriginal: cita.estado
        }));
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

  // AC2: el veterinario se asigna a sí mismo a una cita pendiente
  asignarme(cita: any) {
    if (!cita.idCita) { alert('La cita no tiene ID.'); return; }
    if (!this.usuarioId) { alert('No se pudo obtener tu ID de veterinario.'); return; }
    if (!confirm(`¿Deseas asignarte a la cita de ${cita.paciente}?`)) return;

    const citaActualizada: any = {
      estado: 'asignada',
      veterinario: { id: this.usuarioId }
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: () => { this.cargarCitas(); },
      error: () => { alert('No se pudo asignar la cita.'); }
    });
  }

  // AC1: abre el modal de procesamiento para una cita asignada
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

  // AC3, AC4: guarda diagnóstico y tratamiento, actualiza estado a "procesada"
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
        setTimeout(() => this.cerrarModalProcesar(), 1800);
      },
      error: () => {
        this.guardando = false;
        alert('No se pudo guardar el procesamiento. Intenta nuevamente.');
      }
    });
  }

  // AC6: el veterinario cancela una cita asignada con observación
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
      next: () => { this.cargarCitas(); },
      error: () => { alert('No se pudo cancelar la cita.'); }
    });
  }

  private normalizarEstado(estado: string): 'Pendiente' | 'Asignada' | 'En consulta' | 'Completada' | 'Cancelada' {
    switch ((estado || '').toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'asignada':
      case 'confirmada':
        return 'Asignada';
      case 'en consulta':
        return 'En consulta';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
