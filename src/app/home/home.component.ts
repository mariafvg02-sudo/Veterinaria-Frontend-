import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Variable para controlar el estado del menú desplegable
  isDropdownOpen: boolean = false;
  readonly currentYear = new Date().getFullYear();

  // Datos para el carrusel
  slides = [
    {
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2070',
      title: 'Servicios de Alta Especialidad',
      description: 'Contamos con tecnología de vanguardia y un equipo médico apasionado por la salud de tus mascotas.',
      badge: 'Servicios'
    },
    {
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071',
      title: 'Ofertas Especiales del Mes',
      description: 'Aprovecha descuentos exclusivos en planes de vacunación y chequeos preventivos para tus peluditos.',
      badge: 'Ofertas'
    },
    {
      image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?q=80&w=2128',
      title: 'Ayudando a Quienes nos Necesitan',
      description: 'Estamos comprometidos con el rescate y bienestar animal. Juntos construimos una comunidad más humana.',
      badge: 'Labor Social'
    }
  ];

  currentSlide = 0;

  constructor(private eRef: ElementRef) {}

  ngOnInit(): void {
    this.startAutoPlay();
  }

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

  // Lógica del Carrusel
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  private startAutoPlay(): void {
    setInterval(() => {
      this.nextSlide();
    }, 6000); // 6 segundos para permitir una lectura cómoda
  }
}