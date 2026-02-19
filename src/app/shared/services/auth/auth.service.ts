import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, UserRole } from '../../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8081/api/pensionados';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // En desarrollo local, no cargar el usuario desde el backend
        const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalDevelopment) {
            this.loadCurrentUser();
        }
    }

    /**
     * Carga la información del usuario actual desde el backend
     */
    loadCurrentUser(): void {
        this.http.get<User>(`${this.apiUrl}/user/current`).subscribe({
            next: (user) => {
                this.currentUserSubject.next(user);
            },
            error: (error) => {
                console.error('Error loading user:', error);
                // Si el error es 401, el usuario no está autenticado
                if (error.status === 401) {
                    console.warn('Usuario no autenticado. Redirigir al login SAML si es necesario.');
                }
            }
        });
    }

    /**
     * Inicia el flujo de autenticación SAML redirigiendo al backend
     */
    loginWithSAML(): void {
        // Redirige al endpoint de login SAML del backend
        window.location.href = `${this.apiUrl}/saml2/authenticate`;
    }

    /**
     * Cierra la sesión del usuario
     */
    logout(): void {
        // Redirige al endpoint de logout SAML del backend
        window.location.href = `${this.apiUrl}/logout`;
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Cambia el rol del usuario (para pruebas)
     */
    setUserRole(role: UserRole): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/user/role`, { role }).pipe(
            tap(user => {
                this.currentUserSubject.next(user);
            })
        );
    }

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    hasPermission(permission: string): boolean {
        const user = this.currentUserSubject.value;
        if (!user) return false;
        return user.permissions.includes(permission);
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    hasRole(role: UserRole): boolean {
        const user = this.currentUserSubject.value;
        if (!user) return false;
        return user.role === role;
    }

    /**
     * Verifica si el usuario es administrador
     */
    isAdmin(): boolean {
        return this.hasRole(UserRole.ADMIN);
    }
}
