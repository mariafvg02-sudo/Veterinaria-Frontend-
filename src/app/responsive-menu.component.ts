import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NgIf, AsyncPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-responsive-menu',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgClass, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="header">
      <div class="logo">VET APP</div>
      
      <!-- Backdrop para móvil: cierra el menú al hacer clic fuera -->
      <div *ngIf="menuOpen" class="menu-backdrop" (click)="toggleMenu()"></div>

      <ng-container *ngIf="isHandset$ | async as isHandset; else desktopMenu">
        <button class="menu-toggle" (click)="toggleMenu()" aria-label="Abrir menú">☰</button>
        <nav class="mobile-nav" [class.open]="menuOpen">
          <div class="mobile-nav-header">
            <span class="logo">VET APP</span>
            <button class="close-btn" (click)="toggleMenu()">×</button>
          </div>
          <a routerLink="/home" (click)="toggleMenu()">Inicio</a>
          <a routerLink="/cliente" (click)="toggleMenu()">Mascotas</a>
          <a routerLink="/veterinario" (click)="toggleMenu()">Citas</a>
          <a routerLink="/contacto" (click)="toggleMenu()">Contacto</a>
        </nav>
      </ng-container>

      <ng-template #desktopMenu>
        <nav class="desktop-nav">
          <a routerLink="/home">Inicio</a>
          <a routerLink="/cliente">Mascotas</a>
          <a routerLink="/veterinario">Citas</a>
          <a routerLink="/contacto">Contacto</a>
        </nav>
      </ng-template>
    </div>
  `,
  styles: [`
    .header {
      min-height: var(--header-height);
      width: 100%;
      background-color: var(--primary-color);
      color: var(--text-color-light);
      padding: 0 var(--spacing-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .logo { font-size: var(--font-size-xl); font-weight: bold; }
    .menu-toggle {
      background: none; border: none; color: var(--text-color-light);
      font-size: var(--font-size-xl); cursor: pointer;
    }
    .menu-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5); z-index: 998;
    }
    .mobile-nav {
      position: fixed; top: 0; left: -280px; width: 280px; height: 100vh;
      background-color: var(--primary-color); display: flex; flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.2); transition: left 0.3s ease-in-out;
      z-index: 9999; padding-top: var(--spacing-md);
    }
    .mobile-nav.open { left: 0; }
    .mobile-nav-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 var(--spacing-md) var(--spacing-md);
      border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: var(--spacing-sm);
    }
    .close-btn { background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }
    .mobile-nav a, .desktop-nav a {
      color: var(--text-color-light); text-decoration: none;
      padding: var(--spacing-sm) var(--spacing-md); transition: background 0.3s;
    }
    .mobile-nav a:hover, .desktop-nav a:hover { background-color: rgba(255, 255, 255, 0.2); }
    .desktop-nav { display: none; }

    @media (min-width: 768px) {
      .menu-toggle, .mobile-nav { display: none; }
      .desktop-nav { display: flex; align-items: center; }
      .desktop-nav a { margin-left: var(--spacing-sm); }
    }
  `]
})
export class ResponsiveMenuComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean>;
  menuOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches));
  }

  ngOnInit() {
    // Suscribirse para cerrar el menú si se cambia a escritorio
    this.isHandset$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isHandset => {
        if (!isHandset) {
          this.menuOpen = false; 
        }
      });
  }

  // Cerramos el menú si el usuario hace scroll para mejorar la UX en móvil
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.menuOpen) {
      this.menuOpen = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}