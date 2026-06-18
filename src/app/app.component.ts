import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

const DASHBOARD_ROUTES = ['/recepcionista', '/veterinario', '/administrador', '/jefe-inventario', '/cliente'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'VET APP';
  isDashboardRoute = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkDashboardRoute(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    // Comprobación inicial para evitar desorden al recargar la página
    this.checkDashboardRoute(this.router.url);
  }

  private checkDashboardRoute(url: string) {
    this.isDashboardRoute = DASHBOARD_ROUTES.some(r => url.startsWith(r));
  }
}
