import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Usuario } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { MascotaService } from '../Core/Service/mascota.service';
import { InventarioService } from '../Core/Service/inventario.service';
import { Cita } from '../Models/cita.model';
import { Mascota } from '../Models/mascota.model';
import { InventarioProducto } from '../Models/inventario.model';
import { PagosFacturasComponent } from './pagos-facturas.component';
import { DataTableComponent } from '../shared/data-table/data-table.component';

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PagosFacturasComponent, DataTableComponent],
  templateUrl: './recepcionista.component.html',
  styleUrls: ['./recepcionista.component.scss']
})
export class RecepcionistaComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardSection') dashboardSection?: ElementRef<HTMLElement>;
  private usuarioSub?: Subscription;

  activeTab: 'citas' | 'registro' | 'pagos' | 'inventario' = 'citas';
  sidebarOpen = false;
  usuario: Usuario | null = null;
  readonly usuario$!: Observable<Usuario | null>;
  citas: Cita[] = [];
  veterinarios: Usuario[] = [];
  vetSeleccionadoPorCita: Record<number, number> = {};
  searchTerm = '';
  selectedEstado = 'todos';
  loading = false;
  message: string | null = null;
  citaForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  // Inventario
  productos: InventarioProducto[] = [];

  // Autocomplete: clientes
  clientes: Usuario[] = [];
  clientesFiltrados: Usuario[] = [];
  clienteSearch = '';
  showClienteDropdown = false;
  clienteSeleccionado: Usuario | null = null;

  // Autocomplete: mascotas
  mascotas: Mascota[] = [];
  mascotasFiltradas: Mascota[] = [];
  mascotaSearch = '';
  showMascotaDropdown = false;
  mascotaSeleccionada: Mascota | null = null;

  // Autocomplete: veterinarios
  veterinariosFiltrados: Usuario[] = [];
  veterinarioSearch = '';
  showVeterinarioDropdown = false;
  veterinarioSeleccionado: Usuario | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private inventarioService: InventarioService,
    private router: Router
  ) {
    this.usuario$ = this.authService.usuario$;
  }

  ngOnInit(): void {
    this.usuarioSub = this.authService.usuario$.subscribe(u => { this.usuario = u; });

    const usuarioActual = this.authService.obtenerUsuarioActual();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    this.citaForm = this.fb.group({
      clienteId: [null, Validators.required],
      mascotaId: [null, Validators.required],
      fecha: [this.today, Validators.required],
      hora: ['09:00', Validators.required],
      veterinarioId: [null, Validators.required],
      motivo: ['Revisión general', Validators.required],
      estado: ['asignada'],
      notas: ['']
    });

    this.cargarAgenda();
    this.cargarUsuariosYVeterinarios();
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
  }

  setActiveTab(tab: 'citas' | 'registro' | 'pagos' | 'inventario'): void {
    this.activeTab = tab;
    this.sidebarOpen = false;
    if (tab === 'inventario') this.cargarInventario();
  }

  cargarInventario(): void {
    this.loading = true;
    this.inventarioService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message = 'No se pudo cargar el inventario.';
      }
    });
  }

  cargarAgenda(): void {
    this.loading = true;
    this.message = null;
    this.citaService.obtenerTodas().pipe(
      catchError(() => of([] as Cita[]))
    ).subscribe({
      next: (citas: Cita[]) => {
        this.citas = [...citas].sort((a, b) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        this.loading = false;
        if (this.citas.length === 0) this.message = 'No hay citas programadas.';
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al cargar la agenda.';
      }
    });
  }

  private cargarUsuariosYVeterinarios(): void {
    this.authService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios) => {
        this.veterinarios = usuarios.filter(u => u.rol === 'VETERINARIO');
        this.clientes = usuarios.filter(u => u.rol === 'CLIENTE');
      },
      error: () => {}
    });
  }

  onClienteFocus(): void {
    this.clientesFiltrados = this.clienteSearch.trim()
      ? this.clientes.filter(c => c.nombre?.toLowerCase().includes(this.clienteSearch.toLowerCase())).slice(0, 10)
      : this.clientes.slice(0, 10);
    this.showClienteDropdown = true;
  }

  onClienteSearchChange(term: string): void {
    this.clienteSearch = term;
    const lower = term.toLowerCase();
    this.clientesFiltrados = term.trim()
      ? this.clientes.filter(c => c.nombre?.toLowerCase().includes(lower)).slice(0, 10)
      : this.clientes.slice(0, 10);
    this.showClienteDropdown = true;
    if (this.clienteSeleccionado) {
      this.clienteSeleccionado = null;
      this.mascotaSeleccionada = null;
      this.mascotaSearch = '';
      this.mascotas = [];
      this.mascotasFiltradas = [];
      this.citaForm.patchValue({ clienteId: null, mascotaId: null });
    }
  }

  seleccionarCliente(cliente: Usuario): void {
    this.clienteSeleccionado = cliente;
    this.clienteSearch = cliente.nombre || '';
    this.showClienteDropdown = false;
    const clienteId = cliente.id ?? cliente.userId;
    this.citaForm.patchValue({ clienteId });
    this.mascotaSeleccionada = null;
    this.mascotaSearch = '';
    this.citaForm.patchValue({ mascotaId: null });
    if (clienteId) {
      this.mascotaService.obtenerMascotasPorUsuario(clienteId).subscribe({
        next: (mascotas) => {
          this.mascotas = mascotas;
          this.mascotasFiltradas = mascotas;
        },
        error: () => { this.mascotas = []; this.mascotasFiltradas = []; }
      });
    }
  }

  onClienteBlur(): void {
    setTimeout(() => { this.showClienteDropdown = false; }, 150);
  }

  onMascotaFocus(): void {
    this.mascotasFiltradas = this.mascotaSearch.trim()
      ? this.mascotas.filter(m => m.nombre.toLowerCase().includes(this.mascotaSearch.toLowerCase()))
      : this.mascotas;
    this.showMascotaDropdown = true;
  }

  onMascotaSearchChange(term: string): void {
    this.mascotaSearch = term;
    const lower = term.toLowerCase();
    this.mascotasFiltradas = term.trim()
      ? this.mascotas.filter(m => m.nombre.toLowerCase().includes(lower))
      : this.mascotas;
    this.showMascotaDropdown = true;
    if (this.mascotaSeleccionada) {
      this.mascotaSeleccionada = null;
      this.citaForm.patchValue({ mascotaId: null });
    }
  }

  seleccionarMascota(mascota: Mascota): void {
    this.mascotaSeleccionada = mascota;
    this.mascotaSearch = mascota.nombre;
    this.showMascotaDropdown = false;
    this.citaForm.patchValue({ mascotaId: mascota.idMascota ?? mascota.id_mascota });
  }

  onMascotaBlur(): void {
    setTimeout(() => { this.showMascotaDropdown = false; }, 150);
  }

  onVeterinarioFocus(): void {
    this.veterinariosFiltrados = this.veterinarioSearch.trim()
      ? this.veterinarios.filter(v => v.nombre?.toLowerCase().includes(this.veterinarioSearch.toLowerCase())).slice(0, 10)
      : this.veterinarios.slice(0, 10);
    this.showVeterinarioDropdown = true;
  }

  onVeterinarioSearchChange(term: string): void {
    this.veterinarioSearch = term;
    const lower = term.toLowerCase();
    this.veterinariosFiltrados = term.trim()
      ? this.veterinarios.filter(v => v.nombre?.toLowerCase().includes(lower)).slice(0, 10)
      : this.veterinarios.slice(0, 10);
    this.showVeterinarioDropdown = true;
    if (this.veterinarioSeleccionado) {
      this.veterinarioSeleccionado = null;
      this.citaForm.patchValue({ veterinarioId: null });
    }
  }

  seleccionarVeterinario(vet: Usuario): void {
    this.veterinarioSeleccionado = vet;
    this.veterinarioSearch = vet.nombre || '';
    this.showVeterinarioDropdown = false;
    this.citaForm.patchValue({ veterinarioId: vet.id ?? vet.userId });
  }

  onVeterinarioBlur(): void {
    setTimeout(() => { this.showVeterinarioDropdown = false; }, 150);
  }

  registrarCita(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const currentUser = this.authService.obtenerUsuarioActual();
    const recepcionistaId = currentUser?.id ?? currentUser?.userId;
    const citaData: any = {
      fecha: `${this.citaForm.value.fecha}T${this.citaForm.value.hora}:00`,
      motivo: this.citaForm.value.motivo,
      estado: this.citaForm.value.estado,
      notas: this.citaForm.value.notas || undefined,
      cliente: { id: Number(this.citaForm.value.clienteId) },
      mascota: { idMascota: Number(this.citaForm.value.mascotaId) },
      recepcionista: recepcionistaId ? { id: recepcionistaId } : undefined,
      veterinario: { id: Number(this.citaForm.value.veterinarioId) }
    };

    this.citaService.crearCita(citaData).subscribe({
      next: (cita) => {
        this.citas = [cita, ...this.citas].sort((a, b) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        this.loading = false;
        this.message = `Cita para "${cita.motivo}" agendada correctamente.`;
        this.citaForm.reset({
          clienteId: null, mascotaId: null, fecha: this.today, hora: '09:00',
          veterinarioId: null, motivo: 'Revisión general', estado: 'asignada', notas: ''
        });
        this.clienteSearch = '';
        this.mascotaSearch = '';
        this.veterinarioSearch = '';
        this.clienteSeleccionado = null;
        this.mascotaSeleccionada = null;
        this.veterinarioSeleccionado = null;
        this.mascotas = [];
        this.mascotasFiltradas = [];
      },
      error: () => {
        this.loading = false;
        this.message = 'No se pudo agendar la cita. Intenta nuevamente.';
      }
    });
  }

  // AC3: la recepcionista asigna un veterinario a una cita pendiente
  asignarVeterinario(cita: Cita): void {
    if (!cita.idCita) return;
    const vetId = this.vetSeleccionadoPorCita[cita.idCita];
    if (!vetId) { this.message = 'Selecciona un veterinario primero.'; return; }

    const currentUser = this.authService.obtenerUsuarioActual();
    const recepcionistaId = currentUser?.id ?? currentUser?.userId;

    const citaActualizada: any = {
      estado: 'asignada',
      veterinario: { id: Number(vetId) },
      recepcionista: recepcionistaId ? { id: recepcionistaId } : undefined
    };

    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: (respuesta) => {
        this.citas = this.citas.map(c => c.idCita === respuesta.idCita ? respuesta : c);
        delete this.vetSeleccionadoPorCita[cita.idCita!];
        this.message = 'Veterinario asignado correctamente.';
      },
      error: () => { this.message = 'No se pudo asignar el veterinario.'; }
    });
  }

  actualizarEstado(cita: Cita, nuevoEstado: Cita['estado']): void {
    if (!cita.idCita) return;
    const citaActualizada: Cita = { ...cita, estado: nuevoEstado };
    this.citaService.actualizarCita(cita.idCita, citaActualizada).subscribe({
      next: (respuesta) => {
        this.citas = this.citas.map(c => c.idCita === respuesta.idCita ? respuesta : c);
        this.message = `Cita actualizada a estado "${respuesta.estado}".`;
      },
      error: () => { this.message = 'No se pudo actualizar el estado de la cita.'; }
    });
  }

  // AC6: cancelar con observación obligatoria
  cancelarCita(cita: Cita): void {
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
      next: (respuesta) => {
        this.citas = this.citas.map(c => c.idCita === respuesta.idCita ? respuesta : c);
        this.message = 'Cita cancelada correctamente.';
      },
      error: () => { this.message = 'No se pudo cancelar la cita.'; }
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
    return ((nombre || 'R').trim().charAt(0)).toUpperCase();
  }

  obtenerCorreoRecepcion(nombre?: string): string {
    const p = (nombre || 'recepcionista').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'recepcionista';
    return `${p}@gmail.com`;
  }

  get filteredCitas(): Cita[] {
    return this.citas.filter(cita => {
      const coincideEstado = this.selectedEstado === 'todos' || cita.estado === this.selectedEstado;
      const texto = `${cita.motivo} ${cita.fecha} ${cita.cliente?.nombre || ''}`.toLowerCase();
      const coincideBusqueda = !this.searchTerm || texto.includes(this.searchTerm.toLowerCase());
      return coincideEstado && coincideBusqueda;
    });
  }

  trackByCitaId(_: number, cita: Cita): number {
    return cita.idCita ?? 0;
  }

  trackByUsuarioId(_: number, usuario: Usuario): number {
    return usuario.id ?? usuario.userId ?? 0;
  }

  trackByMascotaId(_: number, mascota: Mascota): number {
    return mascota.idMascota ?? mascota.id_mascota ?? 0;
  }

  trackByProductoId(_: number, producto: InventarioProducto): number {
    return producto.idInventarioMedicamento ?? 0;
  }

  get stats(): Array<{ label: string; value: number; icon: string }> {
    const pendientes = this.citas.filter(c => c.estado === 'pendiente').length;
    const asignadas = this.citas.filter(c => c.estado === 'asignada' || c.estado === 'confirmada').length;
    const completadas = this.citas.filter(c => c.estado === 'completada').length;
    const canceladas = this.citas.filter(c => c.estado === 'cancelada').length;
    return [
      { label: 'Total citas', value: this.citas.length, icon: 'fa-calendar-check' },
      { label: 'Pendientes', value: pendientes, icon: 'fa-hourglass-half' },
      { label: 'Asignadas', value: asignadas, icon: 'fa-circle-check' },
      { label: 'Finalizadas', value: completadas, icon: 'fa-stethoscope' },
      { label: 'Canceladas', value: canceladas, icon: 'fa-circle-xmark' }
    ];
  }
}
