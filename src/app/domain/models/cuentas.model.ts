export interface AperturaCuenta {
  idAfiliacion?: number;
  numeroIdPensionado?: number;
  desTipoIdentificacion?: string;
  nombrePensionado?: string;
  oficinaApertura?: string;
  numeroCuentaPensionado?: number;
  estadoCuenta?: string;
  fechaAperturaCuenta?: string; // ISO date
  desMedioTransacional?: string;
  desObjetivoCuenta?: string;
  cuentaEmpleador?: number;
  numeroIdEmpresa?: number;
  nombreEmpresa?: string;
}

export interface CuentaInactiva {
  idAfiliacion?: number;
  nombrePensionado?: string;
  numeroIdPensionado?: number;
  desTipoIdentificacion?: string;
  numeroCuentaPensionado?: number;
  fechaAperturaCuenta?: string;
  fechaUltimoRetiro?: string;
  fechaUltimoAbono?: string;
  desObjetivoCuenta?: string;
  desMedioTransacional?: string;
  cuentaEmpleador?: number;
  nombreEmpresa?: string;
  numeroIdEmpresa?: number;
  valorTotalMesadas?: number;
  fechaInactividad?: string;
}

export interface CuentasQueryParams {
  fechaInicio: string; // ISO date yyyy-MM-dd
  fechaFin: string;
  empresa?: number;
  documento?: number;
  tipoDocumento?: string;
  cuentaEmpleador?: number;
  cuentaPensionado?: number;
  cuentaPagadora?: number;
  afiliacion?: number;
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
}

