import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Variable para controlar el estado del menú desplegable
  isDropdownOpen: boolean = false;
  readonly currentYear = new Date().getFullYear();

  constructor(private eRef: ElementRef) {}

  // Función para alternar el menú
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Cierra la lista si se hace clic en cualquier otra parte de la pantalla
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}