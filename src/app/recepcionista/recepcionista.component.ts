import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Usuario } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';
import { PagosFacturasComponent } from './pagos-facturas.component';

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PagosFacturasComponent],
  templateUrl: './recepcionista.component.html',
  styleUrls: ['./recepcionista.component.scss']
})
export class RecepcionistaComponent implements OnInit {
  @ViewChild('dashboardSection') dashboardSection?: ElementRef<HTMLElement>;

  activeTab: 'citas' | 'registro' | 'pagos' = 'citas';
  usuario: Usuario | null = null;
  readonly usuario$!: Observable<Usuario | null>;
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
  ) {
    this.usuario$ = this.authService.usuario$;
  }

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      this.usuario = usuario;
    });

    const usuarioActual = this.authService.obtenerUsuarioActual();

    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    this.citaForm = this.fb.group({
      mascotaId: [1, [Validators.required, Validators.min(1)]],
      fecha: [this.today, Validators.required],
      hora: ['09:00', Validators.required],
      veterinarioId: [1, [Validators.required, Validators.min(1)]],
      motivo: ['Revisión general', Validators.required],
      estado: ['pendiente' as any, Validators.required],
      notas: ['']
    });

    this.cargarAgenda();
  }

  setActiveTab(tab: 'citas' | 'registro' | 'pagos'): void {
    this.activeTab = tab;
  }

  cargarAgenda(): void {
    this.loading = true;
    this.message = null;
    this.citaService.obtenerTodas().pipe(
      catchError(() => of(this.obtenerCitasDeEjemplo()))
    ).subscribe({
      next: (citas: Cita[]) => {
        this.citas = [...citas].sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${(a as any).hora || '00:00'}`).getTime();
          const dateB = new Date(`${b.fecha}T${(b as any).hora || '00:00'}`).getTime();
          return dateA - dateB;
        });
        this.loading = false;
        if (this.citas.length === 0) this.message = 'No hay citas programadas.';
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al cargar la agenda.';
      }
    });
  }

  registrarCita(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const currentUser = this.authService.obtenerUsuarioActual();
    const citaData: any = {
      ...this.citaForm.value,
      usuarioId: currentUser?.id ?? currentUser?.userId ?? 1,
      mascotaId: Number(this.citaForm.value.mascotaId),
      veterinarioId: Number(this.citaForm.value.veterinarioId),
      estado: this.citaForm.value.estado,
      notas: this.citaForm.value.notas || undefined
    };

    this.citaService.crearCita(citaData).subscribe({
      next: (cita) => {
        this.citas = [cita, ...this.citas].sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${(a as any).hora || '00:00'}`).getTime();
          const dateB = new Date(`${b.fecha}T${(b as any).hora || '00:00'}`).getTime();
          return dateA - dateB;
        });
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
      }
    });
  }

  actualizarEstado(cita: Cita, nuevoEstado: Cita['estado']): void {
    if (!cita.idCita) return;
    const citaActualizada: Cita = { ...cita, estado: nuevoEstado };
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
    if (!cita.idCita || !confirm('¿Deseas cancelar esta cita?')) return;
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  obtenerAvatarInicial(nombre?: string): string {
    const valor = (nombre || 'Recepcionista').trim();
    return valor.charAt(0).toUpperCase();
  }

  obtenerCorreoRecepcion(nombre?: string): string {
    const primerNombre = (nombre || 'recepcionista')
      .trim()
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'recepcionista';

    return `${primerNombre}@gmail.com`;
  }

  get filteredCitas(): Cita[] {
    return this.citas.filter((cita) => {
      const coincideEstado = this.selectedEstado === 'todos' || cita.estado === this.selectedEstado;
      const textoBusqueda = `${cita.motivo} ${cita.fecha} ${(cita as any).hora || ''}`.toLowerCase();
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
      } as any,
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
      } as any,
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
      } as any
    ]
  }
}