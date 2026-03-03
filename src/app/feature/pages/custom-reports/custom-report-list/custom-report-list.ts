import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportConfigDatasource } from '../../../../data/datasources/report-config.datasource';
import { ReportConfig } from '../../../../domain/models/report-config.model';
import { MesadasDatasource } from '../../../../data/datasources/mesadas.datasource';
import { MesadasQueryParams, PagoMesada } from '../../../../domain/models/mesadas.model';
import { CuentasDatasource } from '../../../../data/datasources/cuentas.datasource';
import { CuentasQueryParams, AperturaCuenta } from '../../../../domain/models/cuentas.model';
import { isRight } from 'fp-ts/Either';

export interface Report {
  id?: number;
  category: string;
  name: string;
  description: string;
  user: string;
  dateCreated: string;
}

@Component({
  selector: 'app-custom-report-list',
  templateUrl: './custom-report-list.html',
  styleUrl: './custom-report-list.scss',
  standalone: false,
})
export class CustomReportList implements OnInit {

  router: Router = inject(Router);
  private reportConfigDatasource = inject(ReportConfigDatasource);
  private mesadasDatasource = inject(MesadasDatasource);
  private cuentasDatasource = inject(CuentasDatasource);

  totalPages: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;
  paginatedData: Report[] = [];
  totalItems: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  reportList: Report[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadReports();
  }

  async loadReports(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      // load custom report configs
      const result = await this.reportConfigDatasource.listarReportes();
      let combined: Report[] = [];
      if (isRight(result)) {
        const configs = result.right;
        combined = configs.map(config => this.mapConfigToReport(config));
      } else {
        console.warn('Error loading custom reports:', result.left);
      }

      // prepare default date range (last 30 days)
      const today = new Date();
      const fechaFin = today.toISOString().slice(0,10);
      const desde = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30);
      const fechaInicio = desde.toISOString().slice(0,10);

      const mesadasParams: MesadasQueryParams = {
        fechaInicio,
        fechaFin,
        page: 1,
        size: 1000
      };

      const cuentasParams: CuentasQueryParams = {
        fechaInicio,
        fechaFin,
        page: 1,
        size: 1000
      };

      // load mesadas pagos (map to Report)
      try {
        const mres = await this.mesadasDatasource.consultarPagos(mesadasParams);
        if (isRight(mres)) {
          const page = mres.right;
          const pagos: PagoMesada[] = page.data || [];
          const mapped = pagos.map(p => ({
            category: 'Mesadas',
            name: `Pago ${p.fechaAbonoMesada} - ${p.nombrePensionado}`,
            description: `Valor: ${p.valorMesada}`,
            user: '',
            dateCreated: p.fechaAbonoMesada,
            id: p.identificadorDetalle
          } as Report));
          combined = combined.concat(mapped);
        } else {
          console.warn('Error loading mesadas pagos:', mres.left);
        }
      } catch (e) {
        console.error('Unexpected error loading mesadas pagos:', e);
      }

      // load cuentas aperturas (map to Report)
      try {
        const cres = await this.cuentasDatasource.consultarAperturas(cuentasParams);
        if (isRight(cres)) {
          const page = cres.right;
          const items: AperturaCuenta[] = page.data || [];
          const mapped = items.map(it => ({
            category: 'Cuentas',
            name: `Apertura ${it.fechaAperturaCuenta} - ${it.nombrePensionado}`,
            description: `Cuenta: ${it.numeroCuentaPensionado}`,
            user: '',
            dateCreated: it.fechaAperturaCuenta,
            id: it.idAfiliacion
          } as Report));
          combined = combined.concat(mapped);
        } else {
          console.warn('Error loading cuentas aperturas:', cres.left);
        }
      } catch (e) {
        console.error('Unexpected error loading cuentas aperturas:', e);
      }

      // final combined list
      this.reportList = combined;
      this.totalItems = this.reportList.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.paginate();
    } catch (error) {
      this.errorMessage = 'Error inesperado al cargar reportes';
      console.error('Unexpected error loading reports:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private mapConfigToReport(config: ReportConfig): Report {
    return {
      id: config.idconsulta,
      category: config.idFuncionalidad?.toString() || 'General',
      name: config.nomconsulta,
      description: config.descconsulta,
      user: config.usuCreaApp || 'Sistema',
      dateCreated: config.fecCreacion || new Date().toISOString()
    };
  }

  onDescargar() {
    throw new Error("Metodo no implementado");
  }

  onAdd() {
    let url = '/custom-reports/new'
    this.router.navigate([url]);
  }

  async onDelete(el: Report): Promise<void> {
    if (!el.id) {
      console.error('No se puede eliminar: ID no disponible');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar el reporte "${el.name}"?`)) {
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.reportConfigDatasource.eliminarReporte(el.id);
      
      if (isRight(result)) {
        console.log('Reporte eliminado exitosamente');
        await this.loadReports(); // Reload the list
      } else {
        this.errorMessage = result.left.message;
        console.error('Error eliminando reporte:', result.left);
        alert('Error al eliminar el reporte: ' + result.left.message);
      }
    } catch (error) {
      console.error('Error inesperado al eliminar:', error);
      alert('Error inesperado al eliminar el reporte');
    } finally {
      this.isLoading = false;
    }
  }

  paginate() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.reportList.slice(start, end);
  }

  cambiarPagina(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginate();
  }

  validatePage() {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages ?? 1;
    }
  }

  onEdit(el: Report) {
    if (!el.id) {
      console.error('No se puede editar: ID no disponible');
      return;
    }
    let url = '/custom-reports/' + el.id;
    this.router.navigate([url]);
    console.log('Editar elemento:', el);
  }
  
  onGenerate(el: Report) {
    if (!el.id) {
      console.error('No se puede generar: ID no disponible');
      return;
    }
    let url = '/custom-reports/generate-report/' + el.id;
    this.router.navigate([url]);
    console.log('Generar reporte:', el);
  }

}
