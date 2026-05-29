import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface HomeSlide {
  image: string;
  title: string;
  description: string;
  badge: string;
  services: string[];
  discount: string;
}

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
  slides: HomeSlide[] = [
    {
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2070',
      title: 'Servicios de Alta Especialidad',
      description: 'Atendemos a tu mascota con un enfoque completo, cálido y profesional en cada visita.',
      badge: 'Servicios',
      services: ['Consulta general', 'Vacunación', 'Desparasitación'],
      discount: '15% de descuento en chequeo preventivo y control anual.'
    },
    {
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071',
      title: 'Ofertas Especiales del Mes',
      description: 'Promociones pensadas para mantener la salud de perritos y gatitos sin descuidar tu bolsillo.',
      badge: 'Ofertas',
      services: ['Paquetes de vacunación', 'Chequeo preventivo', 'Desparasitación interna'],
      discount: 'Combo de vacunación y desparasitación con tarifa especial este mes.'
    },
    {
      image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?q=80&w=2128',
      title: 'Ayudando a Quienes nos Necesitan',
      description: 'Atención enfocada en bienestar animal, rescate y seguimiento de pacientes que lo necesitan.',
      badge: 'Labor Social',
      services: ['Apoyo a rescates', 'Valoración clínica', 'Seguimiento post-atención'],
      discount: 'Descuento solidario en atención básica para rescates y adopciones.'
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