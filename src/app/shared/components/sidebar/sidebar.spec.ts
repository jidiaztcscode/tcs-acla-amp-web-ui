import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar] 
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleSidebar', () => {
    it('should toggle isSidebarOpen from false to true', () => {
      component.isSidebarOpen = false;
      component.toggleSidebar();
      expect(component.isSidebarOpen).toBeTrue();
    });

    it('should toggle isSidebarOpen from true to false', () => {
      component.isSidebarOpen = true;
      component.toggleSidebar();
      expect(component.isSidebarOpen).toBeFalse();
    });
  });

  describe('toggleSubmenu', () => {
  

  it('should collapse submenu when same menu is clicked', () => {
    component.expandedMenu = 'Afiliaciones';
    component.toggleSubmenu('Afiliaciones');
    expect(component.expandedMenu).toBeNull(); 
  });

  it('should switch submenu when different menu is clicked', () => {
    component.expandedMenu = 'Afiliaciones';
    component.toggleSubmenu('Reportes');
    expect(component.expandedMenu).toEqual('Reportes');
    });
  });
  
});
