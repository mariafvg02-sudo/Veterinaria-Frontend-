import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Service/auth.service';

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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
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
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.cargando = false;
        
        // Obtener el usuario actual después del login
        const usuarioActual = this.authService.obtenerUsuarioActual();
        
        // Redirigir según el rol del usuario
        if (usuarioActual?.rol?.toLowerCase() === 'cliente') {
          this.router.navigate(['/cliente']);
        } else {
          this.router.navigate(['/home']);
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
