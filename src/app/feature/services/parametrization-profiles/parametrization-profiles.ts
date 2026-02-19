import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssignableProfiles, ManageProfile } from '../../interfaces/profile_options';

@Injectable({
  providedIn: 'root'
})
export class ParametrizationProfiles {
  private apiUrl = 'http://localhost:5000/api/pensionados';
  private httpClient = inject(HttpClient);

  getProfileOptions(): Observable<AssignableProfiles> {
    return this.httpClient.post<AssignableProfiles>(`${this.apiUrl}/profile-options`, {});
  }

  saveProfileOptions(body: ManageProfile): Observable<ManageProfile> {
    return this.httpClient.post<ManageProfile>(`${this.apiUrl}/manage-profile-options`, body);
  }
}
