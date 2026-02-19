import { Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AfiliacionDatasource } from '../../data/datasources/afiliacion.datasource';
import { AfiliacionRepositoryImpl } from '../../data/repositories/afiliacion.repository.impl';
import { ConsultarAfiliacionesUseCase } from '../../domain/use-cases/consultar-afiliaciones.usecase';

export const AFILIACION_PROVIDERS: Provider[] = [
  {
    provide: AfiliacionDatasource,
    useFactory: (http: HttpClient) => new AfiliacionDatasource(http),
    deps: [HttpClient],
  },
  {
    provide: AfiliacionRepositoryImpl,
    useFactory: (datasource: AfiliacionDatasource) => new AfiliacionRepositoryImpl(datasource),
    deps: [AfiliacionDatasource],
  },
  {
    provide: ConsultarAfiliacionesUseCase,
    useFactory: (repo: AfiliacionRepositoryImpl) => new ConsultarAfiliacionesUseCase(repo),
    deps: [AfiliacionRepositoryImpl],
  },
];
