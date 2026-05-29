import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';

import { RecepcionistaComponent } from './recepcionista.component';

describe('RecepcionistaComponent', () => {
  let component: RecepcionistaComponent;
  let fixture: ComponentFixture<RecepcionistaComponent>;

  const authServiceStub = {
    obtenerUsuarioActual: jasmine.createSpy('obtenerUsuarioActual').and.returnValue({
      id: 1,
      nombre: 'Recepcionista Demo',
      correo: 'recepcionista@test.com',
      documentoIdentidad: 123456789,
      rol: 'RECEPCIONISTA'
    }),
    logout: jasmine.createSpy('logout')
  };

  const citaServiceStub = {
    obtenerTodas: jasmine.createSpy('obtenerTodas').and.returnValue(of([])),
    crearCita: jasmine.createSpy('crearCita').and.returnValue(of({
      idCita: 1,
      usuarioId: 1,
      mascotaId: 1,
      veterinarioId: 1,
      fecha: '2026-05-29',
      hora: '09:00',
      motivo: 'Revisión general',
      estado: 'pendiente'
    })),
    actualizarCita: jasmine.createSpy('actualizarCita').and.returnValue(of({
      idCita: 1,
      usuarioId: 1,
      mascotaId: 1,
      veterinarioId: 1,
      fecha: '2026-05-29',
      hora: '09:00',
      motivo: 'Revisión general',
      estado: 'completada'
    })),
    cancelarCita: jasmine.createSpy('cancelarCita').and.returnValue(of(void 0))
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionistaComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: CitaService, useValue: citaServiceStub },
        { provide: Router, useValue: routerStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
