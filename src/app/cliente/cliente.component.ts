import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../Service/auth.service';
import { MascotaService } from '../Service/mascota.service';
import { CitaService } from '../Service/cita.service';
import { Mascota } from '../Models/mascota.model';
import { Cita } from '../Models/cita.model';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent implements OnInit {
  usuario: Usuario | null = null;
  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  proximaCita: Cita | null = null;
  currentView: string = 'dashboard';
  
  mascotaForm!: FormGroup;
  citaForm!: FormGroup;
  mascotaEditando: Mascota | null = null;

  constructor(
    private authService: AuthService,
    private mascotaService: MascotaService,
    private citaService: CitaService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    try {
      this.usuario = this.authService.obtenerUsuarioActual();
      if (!this.usuario) {
        console.warn('No authenticated user found');
        this.router.navigate(['/login']);
        return;
      }
      
      console.log('Usuario autenticado:', this.usuario);
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
      descripcion: ['']
    });

    this.citaForm = this.fb.group({
      mascotaId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      motivo: ['', Validators.required]
    });
  }

  cargarDatos(): void {
    if (!this.usuario) return;

    // Intentamos obtener el ID del usuario de las posibles propiedades (id o Userid)
    const userId = this.usuario.id || this.usuario.Userid;

    if (!userId) {
      console.error('No se pudo cargar los datos: ID de usuario no encontrado', this.usuario);
      return;
    }
    
    // Cargar mascotas
    this.mascotaService.obtenerMascotasPorUsuario(userId).subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas;
        console.log('Mascotas cargadas:', this.mascotas);
      },
      error: (err) => {
        console.error('Error cargando mascotas:', err);
        this.mascotas = [];
      }
    });

    // Cargar citas
    this.citaService.obtenerCitasPorUsuario(userId).subscribe({
      next: (citas) => {
        this.citas = citas.sort((a, b) => 
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        this.proximaCita = this.citas.find(c => c.estado?.toLowerCase() === 'confirmada' || c.estado?.toLowerCase() === 'pendiente') || null;
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        this.citas = [];
      }
    });
  }

  setView(view: string): void {
    this.currentView = view;
    if (view === 'nueva-mascota') {
      this.mascotaEditando = null;
      this.mascotaForm.reset();
    } else if (view === 'nueva-cita') {
      this.citaForm.reset();
    }
  }

  guardarMascota(): void {
    if (!this.mascotaForm.valid || !this.usuario) return;

    const userId = this.usuario.id || this.usuario.Userid;

    if (!userId) {
      alert('Error: Sesión de usuario no válida (ID no encontrado)');
      return;
    }

    const mascotaData: Mascota = {
      ...this.mascotaForm.value,
      usuarioId: userId
    };

    if (this.mascotaEditando?.idMascota) {
      // Actualizar mascota existente
      this.mascotaService.actualizarMascota(this.mascotaEditando.idMascota, mascotaData).subscribe({
        next: () => {
          this.cargarDatos();
          this.setView('mascotas');
        },
        error: (err) => console.error('Error actualizando mascota:', err)
      });
    } else {
      // Crear nueva mascota
      this.mascotaService.crearMascota(mascotaData).subscribe({
        next: () => {
          this.cargarDatos();
          this.setView('mascotas');
        },
        error: (err) => console.error('Error creando mascota:', err)
      });
    }
  }

  editarMascota(mascota: Mascota): void {
    this.mascotaEditando = mascota;
    this.mascotaForm.patchValue(mascota);
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

    const userId = this.usuario.id || this.usuario.Userid;

    if (!userId) {
      alert('Error: No se puede agendar cita sin ID de usuario');
      return;
    }

    const citaData: Cita = {
      ...this.citaForm.value,
      usuarioId: userId,
      mascotaId: parseInt(this.citaForm.value.mascotaId),
      veterinarioId: 1, // Por defecto, el backend asignará un veterinario
      estado: 'pendiente'
    };

    this.citaService.crearCita(citaData).subscribe({
      next: () => {
        this.cargarDatos();
        this.setView('citas');
      },
      error: (err) => console.error('Error creando cita:', err)
    });
  }

  cancelarCita(id: number): void {
    if (confirm('¿Deseas cancelar esta cita?')) {
      this.citaService.cancelarCita(id).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => console.error('Error cancelando cita:', err)
      });
    }
  }

  getMascotaNombre(mascotaId: number): string {
    return this.mascotas.find(m => m.idMascota === mascotaId)?.nombre || 'Mascota desconocida';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}