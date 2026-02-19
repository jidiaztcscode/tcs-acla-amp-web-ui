import { Afiliacion } from '../../domain/models/afiliacion.model';
import { Either, right, left } from 'fp-ts/Either';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';


export interface IAfiliacionDatasource {
  consultarAfiliaciones(): Promise<Either<Error, Afiliacion[]>>;
}

@Injectable({ providedIn: 'root' })
export class AfiliacionDatasource implements IAfiliacionDatasource {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) {}

  async consultarAfiliaciones(): Promise<Either<Error, Afiliacion[]>> {
    try {
      const data = await firstValueFrom(this.http.get<Afiliacion[]>(this.apiUrl));
      return right(data);
    } catch (e) {
      return left(new Error('Error consultando afiliaciones'));
    }
  }
}
