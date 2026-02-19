import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Either, left, right } from 'fp-ts/Either';
import { firstValueFrom } from 'rxjs';
import { ReportConfig } from '../../domain/models/report-config.model';

export interface IReportConfigDatasource {
  listarReportes(): Promise<Either<Error, ReportConfig[]>>;
  obtenerReporte(id: number): Promise<Either<Error, ReportConfig>>;
  crearReporte(config: ReportConfig): Promise<Either<Error, ReportConfig>>;
  actualizarReporte(id: number, config: ReportConfig): Promise<Either<Error, ReportConfig>>;
  eliminarReporte(id: number): Promise<Either<Error, void>>;
}

@Injectable({ providedIn: 'root' })
export class ReportConfigDatasource implements IReportConfigDatasource {
  // Adjust the base URL based on your backend context path
  // If backend runs with context-path=/pensionados, use: 'http://localhost:8081/pensionados/api/reportes'
  // Otherwise, use: 'http://localhost:8081/api/reportes'
  private apiUrl = 'http://localhost:8081/api/pensionados/api/reportes';

  constructor(private http: HttpClient) {}

  async listarReportes(): Promise<Either<Error, ReportConfig[]>> {
    try {
      const data = await firstValueFrom(this.http.get<ReportConfig[]>(this.apiUrl));
      return right(data);
    } catch (e) {
      return left(new Error('Error listando reportes'));
    }
  }

  async obtenerReporte(id: number): Promise<Either<Error, ReportConfig>> {
    try {
      // Backend expects BigDecimal, convert number to string/decimal
      const idAsString = id.toString();
      const data = await firstValueFrom(this.http.get<ReportConfig>(`${this.apiUrl}/${idAsString}`));
      return right(data);
    } catch (e) {
      return left(new Error(`Error obteniendo reporte ${id}`));
    }
  }

  async crearReporte(config: ReportConfig): Promise<Either<Error, ReportConfig>> {
    try {
      const data = await firstValueFrom(this.http.post<ReportConfig>(this.apiUrl, config));
      return right(data);
    } catch (e) {
      return left(new Error('Error creando reporte'));
    }
  }

  async actualizarReporte(id: number, config: ReportConfig): Promise<Either<Error, ReportConfig>> {
    try {
      const idAsString = id.toString();
      const data = await firstValueFrom(this.http.put<ReportConfig>(`${this.apiUrl}/${idAsString}`, config));
      return right(data);
    } catch (e) {
      return left(new Error(`Error actualizando reporte ${id}`));
    }
  }

  async eliminarReporte(id: number): Promise<Either<Error, void>> {
    try {
      const idAsString = id.toString();
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${idAsString}`));
      return right(undefined);
    } catch (e) {
      return left(new Error(`Error eliminando reporte ${id}`));
    }
  }
}
