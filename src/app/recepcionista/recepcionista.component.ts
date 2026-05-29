import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Usuario } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recepcionista.component.html',
  styleUrls: ['./recepcionista.component.scss']
})
export class RecepcionistaComponent implements OnInit {
  @ViewChild('dashboardSection') dashboardSection?: ElementRef<HTMLElement>;

  usuario: Usuario | null = null;
  citas: Cita[] = [];
  searchTerm = '';
  selectedEstado = 'todos';
  loading = false;
  message: string | null = null;
  citaForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private citaService: CitaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();

    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.citaForm = this.crearFormularioCita();
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.loading = true;
    this.message = null;

    this.citaService.obtenerTodas().pipe(
      catchError(() => of(this.obtenerCitasDeEjemplo()))
    ).subscribe({
      next: (citas: Cita[]) => {
        this.aplicarAgenda(citas);
      },
      error: () => {
        this.loading = false;
        this.message = 'No se pudo cargar la agenda. Mostrando datos de ejemplo.';
      }
    });
  }

  registrarCita(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const citaData = this.construirCitaDesdeFormulario();

    this.citaService.crearCita(citaData).subscribe({
      next: (cita) => {
        this.citas = this.ordenarCitas([cita, ...this.citas]);
        this.loading = false;
        this.message = `Cita para ${cita.motivo} agendada correctamente.`;
        this.resetearFormulario();
      },
      error: () => {
        this.loading = false;
        this.message = 'No se pudo agendar la cita. Intenta nuevamente.';
      }
    });
  }

  private crearFormularioCita(): FormGroup {
    return this.fb.group({
      mascotaId: [1, [Validators.required, Validators.min(1)]],
      fecha: [this.today, Validators.required],
      hora: ['09:00', Validators.required],
      veterinarioId: [1, [Validators.required, Validators.min(1)]],
      motivo: ['Revisión general', Validators.required],
      estado: ['pendiente', Validators.required],
      notas: ['']
    });
  }

  private aplicarAgenda(citas: Cita[]): void {
    const agenda = citas.length > 0 ? citas : this.obtenerCitasDeEjemplo();
    this.citas = this.ordenarCitas(agenda);
    this.loading = false;

    if (citas.length === 0) {
      this.message = 'No hay citas programadas en este momento. Mostrando datos de ejemplo.';
    } else {
      this.message = null;
    }
  }

  private construirCitaDesdeFormulario(): Cita {
    return {
      ...this.citaForm.value,
      usuarioId: this.usuario?.id ?? 1,
      mascotaId: Number(this.citaForm.value.mascotaId),
      veterinarioId: Number(this.citaForm.value.veterinarioId),
      estado: this.citaForm.value.estado as Cita['estado'],
      notas: this.citaForm.value.notas || undefined
    };
  }

  private resetearFormulario(): void {
    this.citaForm.reset({
      mascotaId: 1,
      fecha: this.today,
      hora: '09:00',
      veterinarioId: 1,
      motivo: 'Revisión general',
      estado: 'pendiente',
      notas: ''
    });
  }

  private ordenarCitas(citas: Cita[]): Cita[] {
    return [...citas].sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime());
  }

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
      }
    });
  }

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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
  }
}
