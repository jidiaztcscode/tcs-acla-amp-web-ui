import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Either, left, right } from 'fp-ts/Either';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponse } from '../../domain/models/paginated-response.model';
import { CertificadoMesada, MesadasQueryParams, PagoMesada, RechazoMesada } from '../../domain/models/mesadas.model';

export interface IMesadasDatasource {
  consultarPagos(params: MesadasQueryParams): Promise<Either<Error, PaginatedResponse<PagoMesada>>>;
  consultarRechazos(params: MesadasQueryParams): Promise<Either<Error, PaginatedResponse<RechazoMesada>>>;
  consultarCertificados(fechaInicio: string, fechaFin: string): Promise<Either<Error, CertificadoMesada[]>>;
}

@Injectable({ providedIn: 'root' })
export class MesadasDatasource implements IMesadasDatasource {
  // Adjust the base URL based on your backend context path
  // If backend runs with context-path=/pensionados, use: 'http://localhost:8081/pensionados/api/mesadas'
  // Otherwise, use: 'http://localhost:8081/api/mesadas'
  private apiUrl = 'http://localhost:8081/api/pensionados/api/mesadas';

  constructor(private http: HttpClient) {}

  async consultarPagos(params: MesadasQueryParams): Promise<Either<Error, PaginatedResponse<PagoMesada>>> {
    try {
      const httpParams = this.buildHttpParams(params);
      const data = await firstValueFrom(
        this.http.get<PaginatedResponse<PagoMesada>>(`${this.apiUrl}/pagos`, { params: httpParams })
      );
      return right(data);
    } catch (e) {
      return left(new Error('Error consultando pagos de mesadas'));
    }
  }

  async consultarRechazos(params: MesadasQueryParams): Promise<Either<Error, PaginatedResponse<RechazoMesada>>> {
    try {
      const httpParams = this.buildHttpParams(params);
      const data = await firstValueFrom(
        this.http.get<PaginatedResponse<RechazoMesada>>(`${this.apiUrl}/rechazos`, { params: httpParams })
      );
      return right(data);
    } catch (e) {
      return left(new Error('Error consultando rechazos de mesadas'));
    }
  }

  async consultarCertificados(fechaInicio: string, fechaFin: string): Promise<Either<Error, CertificadoMesada[]>> {
    try {
      const params = new HttpParams()
        .set('fechaInicio', fechaInicio)
        .set('fechaFin', fechaFin);
      
      const data = await firstValueFrom(
        this.http.get<CertificadoMesada[]>(`${this.apiUrl}/certificados`, { params })
      );
      return right(data);
    } catch (e) {
      return left(new Error('Error consultando certificados de mesadas'));
    }
  }

  private buildHttpParams(params: MesadasQueryParams): HttpParams {
    let httpParams = new HttpParams()
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);

    if (params.empresa !== undefined) {
      httpParams = httpParams.set('empresa', params.empresa.toString());
    }
    if (params.afiliacion !== undefined) {
      httpParams = httpParams.set('afiliacion', params.afiliacion.toString());
    }
    if (params.cuentaPensionado !== undefined) {
      httpParams = httpParams.set('cuentaPensionado', params.cuentaPensionado.toString());
    }
    if (params.documento !== undefined) {
      httpParams = httpParams.set('documento', params.documento.toString());
    }
    if (params.tipoDocumento) {
      httpParams = httpParams.set('tipoDocumento', params.tipoDocumento);
    }
    if (params.cuentaPagadora !== undefined) {
      httpParams = httpParams.set('cuentaPagadora', params.cuentaPagadora.toString());
    }
    // Backend expects 'page' and 'size' parameters
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    // Backend expects 'size' parameter
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.direction) {
      httpParams = httpParams.set('direction', params.direction);
    }

    return httpParams;
  }
}
