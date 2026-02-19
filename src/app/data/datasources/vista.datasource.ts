import { Injectable } from '@angular/core';
import { Either, left, right } from 'fp-ts/Either';
import { Vista, VistaColumna } from '../../domain/models/report-config.model';
import { PagoMesada, RechazoMesada, CertificadoMesada } from '../../domain/models/mesadas.model';

// Define the available mesadas report types
export interface MesadasReportType {
  idvista: number;
  nomvista: string;
  descvista: string;
  endpoint: string;
  modelType: 'pago' | 'rechazo' | 'certificado';
}

export const MESADAS_REPORT_TYPES: MesadasReportType[] = [
  {
    idvista: 1,
    nomvista: 'Pagos',
    descvista: 'Reporte de pagos de mesadas',
    endpoint: 'pagos',
    modelType: 'pago'
  },
  {
    idvista: 2,
    nomvista: 'Rechazos',
    descvista: 'Reporte de rechazos de mesadas',
    endpoint: 'rechazos',
    modelType: 'rechazo'
  },
  {
    idvista: 3,
    nomvista: 'Certificados',
    descvista: 'Reporte de certificados de mesadas',
    endpoint: 'certificados',
    modelType: 'certificado'
  }
];

// Define columns for each report type based on the data models
function getPagoColumns(): VistaColumna[] {
  return [
    { idDetvista: 101, idvista: 1, nomcolunna: 'identificadorDetalle', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 102, idvista: 1, nomcolunna: 'numeroAfiliacionPago', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 103, idvista: 1, nomcolunna: 'oficinaApertura', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 104, idvista: 1, nomcolunna: 'numeroCuentaPensionado', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 105, idvista: 1, nomcolunna: 'fechaAbonoMesada', tipoDato: 'date', longitud: 10, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 106, idvista: 1, nomcolunna: 'numeroIdPensionado', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 107, idvista: 1, nomcolunna: 'tipoId', tipoDato: 'string', longitud: 5, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 108, idvista: 1, nomcolunna: 'tipoIdentificacion', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 109, idvista: 1, nomcolunna: 'tipoIdColpensiones', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 110, idvista: 1, nomcolunna: 'nombrePensionado', tipoDato: 'string', longitud: 100, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 111, idvista: 1, nomcolunna: 'numeroCuentaPagadora', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 112, idvista: 1, nomcolunna: 'valorMesada', tipoDato: 'number', longitud: 18, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 113, idvista: 1, nomcolunna: 'estadoPago', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 114, idvista: 1, nomcolunna: 'numeroIdEmpresa', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 115, idvista: 1, nomcolunna: 'nombreEmpresa', tipoDato: 'string', longitud: 100, estado: 'A', pertenecevista: 'S' }
  ];
}

function getRechazoColumns(): VistaColumna[] {
  return [
    { idDetvista: 201, idvista: 2, nomcolunna: 'identificadorDetalle', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 202, idvista: 2, nomcolunna: 'numeroAfiliacionPago', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 203, idvista: 2, nomcolunna: 'oficinaApertura', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 204, idvista: 2, nomcolunna: 'numeroCuentaPensionado', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 205, idvista: 2, nomcolunna: 'fechaAbonoMesada', tipoDato: 'date', longitud: 10, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 206, idvista: 2, nomcolunna: 'numeroIdPensionado', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 207, idvista: 2, nomcolunna: 'tipoId', tipoDato: 'string', longitud: 5, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 208, idvista: 2, nomcolunna: 'tipoIdentificacion', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 209, idvista: 2, nomcolunna: 'tipoIdColpensiones', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 210, idvista: 2, nomcolunna: 'nombrePensionado', tipoDato: 'string', longitud: 100, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 211, idvista: 2, nomcolunna: 'numeroCuentaPagadora', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 212, idvista: 2, nomcolunna: 'valorMesada', tipoDato: 'number', longitud: 18, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 213, idvista: 2, nomcolunna: 'motivoRechazo', tipoDato: 'string', longitud: 200, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 214, idvista: 2, nomcolunna: 'numeroIdEmpresa', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 215, idvista: 2, nomcolunna: 'nombreEmpresa', tipoDato: 'string', longitud: 100, estado: 'A', pertenecevista: 'S' }
  ];
}

function getCertificadoColumns(): VistaColumna[] {
  return [
    { idDetvista: 301, idvista: 3, nomcolunna: 'tipoDocumento', tipoDato: 'string', longitud: 5, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 302, idvista: 3, nomcolunna: 'numeroDocumento', tipoDato: 'number', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 303, idvista: 3, nomcolunna: 'primerApellido', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 304, idvista: 3, nomcolunna: 'segundoApellido', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 305, idvista: 3, nomcolunna: 'primerNombre', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 306, idvista: 3, nomcolunna: 'segundoNombre', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 307, idvista: 3, nomcolunna: 'periodoNomina', tipoDato: 'string', longitud: 10, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 308, idvista: 3, nomcolunna: 'referencia', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 309, idvista: 3, nomcolunna: 'banco', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 310, idvista: 3, nomcolunna: 'sucursal', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 311, idvista: 3, nomcolunna: 'cuenta', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 312, idvista: 3, nomcolunna: 'tipoCuenta', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 313, idvista: 3, nomcolunna: 'valorNeto', tipoDato: 'number', longitud: 18, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 314, idvista: 3, nomcolunna: 'estadoPago', tipoDato: 'string', longitud: 20, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 315, idvista: 3, nomcolunna: 'fechaPago', tipoDato: 'date', longitud: 10, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 316, idvista: 3, nomcolunna: 'descripcionCausalNoPago', tipoDato: 'string', longitud: 200, estado: 'A', pertenecevista: 'S' },
    { idDetvista: 317, idvista: 3, nomcolunna: 'causalNoPago', tipoDato: 'string', longitud: 50, estado: 'A', pertenecevista: 'S' }
  ];
}

export interface IVistaDatasource {
  listarVistas(): Promise<Either<Error, Vista[]>>;
  obtenerVista(id: number): Promise<Either<Error, Vista>>;
  obtenerColumnas(id: number): Promise<Either<Error, VistaColumna[]>>;
  // New methods for mesadas-based reports
  listarVistasMesadas(): Promise<Either<Error, MesadasReportType[]>>;
  obtenerColumnasMesadas(idvista: number): Promise<Either<Error, VistaColumna[]>>;
}

@Injectable({ providedIn: 'root' })
export class VistaDatasource implements IVistaDatasource {
  // Use predefined MESADAS_REPORT_TYPES instead of backend API
  // No need for HTTP calls - data is predefined in this file

  // Use mesadas-based reports instead of backend vistas
  async listarVistas(): Promise<Either<Error, Vista[]>> {
    try {
      // Map MESADAS_REPORT_TYPES to Vista format for compatibility
      const vistas: Vista[] = MESADAS_REPORT_TYPES.map(rt => ({
        idvista: rt.idvista,
        nomvista: rt.nomvista,
        descvista: rt.descvista
      }));
      return right(vistas);
    } catch (e) {
      return left(new Error('Error listando vistas'));
    }
  }

  async obtenerVista(id: number): Promise<Either<Error, Vista>> {
    try {
      const reportType = MESADAS_REPORT_TYPES.find(r => r.idvista === id);
      if (!reportType) {
        return left(new Error(`Vista no encontrada: ${id}`));
      }
      const vista: Vista = {
        idvista: reportType.idvista,
        nomvista: reportType.nomvista,
        descvista: reportType.descvista
      };
      return right(vista);
    } catch (e) {
      return left(new Error(`Error obteniendo vista ${id}`));
    }
  }

  async obtenerColumnas(id: number): Promise<Either<Error, VistaColumna[]>> {
    try {
      // Use the mesadas-based columns
      return this.obtenerColumnasMesadas(id);
    } catch (e) {
      return left(new Error(`Error obteniendo columnas de vista ${id}`));
    }
  }

  // New methods for mesadas-based reports
  async listarVistasMesadas(): Promise<Either<Error, MesadasReportType[]>> {
    try {
      // Return the predefined mesadas report types
      return right(MESADAS_REPORT_TYPES);
    } catch (e) {
      return left(new Error('Error listando vistas de mesadas'));
    }
  }

  async obtenerColumnasMesadas(idvista: number): Promise<Either<Error, VistaColumna[]>> {
    try {
      // Return columns based on the report type
      const reportType = MESADAS_REPORT_TYPES.find(r => r.idvista === idvista);
      if (!reportType) {
        return left(new Error(`Tipo de reporte no encontrado: ${idvista}`));
      }

      let columns: VistaColumna[];
      switch (reportType.modelType) {
        case 'pago':
          columns = getPagoColumns();
          break;
        case 'rechazo':
          columns = getRechazoColumns();
          break;
        case 'certificado':
          columns = getCertificadoColumns();
          break;
        default:
          return left(new Error(`Tipo de modelo no reconocido: ${reportType.modelType}`));
      }

      return right(columns);
    } catch (e) {
      return left(new Error(`Error obteniendo columnas de mesadas para vista ${idvista}`));
    }
  }
}
