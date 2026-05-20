import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Veterinario } from '../Models/veterinario.model';
import { VeterinarioService } from '../Service/veterinario.service';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './veterinario.component.html',
  styleUrls: ['./veterinario.component.scss']
})
export class VeterinarioComponent implements OnInit {
  veterinarios: Veterinario[] = [];
  cargando = false;
  error: string | null = null;

  constructor(private veterinarioService: VeterinarioService) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
  }

  cargarVeterinarios(): void {
    this.cargando = true;
    this.error = null;
    this.veterinarioService.obtenerTodos().subscribe({
      next: (data) => {
        this.veterinarios = data || [];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar veterinarios. Verifica que el backend esté corriendo en http://localhost:8080';
        this.cargando = false;
        this.veterinarios = [];
      }
    });
  }
}