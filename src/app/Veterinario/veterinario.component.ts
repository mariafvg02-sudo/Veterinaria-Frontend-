import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './veterinario.component.html',
  styleUrls: ['../administrador/administrador.component.scss'] // Reutilizamos estilos
})
export class VeterinarioComponent implements OnInit {
  activeTab: string = 'agenda';

  citasHoy: Array<{
    idCita?: number;
    fecha: string;
    motivo: string;
    paciente?: string;
    dueno?: string;
    estado: 'Pendiente' | 'En consulta' | 'Completada' | 'Cancelada';
  }> = [];

  filterText: string = '';
  loading = false;
  error: string | null = null;
  usuarioId: number | null = null;

  get filteredCitas() {
    const q = (this.filterText || '').trim().toLowerCase();
    if (!q) return this.citasHoy;
    return this.citasHoy.filter(c => ((c.paciente || '') + ' ' + (c.dueno || '') + ' ' + (c.motivo || '')).toLowerCase().includes(q));
  }

  get citasPendientes(): number {
    return this.citasHoy.filter(cita => cita.estado === 'Pendiente').length;
  }

  get citasEnConsulta(): number {
    return this.citasHoy.filter(cita => cita.estado === 'En consulta').length;
  }

  get citasCompletadas(): number {
    return this.citasHoy.filter(cita => cita.estado === 'Completada').length;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.usuarioId = usuario?.userId || null;
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
          paciente: (cita as any).paciente || 'N/A',
          dueno: (cita as any).dueno || 'N/A',
          estado: this.normalizarEstado(cita.estado)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando citas del veterinario:', err);
        this.error = 'No se pudieron cargar las citas desde el servidor.';
        this.citasHoy = [];
        this.loading = false;
      }
    });
  }

  atenderCita(cita: any) {
    if (!cita.idCita) {
      alert('La cita no tiene ID para actualizarse.');
      return;
    }

    if (!confirm(`Iniciar consulta para ${cita.paciente}?`)) return;

    const citaActualizada: Cita = {
      fecha: cita.fecha,
      motivo: cita.motivo,
      estado: 'completada'
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: () => {
        this.cargarCitas();
      },
      error: (err) => {
        console.error('Error actualizando cita:', err);
        alert('No se pudo actualizar la cita.');
      }
    });
  }

  cambiarEstado(cita: any, nuevoEstado: string) {
    if (!cita.idCita) return;
    if (!confirm(`Cambiar estado de ${cita.paciente} a "${nuevoEstado}"?`)) return;

    const citaActualizada: Cita = {
      fecha: cita.fecha,
      motivo: cita.motivo,
      estado: this.normalizarEstadoApi(nuevoEstado)
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: () => {
        this.cargarCitas();
      },
      error: (err) => {
        console.error('Error cambiando estado:', err);
        alert('No se pudo cambiar el estado.');
      }
    });
  }

  private normalizarEstado(estado: string): 'Pendiente' | 'En consulta' | 'Completada' | 'Cancelada' {
    switch ((estado || '').toLowerCase()) {
      case 'confirmada':
      case 'pendiente':
        return 'Pendiente';
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

  private normalizarEstadoApi(estado: string): Cita['estado'] {
    switch ((estado || '').toLowerCase()) {
      case 'en consulta':
        return 'confirmada';
      case 'completada':
        return 'completada';
      case 'cancelada':
        return 'cancelada';
      default:
        return 'pendiente';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}