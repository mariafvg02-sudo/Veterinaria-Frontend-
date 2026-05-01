import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VeterinarioService } from '../Service/veterinario.service';
import { Veterinario } from '../Models/veterinario.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './veterinario.component.html',
  styleUrls: ['./veterinario.component.scss']
})
export class VeterinarioComponent implements OnInit {
  veterinarios: Veterinario[] = [];
  cargando = false;
  error = '';
  mensaje = '';
  editandoId: number | null = null;
  mostrarForm = false;
  searchTerm = '';

  veterinarioForm = this.fb.group({
    nombre: ['', Validators.required],
    especialidad: ['', Validators.required],
    telefono: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    documentoIdentidad: [0, Validators.required],
    clave: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private veterinarioService: VeterinarioService) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
  }

  cargarVeterinarios(): void {
    this.cargando = true;
    this.veterinarioService.obtenerTodos().subscribe({
      next: (data) => {
        this.veterinarios = data;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.obtenerMensajeError(err, 'No se pudo cargar la lista');
        this.cargando = false;
      }
    });
  }

  cargarVeterinarioPorId(id: number): void {
    this.veterinarioService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.veterinarioForm.patchValue(data);
      },
      error: (err) => {
        this.error = 'No se pudo obtener el veterinario específico';
      }
    });
  }

  guardar(): void {
    if (this.veterinarioForm.invalid) return;

    const payload = this.veterinarioForm.getRawValue() as Veterinario;

    if (this.editandoId !== null) {
      this.veterinarioService.actualizar(this.editandoId, payload).subscribe({
        next: () => {
          this.mensaje = 'Actualizado exitosamente';
          this.cancelarEdicion();
          this.cargarVeterinarios();
          this.mostrarForm = false;
        },
        error: (err) => {
          this.error = this.obtenerMensajeError(err, 'Error al actualizar');
        }
      });
    } else {
      this.veterinarioService.guardar(payload).subscribe({
        next: () => {
          this.mensaje = 'Creado exitosamente';
          this.veterinarioForm.reset();
          this.cargarVeterinarios();
          this.mostrarForm = false;
        },
        error: (err) => {
          this.error = this.obtenerMensajeError(err, 'Error al guardar');
        }
      });
    }
  }

  iniciarEdicion(v: Veterinario): void {
    this.editandoId = v.idVeterinario ?? null;
    this.mostrarForm = true;
    this.veterinarioForm.patchValue({
      nombre: v.nombre,
      especialidad: v.especialidad,
      telefono: v.telefono,
      correo: v.correo,
      documentoIdentidad: v.documentoIdentidad,
      clave: ''
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.veterinarioForm.reset();
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este veterinario?')) {
      this.veterinarioService.eliminar(id).subscribe({
        next: () => {
          this.mensaje = 'Eliminado exitosamente';
          this.cargarVeterinarios();
        },
        error: (err) => {
          this.error = this.obtenerMensajeError(err, 'Error al eliminar');
        }
      });
    }
  }

  mostrarFormulario(): void {
    this.mostrarForm = true;
    this.cancelarEdicion();
  }

  ocultarFormulario(): void {
    this.mostrarForm = false;
    this.cancelarEdicion();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
  }

  private obtenerMensajeError(err: HttpErrorResponse, fallback: string): string {
    return err.error?.message || fallback;
  }
}