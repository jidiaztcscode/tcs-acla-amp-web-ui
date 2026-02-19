import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultarAfiliacionesUseCase } from '../../../domain/use-cases/consultar-afiliaciones.usecase';
import { AFILIACION_PROVIDERS } from '../../components/afiliacion.providers';
import { match } from 'fp-ts/Either';
import { Afiliacion } from '../../../domain/models/afiliacion.model';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-afiliacion-prueba-page',
  templateUrl: './afiliacion-prueba.page.html',
  imports: [
    CommonModule,
    HttpClientModule,
    
  ],
  providers: [
    ...AFILIACION_PROVIDERS,
  ]
})
export class AfiliacionPruebaPageComponent {
  afiliaciones: Afiliacion[] = [];
  error: string | null = null;

  constructor(private consultarAfiliaciones: ConsultarAfiliacionesUseCase) {}

  async cargarAfiliaciones() {
    const result = await this.consultarAfiliaciones.execute();
    match<Error, Afiliacion[], void>(
      err => this.error = err.message,
      data => {
        this.afiliaciones = data;
        this.error = null;
      }
    )(result);
  }
}
