import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitaService } from '../../Core/Service/cita.service';
import { Cita } from '../../Models/cita.model';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cita-detalle.component.html',
  styleUrls: ['./cita-detalle.component.scss']
})
export class CitaDetalleComponent implements OnInit {
  cita: Cita | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'ID de cita inválido.';
      this.loading = false;
      return;
    }

    this.citaService.obtenerCitaPorId(id).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle de la consulta.';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/veterinario']);
  }
}