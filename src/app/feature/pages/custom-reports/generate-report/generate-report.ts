import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MesadasDatasource } from '../../../../data/datasources/mesadas.datasource';
import { CuentasDatasource } from '../../../../data/datasources/cuentas.datasource';
import { ReportConfigDatasource } from '../../../../data/datasources/report-config.datasource';
import { VistaDatasource } from '../../../../data/datasources/vista.datasource';
import { ReportConfig, Vista } from '../../../../domain/models/report-config.model';
import { MesadasQueryParams } from '../../../../domain/models/mesadas.model';
import { DocumentExport } from '../../../../shared/services/export/document-export';
import { isRight } from 'fp-ts/Either';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.html',
  styleUrl: './generate-report.scss',
  standalone: false,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ]
})
export class GenerateReport implements OnInit {

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly mesadasDatasource = inject(MesadasDatasource);
  private readonly reportConfigDatasource = inject(ReportConfigDatasource);
  private readonly vistaDatasource = inject(VistaDatasource);
  private readonly documentExport = inject(DocumentExport);
  private readonly cuentasDatasource = inject(CuentasDatasource);

  reportId?: number;
  reportConfig?: ReportConfig;
  vista?: Vista;
  isLoading: boolean = false;
  errorMessage: string = '';

  filterList: any[] = [];
  filterValues: { [key: string]: any } = {};

  resultsList: any[] = [];
  columnsList: any[] = [];

  sizeNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  reportSettings: any[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  async ngOnInit(): Promise<void> {
    const params = this.activatedRoute.snapshot.params;
    
    if (params['id']) {
      this.reportId = parseInt(params['id']);
      await this.loadReportConfiguration();
    }
  }

  async loadReportConfiguration(): Promise<void> {
    if (!this.reportId) return;

    this.isLoading = true;
    try {
      const result = await this.reportConfigDatasource.obtenerReporte(this.reportId);
      
      if (isRight(result)) {
        this.reportConfig = result.right;
        
        // Load vista information
        if (this.reportConfig.idvista) {
          const vistaResult = await this.vistaDatasource.obtenerVista(this.reportConfig.idvista);
          if (isRight(vistaResult)) {
            this.vista = vistaResult.right;
          }
        }
        
        // Map columns
        if (this.reportConfig.columns) {
          this.columnsList = this.reportConfig.columns.map(col => ({
            keyName: col.nomcampo,
            text: col.nomcampo,
            align: col.tipojust === 'D' ? 'right' : 'left',
            sum: col.sumcolumna === 'S'
          }));
        }
        
        // Map filters (prefer a named field if available, fallback to idDetvista)
        if (this.reportConfig.filters) {
          this.filterList = this.reportConfig.filters.map((f: any, idx: number) => {
            const fieldKey = f.nomcampo || f.idDetvista;
            const fieldKeyLower = fieldKey.toLowerCase();
            
            // Determine field type based on field name heuristics
            let fieldType = 'string';
            if (fieldKeyLower.includes('fecha') || fieldKeyLower.includes('date')) {
              fieldType = 'date';
            }
            
            return {
              fieldKey: fieldKey,
              conditional: this.mapFilterTypeToConditional(f.tipoFiltro),
              connector: f.incluyente,
              type: fieldType,
              value: f.valFiltro,
              required: fieldKeyLower.includes('fechainicio') || fieldKeyLower.includes('fechafin')
            };
          });
          console.log('Mapped filterList:', this.filterList);
        }

        // Agregar filtros de fecha obligatorios si no existen en la configuración
        const hasFechaInicio = this.filterList.some(f => f.fieldKey.toLowerCase().includes('fechainicio'));
        const hasFechaFin = this.filterList.some(f => f.fieldKey.toLowerCase().includes('fechafin'));

        if (!hasFechaInicio) {
          this.filterList.unshift({
            fieldKey: 'fechaInicio',
            conditional: 'equal',
            connector: 'AND',
            type: 'date',
            value: null,
            required: true
          });
        }

        if (!hasFechaFin) {
          this.filterList.unshift({
            fieldKey: 'fechaFin',
            conditional: 'equal',
            connector: 'AND',
            type: 'date',
            value: null,
            required: true
          });
        }

        console.log('Final filterList with date filters:', this.filterList);
        
        // Map settings
        this.reportSettings = [
          { settingName: 'Encabezado', value: this.reportConfig.encab },
          { settingName: 'Conteo', value: this.reportConfig.conteo },
          { settingName: 'Registro de control', value: this.reportConfig.regcontrol },
        ];
        
        console.log('Report configuration loaded:', this.reportConfig);
      } else {
        this.errorMessage = result.left.message;
        console.error('Error loading report config:', result.left);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado al cargar configuración';
      console.error('Unexpected error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapFilterTypeToConditional(tipoFiltro: number): string {
    const filterMap: { [key: number]: string } = {
      1: 'equal',
      2: 'greater_than',
      3: 'less_than',
      4: 'contains',
      5: 'not_contain'
    };
    return filterMap[tipoFiltro] || 'equal';
  }

  async onGenerate(): Promise<void> {
    if (!this.vista) {
      alert('No se ha cargado la vista del reporte');
      return;
    }

    console.log('Generating report with filterList:', this.filterList);
    console.log('Current filterValues:', this.filterValues);

    // Use idvista to determine the endpoint for more robust matching
    // 1 = pagos, 2 = rechazos, 3 = certificados
    const endpointMap: { [key: number]: string } = {
      1: 'pagos',
      2: 'rechazos',
      3: 'certificados',
      4: 'aperturas',
      5: 'inactivas'
    };

    const endpoint = endpointMap[this.vista.idvista];
    
    if (!endpoint) {
      alert('No se pudo determinar el endpoint para esta vista');
      return;
    }

    // Build query params from filter values (require user to provide fechas)
    const fechaInicio = this.filterValues['fechaInicio'] ? this.formatDate(this.filterValues['fechaInicio']) : null;
    const fechaFin = this.filterValues['fechaFin'] ? this.formatDate(this.filterValues['fechaFin']) : null;

    if (!fechaInicio || !fechaFin) {
      this.isLoading = false;
      alert('Por favor seleccione Fecha inicio y Fecha fin para generar el reporte');
      return;
    }

    const queryParams: MesadasQueryParams = {
      fechaInicio,
      fechaFin,
      page: this.currentPage,
      size: this.pageSize
    };

    console.log('Built queryParams for request:', queryParams);

    // Add optional filters
    if (this.filterValues['empresa']) queryParams.empresa = this.filterValues['empresa'];
    if (this.filterValues['afiliacion']) queryParams.afiliacion = this.filterValues['afiliacion'];
    if (this.filterValues['cuentaPensionado']) queryParams.cuentaPensionado = this.filterValues['cuentaPensionado'];
    if (this.filterValues['documento']) queryParams.documento = this.filterValues['documento'];
    if (this.filterValues['tipoDocumento']) queryParams.tipoDocumento = this.filterValues['tipoDocumento'];
    if (this.filterValues['cuentaPagadora']) queryParams.cuentaPagadora = this.filterValues['cuentaPagadora'];

    this.isLoading = true;
    try {
      if (endpoint === 'pagos') {
        const result = await this.mesadasDatasource.consultarPagos(queryParams);
        if (isRight(result)) {
          this.resultsList = result.right.data;
          this.totalRecords = result.right.total;
          this.totalPages = Math.ceil(result.right.total / result.right.pageSize);
          this.currentPage = result.right.page;
          this.pageSize = result.right.pageSize;
          console.log('Pagos loaded:', this.resultsList);
        } else {
          this.errorMessage = result.left.message;
          alert('Error al generar reporte: ' + result.left.message);
        }
      } else if (endpoint === 'rechazos') {
        const result = await this.mesadasDatasource.consultarRechazos(queryParams);
        if (isRight(result)) {
          this.resultsList = result.right.data;
          this.totalRecords = result.right.total;
          this.totalPages = Math.ceil(result.right.total / result.right.pageSize);
          this.currentPage = result.right.page;
          this.pageSize = result.right.pageSize;
          console.log('Rechazos loaded:', this.resultsList);
        } else {
          this.errorMessage = result.left.message;
          alert('Error al generar reporte: ' + result.left.message);
        }
      } else if (endpoint === 'certificados') {
        const result = await this.mesadasDatasource.consultarCertificados(
          queryParams.fechaInicio,
          queryParams.fechaFin
        );
        if (isRight(result)) {
          this.resultsList = result.right;
          this.totalRecords = result.right.length;
          this.totalPages = 1;
          console.log('Certificados loaded:', this.resultsList);
        } else {
          this.errorMessage = result.left.message;
          alert('Error al generar reporte: ' + result.left.message);
        }
      } else if (endpoint === 'aperturas') {
        const result = await this.cuentasDatasource.consultarAperturas(queryParams);
        if (isRight(result)) {
          this.resultsList = result.right.data;
          this.totalRecords = result.right.total;
          this.totalPages = Math.ceil(result.right.total / result.right.pageSize);
          this.currentPage = result.right.page;
          this.pageSize = result.right.pageSize;
          console.log('Aperturas loaded:', this.resultsList);
        } else {
          this.errorMessage = result.left.message;
          alert('Error al generar reporte: ' + result.left.message);
        }
      } else if (endpoint === 'inactivas') {
        const result = await this.cuentasDatasource.consultarInactivas(queryParams);
        if (isRight(result)) {
          this.resultsList = result.right.data;
          this.totalRecords = result.right.total;
          this.totalPages = Math.ceil(result.right.total / result.right.pageSize);
          this.currentPage = result.right.page;
          this.pageSize = result.right.pageSize;
          console.log('Inactivas loaded:', this.resultsList);
        } else {
          this.errorMessage = result.left.message;
          alert('Error al generar reporte: ' + result.left.message);
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error inesperado al generar el reporte');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Helper: format a Date or ISO/string to YYYY-MM-DD
   */
  private formatDate(value: any): string {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    // If it's a string, try to normalize to YYYY-MM-DD
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch (e) {
      // fallback
    }
    // If value already looks like YYYY-MM-DD, return as-is
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return String(value);
  }

  async onGenerateExcel(): Promise<void> {
    if (this.resultsList.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders();
    const data = this.prepareExportData();
    const filename = this.generateFilename();

    await this.documentExport.exportExcel(title, headers, data, filename);
  }

  async onGeneratecsv(): Promise<void> {
    if (this.resultsList.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders();
    const data = this.prepareExportData();
    const filename = this.generateFilename();

    await this.documentExport.exportCsv(title, headers, data, filename);
  }

  async onGeneratetxt(): Promise<void> {
    if (this.resultsList.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders();
    const data = this.prepareExportData();
    const filename = this.generateFilename();

    await this.documentExport.exportTxt(title, headers, data, filename);
  }
  
  async onGeneratepdf(): Promise<void> {
    if (this.resultsList.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders();
    const data = this.prepareExportData();
    const filename = this.generateFilename();

    await this.documentExport.exportPdf(title, headers, data, filename);
  }

  /**
   * Get headers for export based on configured columns
   */
  private getExportHeaders(): string[] {
    if (this.columnsList.length > 0) {
      return this.columnsList.map(col => col.text);
    }
    
    // Fallback: use keys from first result item
    if (this.resultsList.length > 0) {
      return Object.keys(this.resultsList[0]);
    }
    
    return [];
  }

  /**
   * Prepare data for export by filtering only the configured columns
   */
  private prepareExportData(): any[] {
    if (this.columnsList.length === 0) {
      return this.resultsList;
    }

    // Map results to only include configured columns in the correct order
    return this.resultsList.map(item => {
      const exportItem: any = {};
      this.columnsList.forEach(col => {
        const key = col.keyName;
        exportItem[key] = item[key] !== undefined && item[key] !== null ? item[key] : '';
      });
      return exportItem;
    });
  }

  /**
   * Generate filename based on report name and vista
   */
  private generateFilename(): string {
    const reportName = this.reportConfig?.nomconsulta || 'reporte';
    const vistaName = this.vista?.nomvista || 'datos';
    
    // Clean filename: remove special characters and spaces
    const cleanName = `${reportName}_${vistaName}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_');
    
    return cleanName;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.onGenerate();
    }
  }
  
}
