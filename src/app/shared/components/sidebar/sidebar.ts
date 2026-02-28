import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User, UserRole } from '../../models/user.model';
import { Subscription } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  children?: { name: string; route?: string }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit, OnDestroy {
  isSidebarOpen = true;
  expandedMenu: string | null = null;
  currentUser: User | null = null;
  filteredMenuItems: MenuItem[] = [];
  private userSubscription?: Subscription;

  // Definición completa de todos los menús
  private allMenuItems: MenuItem[] = [
    {
      icon: 'assets/images/lupa-icon.png',
      label: 'Afiliaciones',
      children: [
        { name: 'Identificacion por numero de cuenta' },
        { name: 'Identificacion por numero de identificacion' },
      ]
    },
    { icon: 'assets/images/reintegro-icon.png', label: 'Reintegros' },
    { icon: 'assets/images/reportes-icon.png', label: 'Reportes' },
    { icon: 'assets/images/lupa-icon.png', label: 'Consultar Logs' },
    { icon: 'assets/images/pds-icon.png', label: 'Parametrizacion Del Sistema' },
    {
      icon: 'assets/images/adp-icon.png',
      label: 'Administracion De Perfiles',
      children: [
        { name: 'Consultar perfil de usuarios', route: '/' }
      ]
    },
  ];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Suscribirse a cambios en el usuario
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.filterMenuItems();
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (!this.isSidebarOpen) {
      this.expandedMenu = null; // Cerrar submenu cuando se colapsa el sidebar
    }
  }

  toggleSubmenu(label: string) {
    this.expandedMenu = this.expandedMenu === label ? null : label;
  }

  /**
   * Filtra los menús según los permisos del usuario
   */
  private filterMenuItems() {
    if (!this.currentUser) {
      // Mostrar todos los menús cuando no hay usuario (para desarrollo/pruebas)
      this.filteredMenuItems = this.allMenuItems;
      return;
    }

    // Si el usuario no tiene permisos definidos, mostrar todos los menús
    if (!this.currentUser.permissions || this.currentUser.permissions.length === 0) {
      this.filteredMenuItems = this.allMenuItems;
      return;
    }

    // Filtrar menús basándose en los permisos del usuario
    this.filteredMenuItems = this.allMenuItems.filter(item =>
      this.currentUser!.permissions.includes(item.label)
    );
  }

  /**
   * Obtiene el nombre para mostrar del usuario
   */
  get userDisplayName(): string {
    return this.currentUser?.displayName || 'Usuario';
  }

  /**
   * Obtiene el rol para mostrar del usuario
   */
  get userRoleDisplay(): string {
    return this.currentUser?.roleDisplayName || 'Sin rol';
  }

  /**
   * Propiedad para acceder a los menús filtrados en el template
   */
  get menuItems(): MenuItem[] {
    return this.filteredMenuItems;
  }

  // Métodos para pruebas (pueden ser llamados desde la consola del navegador)
  setAdminRole() {
    this.authService.setUserRole(UserRole.ADMIN).subscribe();
  }

  setAnalistaRole() {
    this.authService.setUserRole(UserRole.ANALISTA).subscribe();
  }

  /**
   * Navega a la ruta especificada si existe
   */
  navigateTo(route?: string) {
    if (route) {
      this.router.navigate([route]);
      this.expandedMenu = null; // Cerrar el submenu después de navegar
    }
  }
}

