import { Injectable, inject } from '@angular/core';
import { ProfileService, Profile, PaginatedResponse } from '../profile.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private profileService = inject(ProfileService);

  constructor() {}

  /**
   * Obtiene perfiles con paginación desde el backend
   */
  getPerfiles(page: number, pageSize: number): Observable<PaginatedResponse<Profile>> {
    return this.profileService.getProfilesPaginated(page, pageSize);
  }

  /**
   * Obtiene todos los perfiles sin paginación
   */
  getAllPerfiles(): Observable<Profile[]> {
    return this.profileService.getAllProfiles();
  }

  /**
   * Obtiene un perfil específico por ID
   */
  getPerfilById(id: number): Observable<Profile> {
    return this.profileService.getProfileById(id);
  }

  /**
   * Crea un nuevo perfil
   */
  createPerfil(perfil: Profile): Observable<Profile> {
    return this.profileService.createProfile(perfil);
  }

  /**
   * Actualiza un perfil existente
   */
  updatePerfil(id: number, perfil: Profile): Observable<Profile> {
    return this.profileService.updateProfile(id, perfil);
  }

  /**
   * Activa o desactiva un perfil
   */
  setActivePerfil(id: number, active: boolean): Observable<void> {
    return this.profileService.setActive(id, active);
  }

  /**
   * Exporta los perfiles a Excel
   */
  exportPerfiles(): Observable<Blob> {
    return this.profileService.exportProfiles();
  }
}
