/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { RecepcionistaComponent } from './recepcionista.component';
import { AuthService } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';

const authServiceStub = jasmine.createSpyObj('AuthService', ['obtenerUsuarioActual', 'logout']);
authServiceStub.obtenerUsuarioActual.and.returnValue({
  id: 1,
  nombre: 'Ana Recepcionista',
  correo: 'recepcionista@test.com'
});

const citaServiceStub = jasmine.createSpyObj('CitaService', ['obtenerTodas', 'crearCita', 'actualizarCita', 'cancelarCita']);
citaServiceStub.obtenerTodas.and.returnValue(of([]));
citaServiceStub.crearCita.and.returnValue(of({}));
citaServiceStub.actualizarCita.and.returnValue(of({}));
citaServiceStub.cancelarCita.and.returnValue(of({}));

const routerStub = jasmine.createSpyObj('Router', ['navigate']);

describe('RecepcionistaComponent', () => {
  let component: RecepcionistaComponent;
  let fixture: ComponentFixture<RecepcionistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionistaComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: CitaService, useValue: citaServiceStub },
        { provide: Router, useValue: routerStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
