<<<<<<< HEAD
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
<<<<<<< HEAD
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Usuario } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';
=======
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';

type CitaEstado = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'En espera';

interface CitaRecepcion {
  id: number;
  fecha: string;
  motivo: string;
  estado: CitaEstado;
}
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recepcionista.component.html',
  styleUrls: ['./recepcionista.component.scss']
})
export class RecepcionistaComponent implements OnInit {
<<<<<<< HEAD
  @ViewChild('dashboardSection') dashboardSection?: ElementRef<HTMLElement>;

  usuario: Usuario | null = null;
  citas: Cita[] = [];
  searchTerm = '';
  selectedEstado = 'todos';
  loading = false;
  message: string | null = null;
  citaForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];
=======
  activeTab: 'citas' | 'registro' = 'citas';

  citaForm: FormGroup;

  citasHoy: CitaRecepcion[] = [];
  loading = false;
  error: string | null = null;

  private recepcionistaId: number | null = null;

  get citasPendientes(): number {
    return this.citasHoy.filter(cita => cita.estado === 'Pendiente').length;
  }

  get citasConfirmadas(): number {
    return this.citasHoy.filter(cita => cita.estado === 'Confirmada').length;
  }

  get citasEnEspera(): number {
    return this.citasHoy.filter(cita => cita.estado === 'En espera').length;
  }

  get citasCanceladas(): number {
    return this.citasHoy.filter(cita => cita.estado === 'Cancelada').length;
  }

  getEstadoClase(estado: CitaEstado): string {
    if (estado === 'Confirmada') {
      return 'veterinario';
    }

    if (estado === 'Cancelada') {
      return 'administrador';
    }

    return 'recepcionista';
  }
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
<<<<<<< HEAD
    private citaService: CitaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();

    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.citaForm = this.fb.group({
      mascotaId: [1, [Validators.required, Validators.min(1)]],
      fecha: [this.today, Validators.required],
      hora: ['09:00', Validators.required],
      veterinarioId: [1, [Validators.required, Validators.min(1)]],
      motivo: ['Revisión general', Validators.required],
      estado: ['pendiente', Validators.required],
      notas: ['']
    });

    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.loading = true;
    this.message = null;

    this.citaService.obtenerTodas().pipe(
      catchError(() => of(this.obtenerCitasDeEjemplo()))
    ).subscribe({
      next: (citas) => {
        this.citas = [...citas].sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());
        this.loading = false;

        if (this.citas.length === 0) {
          this.message = 'No hay citas programadas en este momento.';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'No se pudo cargar la agenda. Mostrando datos de ejemplo.';
      }
    });
  }

  registrarCita(): void {
=======
    private router: Router,
    private citaService: CitaService
  ) {
    this.citaForm = this.fb.group({
      fecha: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.recepcionistaId = usuario?.userId ?? null;
    this.cargarCitas();
  }

  setActiveTab(tab: 'citas' | 'registro') {
    this.activeTab = tab;
  }

  agendarCita(): void {
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

<<<<<<< HEAD
    this.loading = true;

    const citaData: Cita = {
      ...this.citaForm.value,
      usuarioId: this.usuario?.id ?? this.usuario?.Userid ?? 1,
      mascotaId: Number(this.citaForm.value.mascotaId),
      veterinarioId: Number(this.citaForm.value.veterinarioId),
      estado: this.citaForm.value.estado as Cita['estado'],
      notas: this.citaForm.value.notas || undefined
    };

    this.citaService.crearCita(citaData).subscribe({
      next: (cita) => {
        this.citas = [cita, ...this.citas].sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());
        this.loading = false;
        this.message = `Cita para ${cita.motivo} agendada correctamente.`;
        this.citaForm.reset({
          mascotaId: 1,
          fecha: this.today,
          hora: '09:00',
          veterinarioId: 1,
          motivo: 'Revisión general',
          estado: 'pendiente',
          notas: ''
        });
      },
      error: () => {
        this.loading = false;
        this.message = 'No se pudo agendar la cita. Intenta nuevamente.';
=======
    const fecha = this.citaForm.value.fecha;

    this.citaService.validarCupoHorario(fecha, '').subscribe({
      next: (resultado) => {
        if (!resultado.disponible) {
          alert(`No hay cupo para ${this.formatearFechaCita(fecha)}. Cupo máximo por horario: ${resultado.cupoMaximo}.`);
          return;
        }

        const citaData = {
          fecha,
          motivo: this.citaForm.value.motivo.trim(),
          estado: 'pendiente'
        } as Cita;

        this.citaService.crearCita(citaData).subscribe({
          next: () => {
            this.cargarCitas();
            this.citaForm.reset({ fecha: '', motivo: '' });
            this.activeTab = 'citas';
          },
          error: (err) => {
            console.error('Error creando cita desde recepción:', err);
            alert('No se pudo guardar la cita.');
          }
        });
      },
      error: (err) => {
        console.error('Error validando cupo:', err);
        alert('No se pudo validar el cupo del horario.');
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925
      }
    });
  }

<<<<<<< HEAD
  actualizarEstado(cita: Cita, nuevoEstado: Cita['estado']): void {
    if (!cita.idCita) return;

    const citaActualizada: Cita = {
      ...cita,
      estado: nuevoEstado
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: (respuesta) => {
        this.citas = this.citas.map((item) => item.idCita === respuesta.idCita ? respuesta : item);
        this.message = `La cita de ${respuesta.motivo} pasó a estado ${respuesta.estado}.`;
      },
      error: () => {
        this.message = 'No se pudo actualizar el estado de la cita.';
      }
    });
  }

  cancelarCita(cita: Cita): void {
    if (!cita.idCita || !confirm('¿Deseas cancelar esta cita?')) {
      return;
    }

    this.citaService.cancelarCita(cita.idCita).subscribe({
      next: () => {
        this.citas = this.citas.filter((item) => item.idCita !== cita.idCita);
        this.message = 'Cita cancelada correctamente.';
      },
      error: () => {
        this.message = 'No se pudo cancelar la cita.';
=======
  confirmarCita(id: number): void {
    this.actualizarEstadoCita(id, 'Confirmada');
  }

  cancelarCita(id: number): void {
    this.actualizarEstadoCita(id, 'Cancelada');
  }

  private actualizarEstadoCita(id: number, estado: CitaEstado): void {
    const citaSeleccionada = this.citasHoy.find(cita => cita.id === id);
    if (!citaSeleccionada) {
      return;
    }

    const estadoApi: Cita['estado'] = estado === 'Confirmada'
      ? 'confirmada'
      : estado === 'Cancelada'
      ? 'cancelada'
      : 'pendiente';

    const citaActualizada = {
      fecha: citaSeleccionada.fecha,
      motivo: citaSeleccionada.motivo,
      estado: estadoApi
    } as Cita;

    this.citaService.actualizarCita(id, citaActualizada).subscribe({
      next: () => this.cargarCitas(),
      error: (err) => {
        console.error('Error actualizando estado de cita:', err);
        alert('No se pudo actualizar el estado de la cita.');
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925
      }
    });
  }

<<<<<<< HEAD
  goToDashboard(): void {
    this.cargarAgenda();
    this.dashboardSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  get recepcionistaEmail(): string {
    const firstName = (this.usuario?.nombre || 'recepcionista')
      .trim()
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    return `${firstName}@gmail.com`;
=======
  cargarCitas(): void {
    this.loading = true;
    this.error = null;

    this.citaService.obtenerTodas().subscribe({
      next: (citas) => {
        this.citasHoy = citas.map((cita) => ({
          id: cita.idCita || 0,
          fecha: cita.fecha,
          motivo: cita.motivo,
          estado: this.normalizarEstado(cita.estado)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando citas en recepción:', err);
        this.error = 'No se pudieron cargar las citas.';
        this.citasHoy = [];
        this.loading = false;
      }
    });
  }

  private normalizarEstado(estado: string): CitaEstado {
    switch ((estado || '').toLowerCase()) {
      case 'confirmada':
      case 'completada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  }

  private extraerServicio(motivo: string): string {
    const partes = (motivo || '').split(':');
    return partes.length > 1 ? partes[0].trim() : 'Consulta general';
  }

  formatearFechaCita(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
<<<<<<< HEAD
  }

  get filteredCitas(): Cita[] {
    return this.citas.filter((cita) => {
      const coincideEstado = this.selectedEstado === 'todos' || cita.estado === this.selectedEstado;
      const textoBusqueda = `${cita.motivo} ${cita.fecha} ${cita.hora}`.toLowerCase();
      const coincideBusqueda = !this.searchTerm || textoBusqueda.includes(this.searchTerm.toLowerCase());

      return coincideEstado && coincideBusqueda;
    });
  }

  get stats(): Array<{ label: string; value: number; icon: string }> {
    const pendientes = this.citas.filter((cita) => cita.estado === 'pendiente').length;
    const confirmadas = this.citas.filter((cita) => cita.estado === 'confirmada').length;
    const completadas = this.citas.filter((cita) => cita.estado === 'completada').length;
    const canceladas = this.citas.filter((cita) => cita.estado === 'cancelada').length;

    return [
      { label: 'Citas registradas', value: this.citas.length, icon: 'fa-calendar-check' },
      { label: 'Pendientes', value: pendientes, icon: 'fa-hourglass-half' },
      { label: 'Confirmadas', value: confirmadas, icon: 'fa-circle-check' },
      { label: 'Finalizadas', value: completadas, icon: 'fa-stethoscope' },
      { label: 'Canceladas', value: canceladas, icon: 'fa-circle-xmark' }
    ];
  }

  private obtenerCitasDeEjemplo(): Cita[] {
    const baseDate = new Date();
    const tomorrow = new Date(baseDate);
    tomorrow.setDate(baseDate.getDate() + 1);

    return [
      {
        idCita: 1,
        usuarioId: 101,
        mascotaId: 11,
        veterinarioId: 2,
        fecha: baseDate.toISOString().split('T')[0],
        hora: '09:30',
        motivo: 'Vacunación anual',
        estado: 'confirmada',
        notas: 'Cliente llegó puntual'
      },
      {
        idCita: 2,
        usuarioId: 102,
        mascotaId: 12,
        veterinarioId: 2,
        fecha: baseDate.toISOString().split('T')[0],
        hora: '12:00',
        motivo: 'Revisión general',
        estado: 'pendiente',
        notas: 'Pendiente de confirmación'
      },
      {
        idCita: 3,
        usuarioId: 103,
        mascotaId: 13,
        veterinarioId: 3,
        fecha: tomorrow.toISOString().split('T')[0],
        hora: '15:15',
        motivo: 'Corte de uñas',
        estado: 'pendiente',
        notas: 'Primera cita de la tarde'
      }
    ];
=======
>>>>>>> 83ec02c7e79424b96afa4ac46cfe360d34cef925
  }
}