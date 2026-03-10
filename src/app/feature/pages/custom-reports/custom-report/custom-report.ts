import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VistaDatasource, MesadasReportType, MESADAS_REPORT_TYPES } from '../../../../data/datasources/vista.datasource';
import { ReportConfigDatasource } from '../../../../data/datasources/report-config.datasource';
import { Vista, VistaColumna, ReportConfig, ReportColumn, ReportFilter } from '../../../../domain/models/report-config.model';
import { isRight } from 'fp-ts/Either';

interface DisplayedColumn {
  keyName: string;
  text: string;
  idDetvista?: number;
}

interface FieldConfig {
  fieldKey: string;
  isSelected: boolean;
  fieldName: string;
  fieldSum: boolean;
  fieldFill: string;
  fieldSize: string;
  fieldAlign: string;
  idDetvista?: number;
}

@Component({
  selector: 'app-custom-report',
  standalone: false,
  templateUrl: './custom-report.html',
  styleUrl: './custom-report.scss',
})
export class CustomReport implements OnInit {
  
  displayedColumns: DisplayedColumn[] = [];
  displayedColumnsFilter: DisplayedColumn[] = [];

  data: any = [];
  selectedTab: number = 0;

  groupDataList: FieldConfig[] = [];
  dataGroup: MesadasReportType[] = [];
  selectedVistaId?: number;
  reportId?: number;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Flag to use mesadas-based reports
  useMesadasReports: boolean = true;

  // Report configuration fields
  reportName: string = '';
  reportDescription: string = '';
  reportHeader: string = 'S';
  reportCount: string = 'S';
  reportControl: string = 'S';

  filtersList: any = [
    { idDetvista: null, conditional: '', connector: '' },
  ];

  connectorOptions: string[] = ['y', 'o'];

  conditionalsList: any = [
    { value: 'equal', name: 'igual que' },
    { value: 'greater_than', name: 'Mayor que' },
    { value: 'less_than', name: 'Menor que' },
    { value: 'contains', name: 'Contiene' },
    { value: 'not_contain', name: 'No contiene' },
  ]

  isShow = signal(false);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vistaDatasource = inject(VistaDatasource);
  private readonly reportConfigDatasource = inject(ReportConfigDatasource);

  async ngOnInit(): Promise<void> {
    const params = this.activatedRoute.snapshot.params;
    console.log('activatedRoute', params);
    
    // Check if we're in edit mode
    if (params['id'] && params['id'] !== 'new') {
      this.reportId = parseInt(params['id']);
      this.isEditMode = true;
      await this.loadReportConfig(this.reportId);
    }
    
    // Load available vistas
    await this.loadVistas();
  }

  onToggle() {
    this.isShow.update((isShow) => !isShow);
  }

  onAgregar() {
    this.generateSampleDataTable();
  }

  onEditar(el: any) {
    console.log(el);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    console.log('this.displayedColumns ===>', this.displayedColumns)
    // this.displayedColumnsFilter = this.displayedColumns;
    this.generateSampleDataTable();
  }

  generateSampleDataTable() {
    if (this.displayedColumns.length === 0) {
      this.data = [];
      return;
    }

    const sampleFill = 'xxxxxx';
    this.data = Array.from({ length: 3 }, () =>
      Object.fromEntries(this.displayedColumns.map(col => [col.keyName, sampleFill]))
    );
  }

  // Allowed filters based on backend controller and frontend field keys
  private readonly allowedFilters = new Set([
    'numeroidempresa',      // empresa
    'numeroafiliacionpago', // afiliacion
    'numerocuentapensionado', // cuentaPensionado
    'numeroidpensionado',   // documento
    'tipoidentificacion',   // tipoDocumento
    'tipoid',               // tipoDocumento (alias)
    'numerocuentapagadora'  // cuentaPagadora
  ]);

  private readonly certificadosFilters = new Set([]);

  private readonly aperturasFilters = new Set([
    // Endpoint /api/cuentas/aperturas params (normalized)
    'empresa',
    'numeroidempresa',
    'documento',
    'numeroidpensionado',
    'tipodocumento',
    'tipoidentificacion',
    'tipoid',
    'cuentapensionado',
    'numerocuentapensionado',
    'cuentaempleador',
    'numerocuentaempleador',
    'cuentapagadora',
    'numerocuentapagadora',
    'afiliacion',
    'numeroafiliacionpago'
  ]);

  onChangeCheck(checked: boolean, field: any) {
    if (checked) {
      this.displayedColumns.push({
        keyName: field.fieldKey,
        text: field.fieldName,
        idDetvista: field.idDetvista
      });
    } else {
      let itemRemove = this.displayedColumns.findIndex((col: any) => col.keyName === field.fieldKey);
      if (itemRemove !== -1) {
        this.displayedColumns.splice(itemRemove, 1);
      }
    }
    this.refreshDisplayedColumnsFilter();
    this.generateSampleDataTable();
  }

  onFieldNameChange(field: FieldConfig) {
    if (!field.isSelected) {
      return;
    }
    const displayed = this.displayedColumns.find(col => col.keyName === field.fieldKey);
    if (displayed) {
      displayed.text = field.fieldName;
    }
    this.refreshDisplayedColumnsFilter();
  }

  private isCertificadosVista(): boolean {
    const selected = this.dataGroup.find(v => v.idvista === this.selectedVistaId);
    const name = selected?.nomvista?.toLowerCase() ?? '';
    return name.includes('certificado');
  }

  private isAperturasVista(): boolean {
    const selected = this.dataGroup.find(v => v.idvista === this.selectedVistaId);
    const name = selected?.nomvista?.toLowerCase() ?? '';
    return name.includes('apertura');
  }

  private normalizeFieldKey(fieldKey: string): string {
    return String(fieldKey).trim().toLowerCase().replace(/[\s_]/g, '');
  }

  private getAllowedFilterKeys(): Set<string> {
    if (this.isCertificadosVista()) {
      return this.certificadosFilters;
    }
    if (this.isAperturasVista()) {
      return this.aperturasFilters;
    }
    return this.allowedFilters;
  }

  private isFieldAllowedAsFilter(fieldKey: string): boolean {
    const normalizedKey = this.normalizeFieldKey(fieldKey);
    return this.getAllowedFilterKeys().has(normalizedKey);
  }

  private refreshDisplayedColumnsFilter(): void {
    const selectedByOrder = this.displayedColumns
      .map(col => this.groupDataList.find(f => f.fieldKey === col.keyName && f.isSelected))
      .filter((field): field is FieldConfig => !!field);

    const allowedSelected = selectedByOrder.filter(field => this.isFieldAllowedAsFilter(field.fieldKey));
    const allowedAll = this.groupDataList.filter(field => this.isFieldAllowedAsFilter(field.fieldKey));

    const source = this.isCertificadosVista()
      ? allowedAll
      : (allowedSelected.length > 0 ? allowedSelected : selectedByOrder);

    this.displayedColumnsFilter = source.map(field => ({
      keyName: field.fieldKey,
      text: field.fieldName,
      idDetvista: field.idDetvista
    }));
    console.log('this.displayedColumnsFilter ==>>>>', this.displayedColumnsFilter);
  }
changeTab(index: number) {
    // Validar que haya columnas seleccionadas antes de ir a filtros o informaciÃƒÂ³n
    if ((index === 1 || index === 2) && this.displayedColumns.length < 1) {
      alert('Debe seleccionar al menos una columna en "Grupo de datos" antes de continuar');
      this.selectedTab = 0;
      return;
    }
    this.selectedTab = index;
  }

  addFilter() {
    this.filtersList.push({
      idDetvista: null,
      conditional: '',
      connector: 'y'
    });
    console.log('Filter added. Current filtersList:', this.filtersList);
  }

  onFilterFieldChange(filter: any) {
    // Ensure idDetvista is stored as a number
    if (filter.idDetvista !== null) {
      filter.idDetvista = Number(filter.idDetvista);
    }
    console.log('Filter field changed:', filter);
  }

  removeFilter(index: number) {
    if (this.filtersList.length > 1) {
      this.filtersList.splice(index, 1);
    } else {
      // Si es el ÃƒÂºltimo filtro, solo lo reiniciamos
      this.filtersList[0] = { idDetvista: null, conditional: '', connector: '' };
    }
  }

  toggleTextJustification(field: any) {
    if(field.isSelected) {
      if(field.fieldAlign === 'left') {
        field.fieldAlign = 'right';
      } else {
        field.fieldAlign = 'left';
      }
    }
  }

  async loadVistas(): Promise<void> {
    this.isLoading = true;
    try {
      const result = await this.vistaDatasource.listarVistasMesadas();
      
      if (isRight(result)) {
        this.dataGroup = result.right;
        console.log('Vistas cargadas:', this.dataGroup);
      } else {
        this.errorMessage = result.left.message;
        console.error('Error cargando vistas:', result.left);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado al cargar vistas';
      console.error('Unexpected error loading vistas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onVistaSelected(vistaId: number): Promise<void> {
    this.selectedVistaId = vistaId;
    await this.loadVistaColumns(vistaId);
  }

   async loadVistaColumns(vistaId: number): Promise<void> {
    this.isLoading = true;
    try {
      const result = await this.vistaDatasource.obtenerColumnas(vistaId);
      
      if (isRight(result)) {
        const columns = result.right;
        // Map VistaColumna to FieldConfig
        this.groupDataList = columns.map(col => this.mapColumnToFieldConfig(col));
        console.log('Columnas cargadas:', this.groupDataList);
        this.refreshDisplayedColumnsFilter();
      } else {
        this.errorMessage = result.left.message;
        console.error('Error cargando columnas:', result.left);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado al cargar columnas';
      console.error('Unexpected error loading columns:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapColumnToFieldConfig(col: VistaColumna): FieldConfig {
    return {
      fieldKey: col.nomcolunna,
      isSelected: false,
      fieldName: col.nomcolunna,
      fieldSum: false,
      fieldFill: '',
      fieldSize: col.longitud?.toString() || '20',
      fieldAlign: 'left',
      idDetvista: col.idDetvista
    };
  }

  async loadReportConfig(reportId: number): Promise<void> {
    this.isLoading = true;
    try {
      const result = await this.reportConfigDatasource.obtenerReporte(reportId);
      
      if (isRight(result)) {
        const config = result.right;
        this.reportName = config.nomconsulta;
        this.reportDescription = config.descconsulta;
        this.reportHeader = config.encab;
        this.reportCount = config.conteo;
        this.reportControl = config.regcontrol;
        this.selectedVistaId = config.idvista;
        
        // Load vista columns first
        if (config.idvista) {
          await this.loadVistaColumns(config.idvista);
          
          // Then mark selected columns and apply their configuration
          if (config.columns) {
            config.columns.forEach(col => {
              const field = this.groupDataList.find(f => f.idDetvista === col.idDetvista);
              if (field) {
                field.isSelected = true;
                field.fieldName = col.nomcampo;
                field.fieldSum = col.sumcolumna === 'S';
                field.fieldFill = col.tiporelleno;
                field.fieldSize = col.longitud.toString();
                field.fieldAlign = col.tipojust === 'D' ? 'right' : 'left';
                
                this.displayedColumns.push({
                  keyName: field.fieldKey,
                  text: field.fieldName,
                  idDetvista: field.idDetvista
                });
              }
            });
            this.refreshDisplayedColumnsFilter();
          }
        }
        
        // Load filters
        if (config.filters && config.filters.length > 0) {
          this.filtersList = config.filters.map(f => ({
            idDetvista: f.idDetvista,
            conditional: this.mapFilterType(f.tipoFiltro),
            connector: f.incluyente,
            value: f.valFiltro
          }));
        }
        
        console.log('ConfiguraciÃƒÂ³n de reporte cargada:', config);
      } else {
        this.errorMessage = result.left.message;
        console.error('Error cargando configuraciÃƒÂ³n:', result.left);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado al cargar configuraciÃƒÂ³n';
      console.error('Unexpected error loading config:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapFilterType(tipoFiltro: number): string {
    const filterMap: { [key: number]: string } = {
      1: 'equal',
      2: 'greater_than',
      3: 'less_than',
      4: 'contains',
      5: 'not_contain'
    };
    return filterMap[tipoFiltro] || 'equal';
  }

  async onSave(): Promise<void> {
    if (!this.reportName || !this.selectedVistaId) {
      alert('Por favor complete el nombre del reporte y seleccione una vista');
      return;
    }

    if (this.displayedColumns.length === 0) {
      alert('Por favor seleccione al menos una columna');
      return;
    }

    const selectedFields = this.displayedColumns
      .map(col => this.groupDataList.find(f => f.fieldKey === col.keyName && f.isSelected))
      .filter((field): field is FieldConfig => !!field);

    const reportConfig: ReportConfig = {
      nomconsulta: this.reportName,
      descconsulta: this.reportDescription,
      idvista: this.selectedVistaId,
      encab: this.reportHeader,
      conteo: this.reportCount,
      regcontrol: this.reportControl,
      columns: selectedFields.map((field, index) => ({
        idDetvista: field.idDetvista!,
        nomcampo: field.fieldName,
        sumcolumna: field.fieldSum ? 'S' : 'N',
        tiporelleno: field.fieldFill,
        tipojust: field.fieldAlign === 'right' ? 'D' : 'I',
        longitud: parseInt(field.fieldSize)
      })),
      filters: this.filtersList
        .filter((f: any) => f.idDetvista && f.conditional)
        .map((f: any, index: number) => {
          // Buscar el nombre del campo basado en idDetvista
          const fieldConfig = this.groupDataList.find(g => g.idDetvista === f.idDetvista);
          return {
            idDetvista: Number(f.idDetvista),
            nomcampo: fieldConfig?.fieldKey || '',
            orden: index + 1,
            incluyente: f.connector?.toUpperCase() || 'Y',
            tipoFiltro: this.mapConditionalToFilterType(f.conditional),
            valFiltro: f.value || ''
          };
        })
    };

    this.isLoading = true;
    try {
      let result;
      if (this.isEditMode && this.reportId) {
        result = await this.reportConfigDatasource.actualizarReporte(this.reportId, reportConfig);
      } else {
        result = await this.reportConfigDatasource.crearReporte(reportConfig);
      }
      
      if (isRight(result)) {
        alert('Reporte guardado exitosamente');
        this.router.navigate(['/custom-reports']);
      } else {
        this.errorMessage = result.left.message;
        alert('Error al guardar el reporte: ' + result.left.message);
      }
    } catch (error) {
      console.error('Error guardando reporte:', error);
      alert('Error inesperado al guardar el reporte');
    } finally {
      this.isLoading = false;
    }
  }

  private mapConditionalToFilterType(conditional: string): number {
    const conditionalMap: { [key: string]: number } = {
      'equal': 1,
      'greater_than': 2,
      'less_than': 3,
      'contains': 4,
      'not_contain': 5
    };
    return conditionalMap[conditional] || 1;
  }
  
}








