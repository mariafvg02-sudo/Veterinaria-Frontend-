import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../Core/Service/auth.service';
import { MascotaService } from '../Core/Service/mascota.service';
import { CitaService } from '../Core/Service/cita.service';
import { HistorialMedicoService } from '../Core/Service/historial-medico.service';
import { Mascota } from '../Models/mascota.model';
import { Cita } from '../Models/cita.model';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent implements OnInit {
  private authService = inject(AuthService);
  private mascotaService = inject(MascotaService);
  private citaService = inject(CitaService);
  private historialService = inject(HistorialMedicoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private static readonly dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  private static readonly dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  usuario: Usuario | null = null;
  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  proximaCita: Cita | null = null;
  currentView: string = 'dashboard';
  sidebarOpen = false;
  mascotaSeleccionada: Mascota | null = null;
  busquedaMascota = '';
  filtroEspecie = 'Todas';
  cargandoMascotas = false;
  cargandoCitas = false;
  mostrarDetalleError = false;
  detalleError = '';
  errorCarga = '';
  
  mascotaForm!: FormGroup;
  citaForm!: FormGroup;
  mascotaEditando: Mascota | null = null;

  // Historial médico
  historiales: any[] = [];
  cargandoHistorial = false;
  filtroMascotaHistorial = 0;

  ngOnInit(): void {
    try {
      this.usuario = this.authService.obtenerUsuarioActual();
      if (!this.usuario) {
        console.warn('No authenticated user found');
        this.router.navigate(['/login']);
        return;
      }
      
      this.inicializarFormularios();
      this.cargarDatos();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.router.navigate(['/login']);
    }
  }

  inicializarFormularios(): void {
    this.mascotaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      edad: [0, [Validators.required, Validators.min(0)]],
      peso: [0, [Validators.required, Validators.min(0)]],
      sexo: ['', Validators.required],
      esterilizado: [false],
      descripcion: [''],
      vacunas: ['']
    });

    this.citaForm = this.fb.group({
      mascotaId: ['', Validators.required],
      fechaFecha: ['', Validators.required],
      fechaHora: ['', Validators.required],
      motivo: ['', Validators.required]
    });
  }

  cargarDatos(): void {
    if (!this.usuario) return;

    // Intentamos obtener el ID del usuario de las posibles propiedades del backend.
    const userId = this.obtenerUsuarioId();

    if (!userId) {
      console.error('No se pudo cargar los datos: ID de usuario no encontrado', this.usuario);
      return;
    }

    this.errorCarga = '';
    this.cargandoMascotas = true;
    this.cargandoCitas = true;
    
    // Cargar mascotas
    this.mascotaService.obtenerMascotasPorUsuario(userId).subscribe({
      next: (mascotas) => {
        // Ordenar mascotas de forma descendente (ID más alto primero)
        this.mascotas = mascotas
          .map((mascota) => this.normalizarMascota(mascota))
          .sort((a, b) => (this.obtenerMascotaId(b) || 0) - (this.obtenerMascotaId(a) || 0));
        this.mascotaSeleccionada = this.mascotaSeleccionada
          ? this.mascotas.find(m => this.obtenerMascotaId(m) === this.obtenerMascotaId(this.mascotaSeleccionada)) || this.mascotas[0] || null
          : this.mascotas[0] || null;
        this.cargandoMascotas = false;
        try {
          localStorage.setItem('mascotas_cache', JSON.stringify(this.mascotas));
        } catch (e) {
          console.warn('No se pudo guardar caché de mascotas:', e);
        }
      },
      error: (err) => {
        console.error('Error cargando mascotas:', err);
        // Intentar cargar desde caché local
        const cached = localStorage.getItem('mascotas_cache');
        if (cached) {
          try {
            this.mascotas = JSON.parse(cached) as Mascota[];
            this.mascotas = this.mascotas.map(m => this.normalizarMascota(m));
            this.mascotaSeleccionada = this.mascotas[0] || null;
            this.errorCarga = 'No se pudieron cargar las mascotas desde el servidor. Mostrando datos en caché.';
          } catch (parseErr) {
            console.error('Error parseando caché de mascotas:', parseErr);
            this.mascotas = [];
            this.mascotaSeleccionada = null;
            this.errorCarga = 'No se pudieron cargar las mascotas.';
          }
        } else {
          this.mascotas = [];
          this.mascotaSeleccionada = null;
          this.errorCarga = 'No se pudieron cargar las mascotas.';
        }
        this.detalleError = err?.message || (err?.statusText ? `${err.status} ${err.statusText}` : JSON.stringify(err));
        this.mostrarDetalleError = false;
        this.cargandoMascotas = false;
      }
    });

    // Cargar citas
    this.citaService.obtenerCitasPorUsuario(userId).subscribe({
      next: (citas) => {
        // Cambio a orden descendente: b - a (La más nueva de primera)
        this.citas = citas.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.proximaCita = this.citas.find(c => c.estado?.toLowerCase() === 'confirmada' || c.estado?.toLowerCase() === 'pendiente') || null;
        this.cargandoCitas = false;
        try {
          localStorage.setItem('citas_cache', JSON.stringify(this.citas));
        } catch (e) {
          console.warn('No se pudo guardar caché de citas:', e);
        }
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        const cached = localStorage.getItem('citas_cache');
        if (cached) {
          try {
            this.citas = JSON.parse(cached) as Cita[];
            this.proximaCita = this.citas.find(c => c.estado?.toLowerCase() === 'confirmada' || c.estado?.toLowerCase() === 'pendiente') || null;
            this.errorCarga = this.errorCarga || 'No se pudieron cargar las citas desde el servidor. Mostrando datos en caché.';
          } catch (parseErr) {
            console.error('Error parseando caché de citas:', parseErr);
            this.citas = [];
          }
        } else {
          this.citas = [];
        }
        this.detalleError = this.detalleError || err?.message || (err?.statusText ? `${err.status} ${err.statusText}` : JSON.stringify(err));
        this.mostrarDetalleError = false;
        this.cargandoCitas = false;
      }
    });
  }

  reintentarCarga(): void {
    this.errorCarga = '';
    this.detalleError = '';
    this.mostrarDetalleError = false;
    this.cargarDatos();
  }

  toggleDetalleError(): void {
    this.mostrarDetalleError = !this.mostrarDetalleError;
  }

  setView(view: string): void {
    this.currentView = view;
    this.sidebarOpen = false;
    if (view === 'nueva-mascota') {
      this.mascotaEditando = null;
      this.mascotaForm.reset({
        nombre: '',
        especie: '',
        raza: '',
        edad: 0,
        peso: 0,
        sexo: '',
        esterilizado: false,
        descripcion: '',
        vacunas: ''
      });
    } else if (view === 'mascotas' && !this.mascotaSeleccionada && this.mascotas.length > 0) {
      this.mascotaSeleccionada = this.mascotas[0];
    } else if (view === 'historial') {
      this.cargarHistorial();
    } else if (view === 'nueva-cita') {
      this.citaForm.reset({
        mascotaId: '',
        fechaFecha: '',
        fechaHora: '',
        motivo: ''
      });
    }
  }

  seleccionarMascota(mascota: Mascota): void {
    this.mascotaSeleccionada = mascota;
  }

  actualizarBusquedaMascota(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.busquedaMascota = input.value;
  }

  actualizarFiltroEspecie(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEspecie = select.value;
  }

  guardarMascota(): void {
    if (!this.mascotaForm.valid || !this.usuario) return;

    const userId = this.obtenerUsuarioId();

    if (!userId) {
      alert('Error: Sesión de usuario no válida (ID no encontrado)');
      return;
    }

    const idCliente = Number(userId);
    const idVeterinario = this.mascotaEditando?.idVeterinario ?? this.mascotaEditando?.id_veterinario ?? null;

    const mascotaData: Mascota = {
      nombre: this.mascotaForm.value.nombre?.trim(),
      especie: this.mascotaForm.value.especie,
      raza: this.mascotaForm.value.raza,
      edad: Number(this.mascotaForm.value.edad ?? 0),
      peso: Number(this.mascotaForm.value.peso ?? 0),
      sexo: this.mascotaForm.value.sexo,
      esterilizado: !!this.mascotaForm.value.esterilizado,
      descripcion: this.mascotaForm.value.descripcion?.trim() ?? '',
      vacunas: this.formatearVacunasParaFormulario(this.mascotaForm.value.vacunas),
      usuarioId: idCliente,
      idCliente,
      id_cliente: idCliente,
      idVeterinario,
      id_veterinario: idVeterinario,
      id_mascota: this.mascotaEditando?.id_mascota,
      idMascota: this.mascotaEditando?.idMascota
    };

    this.errorCarga = '';

    const mascotaId = this.obtenerMascotaId(this.mascotaEditando || undefined);

    if (mascotaId) {
      // Actualizar mascota existente
      this.mascotaService.actualizarMascota(mascotaId, mascotaData).subscribe({
        next: () => {
          this.cargarDatos();
          this.setView('mascotas');
          alert('Mascota actualizada correctamente.');
        },
        error: (err) => {
          console.error('Error actualizando mascota:', err);
          alert('Error actualizando mascota: ' + (err?.message || JSON.stringify(err)));
        }
      });
    } else {
      // Crear nueva mascota
      this.mascotaService.crearMascota(mascotaData).subscribe({
        next: () => {
          this.cargarDatos();
          this.setView('mascotas');
          alert('Mascota creada correctamente.');
        },
        error: (err) => {
          console.error('Error creando mascota:', err);
          alert('Error creando mascota: ' + (err?.error?.message || err?.message || JSON.stringify(err)));
        }
      });
    }
  }

  editarMascota(mascota: Mascota): void {
    this.mascotaEditando = mascota;
    this.mascotaForm.patchValue({
      nombre: mascota.nombre ?? '',
      especie: mascota.especie ?? '',
      raza: mascota.raza ?? '',
      edad: mascota.edad ?? 0,
      peso: mascota.peso ?? 0,
      sexo: mascota.sexo ?? '',
      esterilizado: mascota.esterilizado ?? false,
      descripcion: mascota.descripcion ?? '',
      vacunas: this.formatearVacunasParaFormulario(mascota.vacunas)
    });
    this.setView('editar-mascota');
  }

  eliminarMascota(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta mascota?')) {
      this.mascotaService.eliminarMascota(id).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => console.error('Error eliminando mascota:', err)
      });
    }
  }

  crearCita(): void {
    if (!this.citaForm.valid || !this.usuario) return;

    const userId = this.obtenerUsuarioId();

    if (!userId) {
      alert('Error: No se puede agendar cita sin ID de usuario');
      return;
    }

    const fechaISO = `${this.citaForm.value.fechaFecha}T${this.citaForm.value.fechaHora}:00`;

    const citaData: Cita = {
      fecha: fechaISO,
      motivo: this.citaForm.value.motivo.trim(),
      estado: 'pendiente',
      cliente: { id: userId, nombre: this.usuario.nombre },
      mascota: { idMascota: Number(this.citaForm.value.mascotaId) }
    };

    this.citaService.validarCupoHorario(citaData.fecha, '').subscribe({
      next: (resultado) => {
        if (!resultado.disponible) {
          alert(`No hay cupo disponible para ${this.formatearFechaCita(citaData.fecha)}. Cupo máximo por horario: ${resultado.cupoMaximo}.`);
          return;
        }

        this.citaService.crearCita(citaData).subscribe({
          next: () => {
            this.cargarDatos();
            this.setView('citas');
          },
          error: (err) => console.error('Error creando cita:', err)
        });
      },
      error: (err) => {
        console.error('Error validando cupo de cita:', err);
        alert('No se pudo validar el cupo para el horario seleccionado.');
      }
    });
  }

  // AC5: el cliente solo puede cancelar si la cita aún está en estado "pendiente"
  cancelarCita(id: number): void {
    const cita = this.citas.find(c => c.idCita === id);
    if (!cita) return;

    if (cita.estado === 'asignada') {
      alert('No puedes cancelar esta cita porque ya tiene un veterinario asignado.');
      return;
    }

    if (confirm('¿Deseas cancelar esta cita?')) {
      const citaActualizada: Cita = { ...cita, estado: 'cancelada' };
      this.citaService.actualizarCita(id, citaActualizada).subscribe({
        next: () => { this.cargarDatos(); },
        error: (err) => console.error('Error cancelando cita:', err)
      });
    }
  }

  obtenerUsuarioId(): number | null {
    const usuario = this.usuario;
    const userId = usuario?.userId ?? usuario?.id ?? (usuario as { idUsuario?: number; id_usuario?: number; userid?: number; Userid?: number })?.idUsuario ?? (usuario as { idUsuario?: number; id_usuario?: number; userid?: number; Userid?: number })?.id_usuario ?? (usuario as { idUsuario?: number; id_usuario?: number; userid?: number; Userid?: number })?.userid ?? (usuario as { idUsuario?: number; id_usuario?: number; userid?: number; Userid?: number })?.Userid ?? null;

    if (userId === null || userId === undefined || Number.isNaN(Number(userId))) {
      return null;
    }

    return Number(userId);
  }

  obtenerMascotaId(mascota?: Mascota | null): number | null {
    if (!mascota) return null;
    return mascota.idMascota || mascota.id_mascota || null;
  }

  obtenerIdCliente(mascota: Mascota): number | null {
    return mascota.usuarioId || mascota.idCliente || mascota.id_cliente || null;
  }

  obtenerIdVeterinario(mascota: Mascota): number | null {
    return mascota.idVeterinario || mascota.id_veterinario || null;
  }

  normalizarMascota(mascota: Mascota): Mascota {
    const usuarioId = this.obtenerUsuarioId();
    return {
      ...mascota,
      idMascota: mascota.idMascota ?? mascota.id_mascota,
      id_mascota: mascota.id_mascota ?? mascota.idMascota,
      usuarioId: mascota.usuarioId ?? mascota.idCliente ?? mascota.id_cliente ?? usuarioId ?? undefined,
      idCliente: mascota.idCliente ?? mascota.id_cliente ?? mascota.usuarioId ?? usuarioId ?? undefined,
      id_cliente: mascota.id_cliente ?? mascota.idCliente ?? mascota.usuarioId ?? usuarioId ?? undefined,
      idVeterinario: mascota.idVeterinario ?? mascota.id_veterinario ?? null,
      id_veterinario: mascota.id_veterinario ?? mascota.idVeterinario ?? null,
      sexo: mascota.sexo ?? '',
      esterilizado: mascota.esterilizado ?? false,
      descripcion: mascota.descripcion ?? '',
      vacunas: this.formatearVacunas(mascota.vacunas)
    };
  }

  formatearVacunas(vacunas: unknown): string[] {
    if (Array.isArray(vacunas)) {
      return vacunas.map(vacuna => String(vacuna).trim()).filter(Boolean);
    }

    if (typeof vacunas === 'string') {
      return vacunas
        .split(',')
        .map(vacuna => vacuna.trim())
        .filter(Boolean);
    }

    return [];
  }

  formatearVacunasParaFormulario(vacunas: unknown): string {
    return this.formatearVacunas(vacunas).join(', ');
  }

  get mascotasMostradas(): Mascota[] {
    const busqueda = this.busquedaMascota.trim().toLowerCase();
    return this.mascotas.filter(mascota => {
      const coincideBusqueda = !busqueda || [
        mascota.nombre,
        mascota.especie,
        mascota.raza,
        String(this.obtenerMascotaId(mascota) ?? ''),
        String(this.obtenerIdCliente(mascota) ?? ''),
        String(this.obtenerIdVeterinario(mascota) ?? '')
      ].some(valor => (valor || '').toLowerCase().includes(busqueda));

      const coincideEspecie = this.filtroEspecie === 'Todas' || (mascota.especie || '').toLowerCase() === this.filtroEspecie.toLowerCase();

      return coincideBusqueda && coincideEspecie;
    });
  }

  get especiesDisponibles(): string[] {
    const especies = new Set(this.mascotas.map(mascota => (mascota.especie || '').trim()).filter(Boolean));
    return ['Todas', ...Array.from(especies)];
  }

  get mascotasConVeterinario(): number {
    return this.mascotas.filter(mascota => this.obtenerIdVeterinario(mascota) !== null).length;
  }

  getMascotaResumen(mascota: Mascota): string {
    const partes = [
      mascota.raza,
      mascota.edad !== undefined && mascota.edad !== null ? `${mascota.edad} años` : '',
      mascota.peso !== undefined && mascota.peso !== null ? `${mascota.peso} kg` : ''
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(' · ') : 'Sin datos suficientes';
  }

  getMascotaEtiqueta(mascota: Mascota): string {
    return `${mascota.especie || 'Mascota'} #${this.obtenerMascotaId(mascota) ?? 'N/D'}`;
  }

  getMascotaNombre(mascotaId: number): string {
    return this.mascotas.find(m => this.obtenerMascotaId(m) === mascotaId)?.nombre || 'Mascota desconocida';
  }

  getMascotasPorEspecie(especie: string): number {
    return this.mascotas.filter(m => m.especie?.toLowerCase() === especie.toLowerCase()).length;
  }

  getCitasPorEstado(estado: Cita['estado']): number {
    return this.citas.filter(cita => cita.estado === estado).length;
  }

  getEstadoClase(estado?: string): string {
    return `badge-${estado || 'pendiente'}`;
  }

  getEstadoEtiqueta(estado?: string): string {
    switch ((estado || 'pendiente').toLowerCase()) {
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return 'Pendiente';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;
    return ClienteComponent.dateFormatter.format(date);
  }

  formatearFechaCita(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;
    return ClienteComponent.dateTimeFormatter.format(date);
  }

  getProximaCitaResumen(): string {
    if (!this.proximaCita) return 'No tienes citas próximas';
    return this.formatearFechaCita(this.proximaCita.fecha);
  }

  readonly horariosDisponibles: string[] = (() => {
    const horarios: string[] = [];
    for (let h = 7; h <= 20; h++) {
      horarios.push(`${String(h).padStart(2, '0')}:00`);
      if (h < 20) horarios.push(`${String(h).padStart(2, '0')}:30`);
    }
    return horarios;
  })();

  // ── HISTORIAL MÉDICO ──

  cargarHistorial(): void {
    const userId = this.obtenerUsuarioId();
    if (!userId) return;

    this.cargandoHistorial = true;
    this.historialService.getHistorialesPorCliente(userId).subscribe({
      next: (data) => {
        this.historiales = data.sort((a: any, b: any) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.cargandoHistorial = false;
      },
      error: () => {
        this.historiales = [];
        this.cargandoHistorial = false;
      }
    });
  }

  get mascotasConHistorial(): string[] {
    const nombres = new Set(
      this.historiales.map((h: any) => h.mascota?.nombre).filter(Boolean)
    );
    return Array.from(nombres).sort();
  }

  get historialesFiltrados(): any[] {
    if (!this.filtroMascotaHistorial) return this.historiales;
    return this.historiales.filter(
      (h: any) => h.mascota?.idMascota === this.filtroMascotaHistorial
    );
  }

  get historialesAgrupados(): { mascota: string; mascotaId: number; registros: any[] }[] {
    const mapa = new Map<number, { mascota: string; mascotaId: number; registros: any[] }>();
    for (const h of this.historialesFiltrados) {
      const id = h.mascota?.idMascota || 0;
      const nombre = h.mascota?.nombre || 'Mascota desconocida';
      if (!mapa.has(id)) {
        mapa.set(id, { mascota: nombre, mascotaId: id, registros: [] });
      }
      mapa.get(id)!.registros.push(h);
    }
    return Array.from(mapa.values());
  }

  trackByCitaId(_: number, cita: Cita): number {
    return cita.idCita ?? 0;
  }

  trackByMascotaId = (_: number, mascota: Mascota): number => {
    return this.obtenerMascotaId(mascota) ?? 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}