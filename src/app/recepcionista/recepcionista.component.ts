import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recepcionista.component.html',
  styleUrls: ['../administrador/administrador.component.scss']
})
export class RecepcionistaComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

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
      }
    });
  }

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
      }
    });
  }

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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}