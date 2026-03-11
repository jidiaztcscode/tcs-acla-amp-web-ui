import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Either, left, right } from 'fp-ts/Either';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponse } from '../../domain/models/paginated-response.model';
import { AperturaCuenta, CuentaInactiva, CuentasQueryParams } from '../../domain/models/cuentas.model';

export interface ICuentasDatasource {
  consultarAperturas(params: CuentasQueryParams): Promise<Either<Error, PaginatedResponse<AperturaCuenta>>>;
  consultarInactivas(params: CuentasQueryParams): Promise<Either<Error, PaginatedResponse<CuentaInactiva>>>;
}

@Injectable({ providedIn: 'root' })
export class CuentasDatasource implements ICuentasDatasource {
  // If backend runs with context-path=/pensionados, use: 'http://localhost:8081/pensionados/api/cuentas'
  // Otherwise, use: 'http://localhost:8081/api/cuentas'
  private apiUrl = 'http://localhost:8081/api/pensionados/api/cuentas';

  constructor(private http: HttpClient) {}

  async consultarAperturas(params: CuentasQueryParams): Promise<Either<Error, PaginatedResponse<AperturaCuenta>>> {
    try {
      let httpParams = this.buildBaseParams(params);
      if (params.cuentaPensionado !== undefined) {
        httpParams = httpParams.set('cuentaPensionado', params.cuentaPensionado.toString());
      }
      if (params.cuentaEmpleador !== undefined) {
        httpParams = httpParams.set('cuentaEmpleador', params.cuentaEmpleador.toString());
      }
      if (params.cuentaPagadora !== undefined) {
        httpParams = httpParams.set('cuentaPagadora', params.cuentaPagadora.toString());
      }
      if (params.afiliacion !== undefined) {
        httpParams = httpParams.set('afiliacion', params.afiliacion.toString());
      }
      const data = await firstValueFrom(
        this.http.get<PaginatedResponse<AperturaCuenta>>(`${this.apiUrl}/aperturas`, { params: httpParams })
      );
      return right(data);
    } catch (e) {
      return left(new Error('Error consultando aperturas de cuentas'));
    }
  }

  async consultarInactivas(params: CuentasQueryParams): Promise<Either<Error, PaginatedResponse<CuentaInactiva>>> {
    try {
      let httpParams = this.buildBaseParams(params);
      if (params.cuentaEmpleador !== undefined) {
        httpParams = httpParams.set('cuentaEmpleador', params.cuentaEmpleador.toString());
      }
      const data = await firstValueFrom(
        this.http.get<PaginatedResponse<CuentaInactiva>>(`${this.apiUrl}/inactivas`, { params: httpParams })
      );
      return right(data);
    } catch (e) {
      return left(new Error('Error consultando cuentas inactivas'));
    }
  }

  private buildBaseParams(params: CuentasQueryParams): HttpParams {
    let httpParams = new HttpParams()
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);

    if (params.empresa !== undefined) {
      httpParams = httpParams.set('empresa', params.empresa.toString());
    }
    if (params.documento !== undefined) {
      httpParams = httpParams.set('documento', params.documento.toString());
    }
    if (params.tipoDocumento) {
      httpParams = httpParams.set('tipoDocumento', params.tipoDocumento);
    }

    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
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
