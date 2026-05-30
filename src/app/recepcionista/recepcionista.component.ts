import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';
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
  citas: Cita[] = [];
  loading = false;
  error: string | null = null;
  citaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private citaService: CitaService,
    private router: Router
  ) {
    this.citaForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['09:00', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading = true;
    this.error = null;

    this.citaService.obtenerTodas().subscribe({
      next: (citas) => {
        this.citas = citas || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando citas:', err);
        this.error = 'No se pudieron cargar las citas.';
        this.loading = false;
      }
    });
  }

  registrarCita(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    const dto: Cita = {
      fecha: this.citaForm.value.fecha,
      hora: this.citaForm.value.hora,
      motivo: this.citaForm.value.motivo,
      estado: 'pendiente'
    };

    this.citaService.crearCita(dto).subscribe({
      next: (cita) => {
        this.citas = [cita, ...this.citas];
        this.citaForm.reset({ fecha: '', hora: '09:00', motivo: '' });
      },
      error: (err) => {
        console.error('Error creando cita:', err);
        alert('No se pudo crear la cita.');
      }
    });
  }

  cancelarCita(id?: number): void {
    if (!id) return;

    if (!confirm('¿Deseas cancelar esta cita?')) {
      return;
    }

    this.citaService.cancelarCita(id).subscribe({
      next: () => this.cargarCitas(),
      error: (err) => {
        console.error('Error cancelando cita:', err);
        alert('No se pudo cancelar la cita.');
      }
    });
  }
}
