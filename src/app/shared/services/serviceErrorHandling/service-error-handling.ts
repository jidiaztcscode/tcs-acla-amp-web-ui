import { Injectable } from '@angular/core';
import { IServiceErrorHandling } from '../../interfaces/serviceErrorHandling';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceErrorHandling {
  private subject = new Subject<IServiceErrorHandling>();

  handleError(status: number, code: string = 'ERR', customMsg: string) {
    if (status != 401 && status != 403) {
      this.subject.next({
        showError: true,
        status,
        code,
        message: this.getErrorMessage(status, code, customMsg)
      });
    }
  }

  getError(): Observable<IServiceErrorHandling> {
    return this.subject.asObservable();
  }

  private getErrorMessage(status: number, code = 'ERR', customMsg: string) {
    if (status == 500 || status == 400) {
      return 'Se presento un problema en el sistema, comuníquese con el administrador';
    } else if (status == 404 && code == 'INFO_NOT_FOUND') {
      return customMsg;
    } else if (status == 422 && (code == 'NOT_ACCEPTABLE')) {
      return 'El archivo es demasiado pesado para realizar la exportación.';
    } else if (status == 422 && (code == 'UNSUPPORTED_MEDIA_TYPE')) {
      return 'El tipo de archivo que intenta exportar no es permitido para esta operación.';
    } else {
      return 'Error insesperado'
    }
  }
}
