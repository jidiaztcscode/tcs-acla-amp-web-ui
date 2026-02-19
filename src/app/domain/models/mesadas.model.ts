export interface PagoMesada {
  identificadorDetalle: number;
  numeroAfiliacionPago: number;
  oficinaApertura: string;
  numeroCuentaPensionado: string;
  fechaAbonoMesada: string;
  numeroIdPensionado: number;
  tipoId: string;
  tipoIdentificacion: string;
  tipoIdColpensiones: string;
  nombrePensionado: string;
  numeroCuentaPagadora: string;
  valorMesada: number;
  estadoPago: string;
  numeroIdEmpresa: number;
  nombreEmpresa: string;
}

export interface RechazoMesada {
  identificadorDetalle: number;
  numeroAfiliacionPago: number;
  oficinaApertura: string;
  numeroCuentaPensionado: string;
  fechaAbonoMesada: string;
  numeroIdPensionado: number;
  tipoId: string;
  tipoIdentificacion: string;
  tipoIdColpensiones: string;
  nombrePensionado: string;
  numeroCuentaPagadora: string;
  valorMesada: number;
  motivoRechazo: string;
  numeroIdEmpresa: number;
  nombreEmpresa: string;
}

export interface CertificadoMesada {
  tipoDocumento: string;
  numeroDocumento: string;
  primerApellido: string;
  segundoApellido: string;
  primerNombre: string;
  segundoNombre: string;
  periodoNomina: string;
  referencia: string;
  banco: string;
  sucursal: string;
  cuenta: string;
  tipoCuenta: string;
  valorNeto: number;
  estadoPago: string;
  fechaPago: string;
  descripcionCausalNoPago: string;
  causalNoPago: string;
}

export interface MesadasQueryParams {
  fechaInicio: string;  // ISO date yyyy-MM-dd
  fechaFin: string;
  empresa?: number;
  afiliacion?: number;
  cuentaPensionado?: number;
  documento?: number;
  tipoDocumento?: string;
  cuentaPagadora?: number;
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
}
