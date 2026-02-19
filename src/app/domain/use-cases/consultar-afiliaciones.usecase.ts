import { AfiliacionRepository } from '../repositories/afiliacion.repository';
import { Either, right, left } from 'fp-ts/Either';
import { Afiliacion } from '../models/afiliacion.model';

export class ConsultarAfiliacionesUseCase {
  constructor(private afiliacionRepository: AfiliacionRepository) {}

  async execute(): Promise<Either<Error, Afiliacion[]>> {
    return this.afiliacionRepository.consultarAfiliaciones();
  }
}
