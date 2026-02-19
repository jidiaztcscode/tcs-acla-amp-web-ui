import { Injectable } from '@angular/core';
import { AfiliacionRepository } from '../../domain/repositories/afiliacion.repository';
import { AfiliacionDatasource } from '../datasources/afiliacion.datasource';
import { Either } from 'fp-ts/Either';
import { Afiliacion } from '../../domain/models/afiliacion.model';

@Injectable({ providedIn: 'root' })
export class AfiliacionRepositoryImpl implements AfiliacionRepository {
  constructor(private datasource: AfiliacionDatasource) {}

  consultarAfiliaciones(): Promise<Either<Error, Afiliacion[]>> {
    return this.datasource.consultarAfiliaciones();
  }
}
