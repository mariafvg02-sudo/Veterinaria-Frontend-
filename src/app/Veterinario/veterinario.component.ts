import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './veterinario.component.html',
  styleUrls: ['../administrador/administrador.component.scss'] // Reutilizamos estilos
})
export class VeterinarioComponent {
  activeTab: string = 'agenda';

  citasHoy = [
    { hora: '08:00 AM', paciente: 'Firulais', dueno: 'Juan Pérez', motivo: 'Vacunación', estado: 'Pendiente' },
    { hora: '09:30 AM', paciente: 'Misi', dueno: 'Maria G.', motivo: 'Control', estado: 'En consulta' },
    { hora: '11:00 AM', paciente: 'Rex', dueno: 'Carlos R.', motivo: 'Cirugía', estado: 'Pendiente' }
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  atenderCita(cita: any) {
    alert(`Iniciando consulta para ${cita.paciente}`);
    cita.estado = 'Completada';
  }
}