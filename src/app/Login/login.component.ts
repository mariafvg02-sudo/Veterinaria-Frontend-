import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  cargando = false;
  error: string | null = null;
  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    
    const correo = this.loginForm.value.correo?.trim().toLowerCase();
    const clave = this.loginForm.value.clave;
    
    // 2. LOGICA NORMAL PARA EL RESTO DE ROLES (Clientes, Veterinarios, etc.)
    this.authService.login(correo, clave).subscribe({
      next: (response) => {
        this.cargando = false;
        // // Guardamos también un rol general por si tus otros guardians lo necesitan
        // localStorage.setItem('userRole', response.usuario?.rol?.toUpperCase() || 'CLIENTE');
        // // Normalizamos el rol para aceptar respuestas con o sin guion bajo.
        // const rolUsuario = response.usuario?.rol
        //   ?.toUpperCase()
        
        // Normalizamos el rol: elimina espacios y guiones bajos (ej: JEFE_INVENTARIO -> JEFEINVENTARIO)
        const rolFinal = (response.usuario?.rol || 'CLIENTE')
          .toUpperCase()
          .replace(/[_\s-]/g, '');

        // Guardamos el rol YA NORMALIZADO para que los Guards no fallen
        localStorage.setItem('userRole', rolFinal);

        switch (rolFinal) {
          case 'ADMINISTRADOR':
            this.router.navigate(['/administrador']);
            break;
          case 'VETERINARIO':
            this.router.navigate(['/veterinario']);
            break;
          case 'RECEPCIONISTA':
            this.router.navigate(['/recepcionista']);
            break;
          case 'JEFEINVENTARIO':
            this.router.navigate(['/jefe-inventario']);
            break;
          case 'CLIENTE':
            this.router.navigate(['/cliente']);
            break;
          default:
            this.router.navigate(['/cliente']); // Modificado para enviar a cliente por defecto
            break;
        }
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al iniciar sesión. Verifica tus credenciales.';
        console.error('Error de login:', err);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/olvido-clave']);
  }
}