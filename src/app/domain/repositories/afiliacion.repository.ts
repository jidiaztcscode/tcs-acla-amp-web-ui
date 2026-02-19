import { Either } from 'fp-ts/Either';
import { Afiliacion } from '../models/afiliacion.model';

export abstract class AfiliacionRepository {
  abstract consultarAfiliaciones(): Promise<Either<Error, Afiliacion[]>>;
}
