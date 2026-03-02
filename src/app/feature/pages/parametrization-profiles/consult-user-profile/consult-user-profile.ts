import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Tables } from '../../../../shared/components/tables/tables';

import { Title } from '../../../../shared/components/title/title';
import { DownloadReportButton } from '../../../../shared/components/buttons/download-report-button/download-report-button';
import { AddButton } from '../../../../shared/components/buttons/add-button/add-button';
import { UserProfileService } from '../../../services/user-profile.service/user-profile.service';
import { PaginatedResponse, Profile } from '../../../services/profile.service';

interface ProfileView {
  nombre: string;
  descripcion: string;
  activo: boolean;
  id?: number;
}

@Component({
  selector: 'app-consult-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    Tables,
    Title,
    AddButton,
    DownloadReportButton
  ],
  templateUrl: './consult-user-profile.html',
  styleUrls: ['./consult-user-profile.css']
})
export class ConsultUserProfile implements OnInit {
  data: ProfileView[] = [];
  isLoading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  private userProfileService = inject(UserProfileService);

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  /**
   * Carga los perfiles desde el backend con paginacion
   */
  cargarPerfiles(page: number = 1): void {
    this.isLoading = true;
    this.error = null;
    this.currentPage = page;

    this.userProfileService.getPerfiles(page, this.pageSize)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (respuesta: PaginatedResponse<Profile> | Profile[]) => {
          const { perfiles, total } = this.normalizarRespuesta(respuesta);
          this.data = perfiles.map((perfil) => this.mapToView(perfil));
          this.totalRecords = total;
          console.log('✓ Perfiles cargados:', this.data);
        },
        error: (err) => {
          console.error('✗ Error al cargar perfiles:', err);
          this.error = 'Error al cargar los perfiles. Intente nuevamente.';
          // Si el backend retorna error, intentar cargar datos vacíos de demostración
          this.data = [];
        }
      });
  }

  /**
   * Metodo que se ejecuta cuando se solicita agregar un nuevo perfil
   */
  onAgregar(): void {
    console.log('Agregar nuevo perfil');
    // TODO: Navegar al formulario de creacion o abrir modal
  }

  /**
   * Metodo que se ejecuta cuando se solicita descargar el reporte
   */
  onDescargar(): void {
    console.log('Descargar perfiles');

    this.userProfileService.exportPerfiles().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'perfiles.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar perfiles:', err);
        this.error = 'Error al descargar el archivo.';
      }
    });
  }

  /**
   * Metodo para cambiar de pagina en la paginacion
   */
  onPageChange(page: number): void {
    this.cargarPerfiles(page);
  }

  private normalizarRespuesta(
    respuesta: PaginatedResponse<Profile> | Profile[]
  ): { perfiles: Profile[]; total: number } {
    if (Array.isArray(respuesta)) {
      return { perfiles: respuesta, total: respuesta.length };
    }

    const perfiles = Array.isArray(respuesta.data) ? respuesta.data : [];
    const total = respuesta.total || perfiles.length;
    return { perfiles, total };
  }

  private mapToView(perfil: Profile): ProfileView {
    return {
      nombre: perfil.name,
      descripcion: perfil.description,
      activo: perfil.active,
      id: perfil.id
    };
  }
}
