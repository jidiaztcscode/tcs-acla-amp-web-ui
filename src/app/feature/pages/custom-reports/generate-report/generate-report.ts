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
  vistaFieldById: { [key: number]: string } = {};

  // Get filtered list without fechaInicio and fechaFin
  get filteredFilterList(): any[] {
    return this.filterList.filter(f => !['fechainicio', 'fechafin'].includes(String(f.fieldKey).toLowerCase()));
  }

  resultsList: any[] = [];
  columnsList: any[] = [];

  sizeNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  reportSettings: any[] = [];
  unsupportedFilters: string[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  private readonly exportPageSize: number = 1000;
  private readonly exportConcurrency: number = 4;
  private lastExportCacheKey: string = '';
  private lastExportCacheData: any[] | null = null;
  private readonly mesadasAllowedFilters = new Set([
    'empresa',
    'afiliacion',
    'cuentaPensionado',
    'documento',
    'tipoDocumento',
    'cuentaPagadora'
  ]);

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

          const columnasResult = await this.vistaDatasource.obtenerColumnas(this.reportConfig.idvista);
          if (isRight(columnasResult)) {
            this.vistaFieldById = columnasResult.right.reduce((acc: { [key: number]: string }, col: any) => {
              acc[Number(col.idDetvista)] = col.nomcolunna;
              return acc;
            }, {});
          }
        }
        
        // Map columns
        if (this.reportConfig.columns) {
          this.columnsList = this.reportConfig.columns
            .filter(col => !['fechaInicio', 'fechaFin'].includes(col.nomcampo.toLowerCase()))
            .map(col => ({
              keyName: col.nomcampo,
              text: col.nomcampo,
              align: col.tipojust === 'D' ? 'right' : 'left',
              sum: col.sumcolumna === 'S'
            }));
        }
        
        // Map filters (resolve by name first; fallback to idDetvista)
        if (this.reportConfig.filters) {
          this.filterList = this.reportConfig.filters.map((f: any, idx: number) => {
            const fieldKey = this.resolveFilterFieldKey(f);
            const fieldKeyLower = String(fieldKey).toLowerCase();
            
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

          this.filterList.forEach(filter => {
            if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
              this.filterValues[String(filter.fieldKey).trim()] = filter.value;
            }
          });
          console.log('Mapped filterList:', this.filterList);
        }

        // Agregar filtros de fecha obligatorios si no existen en la configuraciÃ³n
        const hasFechaInicio = this.filterList.some(f => f.fieldKey.toLowerCase().includes('fechainicio'));
        const hasFechaFin = this.filterList.some(f => f.fieldKey.toLowerCase().includes('fechafin'));

        // Set default dates: fechaInicio as minimum date (1900-01-01) and fechaFin as current system date
        const defaultFechaInicio = new Date('1900-01-01');
        const defaultFechaFin = new Date();

        if (!hasFechaInicio) {
          this.filterList.unshift({
            fieldKey: 'fechaInicio',
            conditional: 'equal',
            connector: 'AND',
            type: 'date',
            value: defaultFechaInicio,
            required: true
          });
          // Set default value in filterValues
          this.filterValues['fechaInicio'] = defaultFechaInicio;
        }

        if (!hasFechaFin) {
          this.filterList.unshift({
            fieldKey: 'fechaFin',
            conditional: 'equal',
            connector: 'AND',
            type: 'date',
            value: defaultFechaFin,
            required: true
          });
          // Set default value in filterValues
          this.filterValues['fechaFin'] = defaultFechaFin;

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
      this.errorMessage = 'Error inesperado al cargar configuraciÃ³n';
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

  private resolveFilterFieldKey(filter: any): string {
    const nomcampo = filter?.nomcampo;
    if (typeof nomcampo === 'string' && nomcampo.trim().length > 0) {
      return nomcampo.trim();
    }

    const idDetvista = Number(filter?.idDetvista);
    if (!Number.isNaN(idDetvista) && this.vistaFieldById[idDetvista]) {
      return this.vistaFieldById[idDetvista];
    }

    if (!Number.isNaN(idDetvista) && this.reportConfig?.columns?.length) {
      const column = this.reportConfig.columns.find(col => Number(col.idDetvista) === idDetvista);
      if (column?.nomcampo) {
        return column.nomcampo;
      }
    }

    return String(filter?.idDetvista ?? '');
  }

  private mapFieldNameToParamName(fieldName: string): string {
    const normalized = String(fieldName)
      .trim()
      .toLowerCase()
      .replace(/[\s_]/g, '');

    // Normalize aliases from report metadata to backend query params.
    const nameMap: { [key: string]: string } = {
      'fechainicio': 'fechaInicio',
      'fechafin': 'fechaFin',
      'empresa': 'empresa',
      'numeroidempresa': 'empresa',
      'nitempresa': 'empresa',
      'afiliacion': 'afiliacion',
      'numeroafiliacionpago': 'afiliacion',
      'cuentapensionado': 'cuentaPensionado',
      'numerocuentapensionado': 'cuentaPensionado',
      'documento': 'documento',
      'numeroidpensionado': 'documento',
      'tipodocumento': 'tipoDocumento',
      'tipoid': 'tipoDocumento',
      'cuentapagadora': 'cuentaPagadora',
      'cuentaempleador': 'cuentaEmpleador',
      'numerocuentaempleador': 'cuentaEmpleador',
      'identificadordetalle': 'identificadorDetalle',
      'oficinaapertura': 'oficinaApertura',
      'fechaabonomesada': 'fechaAbonoMesada',
      'numerodocumento': 'numeroDocumento',
      'periodonomina': 'periodoNomina',
      'banco': 'banco',
      'cuenta': 'cuenta'
    };

    return nameMap[normalized] || String(fieldName).trim();
  }

  private applyPaginatedResponse(response: any): void {
    const items = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.items)
        ? response.items
        : [];

    const totalRecords = Number(response?.total ?? response?.totalRecords ?? items.length);
    const page = Number(response?.page ?? 1);
    const pageSize = Number(response?.pageSize ?? this.pageSize);
    const totalPages = Number(
      response?.totalPages ??
      (pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 1)
    );

    this.resultsList = items;
    this.totalRecords = totalRecords;
    this.totalPages = totalPages;
    this.currentPage = page;
    this.pageSize = pageSize;
  }

  private resolveEndpoint(): string | null {
    if (!this.vista) return null;

    const endpointMap: { [key: number]: string } = {
      1: 'pagos',
      2: 'rechazos',
      3: 'certificados',
      4: 'aperturas',
      5: 'inactivas'
    };

    return endpointMap[this.vista.idvista] || null;
  }

  private buildQueryParams(endpoint: string, page: number, size: number): MesadasQueryParams | null {
    this.unsupportedFilters = [];
    const fechaInicio = this.filterValues['fechaInicio'] ? this.formatDate(this.filterValues['fechaInicio']) : null;
    const fechaFin = this.filterValues['fechaFin'] ? this.formatDate(this.filterValues['fechaFin']) : null;

    if (!fechaInicio || !fechaFin) {
      alert('Por favor seleccione Fecha inicio y Fecha fin para generar el reporte');
      return null;
    }

    const queryParams: MesadasQueryParams = {
      fechaInicio,
      fechaFin,
      page,
      size
    };

    this.filterList.forEach(filter => {
      const fieldKey = String(filter.fieldKey).trim();
      const value = this.filterValues[fieldKey];

      if (fieldKey === 'fechaInicio' || fieldKey === 'fechaFin') {
        return;
      }

      const normalizedValue = typeof value === 'string' ? value.trim() : value;
      if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
        const paramName = this.mapFieldNameToParamName(fieldKey);
        if ((endpoint === 'pagos' || endpoint === 'rechazos') && !this.mesadasAllowedFilters.has(paramName)) {
          if (!this.unsupportedFilters.includes(fieldKey)) {
            this.unsupportedFilters.push(fieldKey);
          }
          return;
        }
        (queryParams as any)[paramName] = normalizedValue;
      }
    });

    return queryParams;
  }

  private async fetchPage(endpoint: string, queryParams: MesadasQueryParams): Promise<any | null> {
    if (endpoint === 'pagos') {
      const result = await this.mesadasDatasource.consultarPagos(queryParams);
      if (isRight(result)) return result.right;
      this.errorMessage = result.left.message;
      alert('Error al generar reporte: ' + result.left.message);
      return null;
    }

    if (endpoint === 'rechazos') {
      const result = await this.mesadasDatasource.consultarRechazos(queryParams);
      if (isRight(result)) return result.right;
      this.errorMessage = result.left.message;
      alert('Error al generar reporte: ' + result.left.message);
      return null;
    }

    if (endpoint === 'aperturas') {
      const result = await this.cuentasDatasource.consultarAperturas(queryParams);
      if (isRight(result)) return result.right;
      this.errorMessage = result.left.message;
      alert('Error al generar reporte: ' + result.left.message);
      return null;
    }

    if (endpoint === 'inactivas') {
      const result = await this.cuentasDatasource.consultarInactivas(queryParams);
      if (isRight(result)) return result.right;
      this.errorMessage = result.left.message;
      alert('Error al generar reporte: ' + result.left.message);
      return null;
    }

    if (endpoint === 'certificados') {
      const result = await this.mesadasDatasource.consultarCertificados(queryParams);
      if (isRight(result)) return result.right;
      this.errorMessage = result.left.message;
      alert('Error al generar reporte: ' + result.left.message);
      return null;
    }

    return null;
  }

  private async fetchAllDataForExport(): Promise<any[] | null> {
    if (!this.vista) {
      alert('No se ha cargado la vista del reporte');
      return null;
    }

    const endpoint = this.resolveEndpoint();
    if (!endpoint) {
      alert('No se pudo determinar el endpoint para esta vista');
      return null;
    }

    const exportPageSize = this.exportPageSize;
    const firstQueryParams = this.buildQueryParams(endpoint, 1, exportPageSize);
    if (!firstQueryParams) return null;

    const cacheParams = { ...firstQueryParams };
    delete (cacheParams as any).page;
    delete (cacheParams as any).size;
    const exportCacheKey = `${endpoint}|${JSON.stringify(cacheParams)}`;

    if (this.lastExportCacheKey === exportCacheKey && this.lastExportCacheData) {
      return [...this.lastExportCacheData];
    }

    const firstResponse = await this.fetchPage(endpoint, firstQueryParams);
    if (!firstResponse) return null;
    const firstItems = Array.isArray(firstResponse?.data)
      ? firstResponse.data
      : Array.isArray(firstResponse?.items)
        ? firstResponse.items
        : [];

    const pageSize = Number(firstResponse?.pageSize ?? exportPageSize);
    const totalRecords = Number(firstResponse?.total ?? firstResponse?.totalRecords ?? firstItems.length);
    const totalPages = Number(
      firstResponse?.totalPages ??
      (pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 1)
    );
    const allItems = [...firstItems];

    const pendingPages: number[] = [];
    for (let page = 2; page <= totalPages; page++) {
      pendingPages.push(page);
    }

    for (let i = 0; i < pendingPages.length; i += this.exportConcurrency) {
      const pageBatch = pendingPages.slice(i, i + this.exportConcurrency);
      const batchResponses = await Promise.all(
        pageBatch.map(async (page) => {
          const pageQueryParams: MesadasQueryParams = { ...firstQueryParams, page, size: pageSize };
          const pageResponse = await this.fetchPage(endpoint, pageQueryParams);
          return { page, pageResponse };
        })
      );

      for (const { pageResponse } of batchResponses.sort((a, b) => a.page - b.page)) {
        if (!pageResponse) return null;

        const pageItems = Array.isArray(pageResponse?.data)
          ? pageResponse.data
          : Array.isArray(pageResponse?.items)
            ? pageResponse.items
            : [];
        allItems.push(...pageItems);
      }
    }

    this.lastExportCacheKey = exportCacheKey;
    this.lastExportCacheData = allItems;
    return [...allItems];
  }

  async onGenerate(): Promise<void> {
    if (!this.vista) {
      alert('No se ha cargado la vista del reporte');
      return;
    }

    const endpoint = this.resolveEndpoint();
    if (!endpoint) {
      alert('No se pudo determinar el endpoint para esta vista');
      return;
    }
    const queryParams = this.buildQueryParams(endpoint, this.currentPage, this.pageSize);
    if (!queryParams) return;

    this.isLoading = true;
    try {
      const response = await this.fetchPage(endpoint, queryParams);
      if (!response) return;

      this.applyPaginatedResponse(response);
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
    this.isLoading = true;
    let exportSource: any[] | null = null;
    try {
      exportSource = await this.fetchAllDataForExport();
    } finally {
      this.isLoading = false;
    }

    if (!exportSource || exportSource.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders(exportSource);
    const data = this.prepareExportData(exportSource);
    const filename = this.generateFilename();

    await this.documentExport.exportExcel(title, headers, data, filename);
  }

  async onGeneratecsv(): Promise<void> {
    this.isLoading = true;
    let exportSource: any[] | null = null;
    try {
      exportSource = await this.fetchAllDataForExport();
    } finally {
      this.isLoading = false;
    }

    if (!exportSource || exportSource.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders(exportSource);
    const data = this.prepareExportData(exportSource);
    const filename = this.generateFilename();

    await this.documentExport.exportCsv(title, headers, data, filename);
  }

  async onGeneratetxt(): Promise<void> {
    this.isLoading = true;
    let exportSource: any[] | null = null;
    try {
      exportSource = await this.fetchAllDataForExport();
    } finally {
      this.isLoading = false;
    }

    if (!exportSource || exportSource.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders(exportSource);
    const data = this.prepareExportData(exportSource);
    const filename = this.generateFilename();

    await this.documentExport.exportTxt(title, headers, data, filename);
  }
  
  async onGeneratepdf(): Promise<void> {
    this.isLoading = true;
    let exportSource: any[] | null = null;
    try {
      exportSource = await this.fetchAllDataForExport();
    } finally {
      this.isLoading = false;
    }

    if (!exportSource || exportSource.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const title = this.reportConfig?.nomconsulta || 'Reporte';
    const headers = this.getExportHeaders(exportSource);
    const data = this.prepareExportData(exportSource);
    const filename = this.generateFilename();

    await this.documentExport.exportPdf(title, headers, data, filename);
  }

  /**
   * Get headers for export based on configured columns
   */
  private getExportHeaders(sourceData: any[] = this.resultsList): string[] {
    if (this.columnsList.length > 0) {
      return this.columnsList.map(col => col.text);
    }
    
    // Fallback: use keys from first result item
    if (sourceData.length > 0) {
      return Object.keys(sourceData[0]);
    }
    
    return [];
  }

  /**
   * Prepare data for export by filtering only the configured columns
   */
  private prepareExportData(sourceData: any[] = this.resultsList): any[] {
    if (this.columnsList.length === 0) {
      return sourceData;
    }

    // Map results to only include configured columns in the correct order
    return sourceData.map(item => {
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






