import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['']
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.cargando = true;
      this.error = null;
      this.exito = null;

      const payload = {
        nombre: this.registerForm.value.nombre,
        correo: this.registerForm.value.email,
        clave: this.registerForm.value.password,
        telefono: this.registerForm.value.telefono
      };

      this.authService.register(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.cargando = false;

          if (!response.usuario || response.mensaje?.toLowerCase().includes('jdbc') || response.mensaje?.toLowerCase().includes('exception')) {
            this.error = response.mensaje || 'Error interno del servidor al registrar.';
            return;
          }

          this.exito = 'Registro exitoso. Redirigiendo...';
          setTimeout(() => {
            // Obtener el usuario actual después del registro
            const usuarioActual = this.authService.obtenerUsuarioActual();
            
            // Redirigir según el rol del usuario
            if (usuarioActual?.rol?.toLowerCase() === 'cliente') {
              this.router.navigate(['/cliente']);
            } else {
              this.router.navigate(['/home']);
            }
          }, 2000);
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error?.mensaje || 'Error al registrarse. Intenta de nuevo.';
          console.error('Error de registro:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }
}