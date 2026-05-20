import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JefeInventarioComponent } from './jefe-inventario.component';

describe('JefeInventarioComponent', () => {
  let component: JefeInventarioComponent;
  let fixture: ComponentFixture<JefeInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JefeInventarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JefeInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
