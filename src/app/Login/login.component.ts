import { Component } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
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
    
    const correo = this.loginForm.value.correo?.trim();
    const clave = this.loginForm.value.clave;
    
    console.log('Intentando login con:', { correo, clave });

    this.authService.login(correo, clave).subscribe({
      next: (response) => {
        console.log('Login exitoso, respuesta del servidor:', response);
        this.cargando = false;
        
        // Usamos el rol tal cual viene del Backend (Mayúsculas y guiones bajos)
        const rolUsuario = response.usuario?.rol?.toUpperCase();
        
        switch (rolUsuario) {
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
            this.router.navigate(['/inventario']);
            break;
          case 'CLIENTE':
            this.router.navigate(['/cliente']);
            break;
          default:
            this.router.navigate(['/home']);
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