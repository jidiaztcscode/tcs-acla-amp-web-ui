import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tables } from '../../../../shared/components/tables/tables';

import { Title } from '../../../../shared/components/title/title';
import { DownloadReportButton } from '../../../../shared/components/buttons/download-report-button/download-report-button';
import { AddButton } from '../../../../shared/components/buttons/add-button/add-button';
import { UserProfileService } from '../../../services/user-profile.service/user-profile.service';
import { DocumentExport } from '../../../../shared/services/export/document-export';

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
export class ConsultUserProfile {
  data: any[] = [];

  private userProfileService = inject(UserProfileService);
  private documentExportService = inject(DocumentExport);

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles() {
    const page = 1;
    const pageSize = 10;
    const respuesta = this.userProfileService.getPerfiles(page, pageSize);
    this.data = respuesta.data;
  }

  onAgregar() {
    console.log('Agregar desde página');
  }

  onDescargar() {
    console.log('Descargar desde página');
  }
}
