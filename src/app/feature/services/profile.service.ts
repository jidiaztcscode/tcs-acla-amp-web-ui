import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profile {
  id?: number;
  name: string;
  description: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8081/api/pensionados/profiles';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los perfiles sin paginación
   */
  getAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  /**
   * Obtiene perfiles con paginación
   */
  getProfilesPaginated(page: number, pageSize: number): Observable<PaginatedResponse<Profile>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResponse<Profile>>(this.apiUrl, { params });
  }

  /**
   * Obtiene un perfil por ID
   */
  getProfileById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo perfil
   */
  createProfile(profile: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, profile);
  }

  /**
   * Actualiza un perfil existente
   */
  updateProfile(id: number, profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${id}`, profile);
  }

  /**
   * Activa o desactiva un perfil
   */
  setActive(id: number, active: boolean): Observable<void> {
    const params = new HttpParams().set('active', active.toString());
    return this.http.put<void>(`${this.apiUrl}/${id}/active`, null, { params });
  }

  /**
   * Exporta los perfiles a un archivo Excel
   */
  exportProfiles(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }
}
