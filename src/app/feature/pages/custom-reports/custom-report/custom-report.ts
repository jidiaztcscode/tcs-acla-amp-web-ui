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
  }

  generateSampleDataTable() {
    let sampleData: any = [];
    let sampleFill = 'xxxxxx';

    sampleData = Array.from({ length: 3 }, () =>
      Object.fromEntries(this.displayedColumns
      .map(col => [ col.text, sampleFill ]))
    );

    this.data = sampleData;
  }

  onChangeCheck(checked: boolean, field: any) {
    if (checked) {
      this.displayedColumns.push({ keyName: field.fieldKey, text: field.fieldName });
    } else {
      let itemRemove = this.displayedColumns.findIndex((col: any) => col.keyName === field.fieldKey);
      if (itemRemove !== -1) {
        this.displayedColumns.splice(itemRemove, 1);
      }
    }
    this.displayedColumnsFilter = 
      this.groupDataList.filter((v: any) => v.isSelected)
        .map((value: any) => {
          return { keyName: value.fieldKey, text: value.fieldName, idDetvista: value.idDetvista }
        });
    console.log('this.displayedColumnsFilter ==>>>>', this.displayedColumnsFilter);
    // this.displayedColumnsFilter = JSON.parse(JSON.stringify(this.displayedColumns));
    this.generateSampleDataTable();
  }

  changeTab(index: number) {
    this.selectedTab = index;
  }

  addFilter() {
    this.filtersList.push({
      idDetvista: null, 
      conditional: '',
      connector: ''
    });
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
                  text: field.fieldName
                });
              }
            });
            
            this.displayedColumnsFilter = [...this.displayedColumns];
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
        
        console.log('Configuración de reporte cargada:', config);
      } else {
        this.errorMessage = result.left.message;
        console.error('Error cargando configuración:', result.left);
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado al cargar configuración';
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

    const selectedFields = this.groupDataList.filter(f => f.isSelected);
    if (selectedFields.length === 0) {
      alert('Por favor seleccione al menos una columna');
      return;
    }

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
        .map((f: any, index: number) => ({
          idDetvista: Number(f.idDetvista),
          orden: index + 1,
          incluyente: f.connector?.toUpperCase() || 'Y',
          tipoFiltro: this.mapConditionalToFilterType(f.conditional),
          valFiltro: f.value || ''
        }))
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
