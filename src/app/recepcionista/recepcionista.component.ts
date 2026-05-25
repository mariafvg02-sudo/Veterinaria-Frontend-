import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recepcionista.component.html',
  styleUrls: ['../administrador/administrador.component.scss']
})
export class RecepcionistaComponent {
  activeTab: string = 'agenda';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  registrarLlegada() {
    alert('Cliente registrado en sala de espera');
  }
}