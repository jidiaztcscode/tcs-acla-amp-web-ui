import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tables } from '../../../../shared/components/tables/tables';

import { Title } from '../../../../shared/components/title/title';
import { DownloadReportButton } from '../../../../shared/components/buttons/download-report-button/download-report-button';
import { AddButton } from '../../../../shared/components/buttons/add-button/add-button';
import { UserProfileService } from '../../../services/user-profile.service/user-profile.service';
import { DocumentExport } from '../../../../shared/services/export/document-export';
import { Profile } from '../../../services/profile.service';

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
  private documentExportService = inject(DocumentExport);

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  /**
   * Carga los perfiles desde el backend con paginación
   */
  cargarPerfiles(page: number = 1): void {
    this.isLoading = true;
    this.error = null;
    this.currentPage = page;

    this.userProfileService.getPerfiles(page, this.pageSize).subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta del backend:', respuesta);
        
        // Manejar tanto si es un array directo como si es un objeto con estructura PaginatedResponse
        let perfiles: any[] = [];
        let total: number = 0;
        
        if (Array.isArray(respuesta)) {
          // Si es un array directo
          perfiles = respuesta;
          total = respuesta.length;
        } else if (respuesta.data && Array.isArray(respuesta.data)) {
          // Si es un PaginatedResponse con estructura {data: [], total: N, ...}
          perfiles = respuesta.data;
          total = respuesta.total || respuesta.data.length;
        }
        
        // Mapear las propiedades del backend al formato esperado por el frontend
        this.data = perfiles.map((perfil: any) => ({
          nombre: perfil.name,
          descripcion: perfil.description,
          activo: perfil.active,
          id: perfil.id
        }));
        
        console.log('Datos mapeados:', this.data);
        this.totalRecords = total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar perfiles:', err);
        this.error = 'Error al cargar los perfiles. Intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Método que se ejecuta cuando se solicita agregar un nuevo perfil
   */
  onAgregar(): void {
    console.log('Agregar nuevo perfil');
    // TODO: Navegar al formulario de creación o abrir modal
  }

  /**
   * Método que se ejecuta cuando se solicita descargar el reporte
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
   * Método para cambiar de página en la paginación
   */
  onPageChange(page: number): void {
    this.cargarPerfiles(page);
  }
}
