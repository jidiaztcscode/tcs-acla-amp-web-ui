import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultUserProfile } from './consult-user-profile';

describe('ConsultUserProfile Component', () => {
  let component: ConsultUserProfile;
  let fixture: ComponentFixture<ConsultUserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultUserProfile], 
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultUserProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial data with 5 perfiles', () => {
    expect(component.data.length).toBe(5);
    expect(component.data[0].nombre).toContain('GG-Rol AMP_Prod_Admin');
  });

  it('should call onAgregar and log the correct message', () => {
    spyOn(console, 'log');
    component.onAgregar();
    expect(console.log).toHaveBeenCalledWith('Agregar desde página');
  });

  it('should call onDescargar and log the correct message', () => {
    spyOn(console, 'log');
    component.onDescargar();
    expect(console.log).toHaveBeenCalledWith('Descargar desde página');
  });
});
