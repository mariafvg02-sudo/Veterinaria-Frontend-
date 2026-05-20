import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.scss'
})
export class AdministradorComponent {
  userForm: FormGroup;
  activeTab: string = 'users';
  loading = false;
  message: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      rol: ['recepcionista', Validators.required]
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onSubmitUser() {
    if (this.userForm.valid) {
      this.loading = true;
      this.message = null;

      const payload = {
        nombre: this.userForm.value.nombre,
        correo: this.userForm.value.email,
        clave: this.userForm.value.password,
        telefono: this.userForm.value.telefono,
        rol: this.userForm.value.rol
      };

      // Asumiendo que authService tiene un método para registrar con rol
      this.authService.register(payload).subscribe({
        next: (response) => {
          this.message = 'Usuario creado exitosamente';
          this.userForm.reset();
          this.userForm.patchValue({ rol: 'recepcionista' });
        },
        error: (error) => {
          this.message = 'Error al crear usuario: ' + error.message;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
