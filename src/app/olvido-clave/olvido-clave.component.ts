import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../Service/auth.service';

/* =========================
   VALIDADOR PERSONALIZADO
========================= */
export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Solo validamos si ambos campos tienen valor para no molestar al usuario mientras escribe
  if (!password?.value || !confirmPassword?.value) return null;

  if (password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-olvido-clave',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './olvido-clave.component.html',
  styleUrl: './olvido-clave.component.scss'
})
export class OlvidoClaveComponent {

  /* =========================
      VARIABLES
  ========================= */

  forgotForm: FormGroup;

  cargando = false;

  mensaje: string | null = null;

  error: string | null = null;

  codeSent = false;

  codeVerified = false;

  showPassword = {
    password: false,
    confirmPassword: false
  };

  /* =========================
      GETTERS
  ========================= */

  get emailControl() {
    return this.forgotForm.get('email');
  }

  get codeControl() {
    return this.forgotForm.get('code');
  }

  get passwordControl() {
    return this.forgotForm.get('password');
  }

  get confirmPasswordControl() {
    return this.forgotForm.get('confirmPassword');
  }

  /* =========================
      CONSTRUCTOR
  ========================= */

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {

    this.forgotForm = this.fb.group({

      email: [
        '',
        [Validators.required, Validators.email]
      ],

      code: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      confirmPassword: [
        '',
        [Validators.required]
      ]

    }, {
      validators: passwordMatchValidator
    });

  }

  /* =========================
      MÉTODOS PRIVADOS
  ========================= */

  private clearMessages(): void {
    this.error = null;
    this.mensaje = null;
  }

  private startLoading(): void {
    this.cargando = true;
    this.clearMessages();
  }

  private getErrorMessage(err: any): string {
    if (typeof err.error === 'string') {
      return err.error;
    }
    return (
      err.error?.mensaje ||
      err.error?.message ||
      'Ocurrió un error inesperado.'
    );
  }

  /* =========================
      ENVIAR CÓDIGO
  ========================= */

  sendCode(): void {

    if (this.emailControl?.invalid) {
      this.emailControl.markAsTouched();
      return;
    }

    this.startLoading();

    const email = this.emailControl?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response: any) => {
        this.cargando = false;

        this.mensaje =
          typeof response === 'string'
            ? response
            : response?.mensaje || response?.message;

        this.codeSent = true;

        this.emailControl?.disable();
      },

      error: (err) => {
        this.cargando = false;

        this.error = this.getErrorMessage(err);
        console.error(err);
      }

    });

  }

  /* =========================
      VERIFICAR CÓDIGO
  ========================= */

  verifyCode(): void {

    if (this.codeControl?.invalid) {
      this.codeControl.markAsTouched();
      return;
    }

    this.startLoading();

    // getRawValue obtiene el email aunque esté deshabilitado
    const { email, code } = this.forgotForm.getRawValue();

    this.authService.verifyCode(email, code).subscribe({
      next: (response: any) => {
        this.cargando = false;

        this.mensaje =
          typeof response === 'string'
            ? response
            : response?.mensaje || response?.message;

        this.codeVerified = true;

        this.codeControl?.disable();
      },

      error: (err) => {
        this.cargando = false;

        this.error = this.getErrorMessage(err);
      }

    });

  }

  /* =========================
      CAMBIAR PASSWORD
  ========================= */

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.error = this.forgotForm.hasError('passwordMismatch')
        ? 'Las contraseñas no coinciden.'
        : 'Corrige los errores del formulario.';
      return;
    }

    this.startLoading();

    const { email, code, password } = this.forgotForm.getRawValue();

    this.authService
      .resetPassword(email, code, password)
      .subscribe({
        next: (response: any) => {
          this.cargando = false;

          this.mensaje =
            typeof response === 'string'
              ? response
              : response?.mensaje || response?.message;

          setTimeout(() => {
            this.goToLogin();
          }, 2000);

        },

        error: (err) => {
          this.cargando = false;

          this.error = this.getErrorMessage(err);
          console.error(err);
        }

      });

  }

  /* =========================
      MOSTRAR PASSWORD
  ========================= */

  togglePassword(
    field: 'password' | 'confirmPassword'
  ): void {

    this.showPassword[field] =
      !this.showPassword[field];

  }

  /* =========================
      IR LOGIN
  ========================= */

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

}