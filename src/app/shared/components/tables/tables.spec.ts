import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tables } from './tables';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Tables', () => {
  let component: Tables;
  let fixture: ComponentFixture<Tables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tables, NoopAnimationsModule] 
    }).compileComponents();

    fixture = TestBed.createComponent(Tables);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  
  it('should update el.activo when onToggleChange is called', () => {
    const nuevoValor = true;
    const el = { activo: false };

    spyOn(console, 'log');

    component.onToggleChange(el, nuevoValor);

    expect(el.activo).toBe(nuevoValor);
    expect(console.log).toHaveBeenCalledWith('Nuevo estado:', nuevoValor);
  });

  it('should log element when onEditar is called', () => {
    const el = { id: 1, nombre: 'Test' };
    spyOn(console, 'log');

    component.onEditar(el);

    expect(console.log).toHaveBeenCalledWith('Editar elemento:', el);
  });
});
describe('Tables Component', () => {
  let component: Tables;
  let fixture: ComponentFixture<Tables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tables],
    }).compileComponents();

    fixture = TestBed.createComponent(Tables);
    component = fixture.componentInstance;
    component.data = Array(20).fill({ nombre: 'Test', descripcion: 'Desc', activo: true });
    component.ngOnChanges(); 
  });

  describe('cambiarPagina', () => {
    it('no debería cambiar si el número de página es inválido (< 1)', () => {
      component.currentPage = 2;
      spyOn(component, 'paginate');
      component.cambiarPagina(0);
      expect(component.currentPage).toBe(2);
      expect(component.paginate).not.toHaveBeenCalled();
    });

    it('no debería cambiar si el número de página es inválido (> totalPages)', () => {
      component.totalPages = 3;
      component.currentPage = 2;
      spyOn(component, 'paginate');
      component.cambiarPagina(4);
      expect(component.currentPage).toBe(2);
      expect(component.paginate).not.toHaveBeenCalled();
    });

    it('debería cambiar la página y llamar paginate si el número es válido', () => {
      component.totalPages = 5;
      spyOn(component, 'paginate');
      component.cambiarPagina(3);
      expect(component.currentPage).toBe(3);
      expect(component.paginate).toHaveBeenCalled();
    });
  });

  describe('validatePage', () => {
    it('no debe cambiar currentPage si está dentro del rango', () => {
      component.totalPages = 5;
      component.currentPage = 3;
      component.validatePage();
      expect(component.currentPage).toBe(3);
    });

    it('debe ajustar currentPage si es mayor que totalPages', () => {
      component.totalPages = 4;
      component.currentPage = 10;
      component.validatePage();
      expect(component.currentPage).toBe(4);
    });

    it('debe poner currentPage en 1 si totalPages es 0', () => {
      component.totalPages = 0;
      component.currentPage = 5;
      component.validatePage();
      expect(component.currentPage).toBe(1);
    });
  });
});
