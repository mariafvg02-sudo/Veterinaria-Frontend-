import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly navLinks = [
  { label: 'Inicio', route: '/home'},
  { label: 'Veterinario', route: '/veterinarios'},
  { label: 'Servicios', route: '/service'}
  ];

  readonly currentYear = new Date().getFullYear();

}
