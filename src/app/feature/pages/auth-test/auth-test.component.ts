import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-test-container">
      <h2>Test de Autenticación SAML</h2>
      
      <div class="status-section">
        <h3>Estado de Autenticación</h3>
        <div *ngIf="currentUser; else notAuthenticated" class="authenticated">
          <p class="success">✅ Usuario autenticado correctamente</p>
          <div class="user-info">
            <p><strong>Usuario:</strong> {{ currentUser.username }}</p>
            <p><strong>Nombre:</strong> {{ currentUser.displayName }}</p>
            <p><strong>Rol:</strong> {{ currentUser.role }}</p>
            <p><strong>Rol Display:</strong> {{ currentUser.roleDisplayName }}</p>
            <p><strong>Permisos:</strong></p>
            <ul>
              <li *ngFor="let permission of currentUser.permissions">{{ permission }}</li>
            </ul>
          </div>
        </div>
        <ng-template #notAuthenticated>
          <p class="error">❌ Usuario no autenticado</p>
        </ng-template>
      </div>

      <div class="actions-section">
        <h3>Acciones</h3>
        <button (click)="loginWithSAML()" class="btn btn-primary">
          Iniciar sesión con SAML
        </button>
        <button (click)="reloadUser()" class="btn btn-secondary">
          Recargar información del usuario
        </button>
        <button (click)="logout()" class="btn btn-danger" *ngIf="currentUser">
          Cerrar sesión
        </button>
      </div>

      <div class="debug-section">
        <h3>Información de Debug</h3>
        <div class="debug-info">
          <p><strong>API URL:</strong> http://localhost:8081/api/pensionados/auth</p>
          <p><strong>Cookies:</strong> {{ getCookies() }}</p>
          <p><strong>Timestamp:</strong> {{ timestamp }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    h3 {
      color: #555;
      margin-top: 20px;
    }

    .status-section, .actions-section, .debug-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }

    .success {
      color: #28a745;
      font-weight: bold;
    }

    .error {
      color: #dc3545;
      font-weight: bold;
    }

    .user-info {
      background: white;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
    }

    .user-info p {
      margin: 5px 0;
    }

    .user-info ul {
      margin: 5px 0;
      padding-left: 20px;
    }

    .btn {
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn:hover {
      opacity: 0.8;
    }

    .debug-info {
      background: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
    }

    .debug-info p {
      margin: 5px 0;
      word-break: break-all;
    }
  `]
})
export class AuthTestComponent implements OnInit {
  currentUser: User | null = null;
  timestamp: string = new Date().toISOString();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.timestamp = new Date().toISOString();
    });
  }

  loginWithSAML(): void {
    console.log('Iniciando login SAML...');
    this.authService.loginWithSAML();
  }

  reloadUser(): void {
    console.log('Recargando información del usuario...');
    this.authService.loadCurrentUser();
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.authService.logout();
  }

  getCookies(): string {
    return document.cookie || 'No hay cookies';
  }
}
