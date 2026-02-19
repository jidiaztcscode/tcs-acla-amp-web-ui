export interface ReportConfig {
  idconsulta?: number;
  idFuncionalidad?: number;
  idvista?: number;
  nomconsulta: string;
  descconsulta: string;
  encab: string;
  conteo: string;
  regcontrol: string;
  usuCreaApp?: string;
  fecCreacion?: string;
  usuModApp?: string;
  fecModApp?: string;
  columns?: ReportColumn[];
  filters?: ReportFilter[];
}

export interface ReportColumn {
  idDetconsulta?: number;
  idDetvista: number;
  nomcampo: string;
  sumcolumna: string;
  tiporelleno: string;
  tipojust: string;
  longitud: number;
}

export interface ReportFilter {
  idFiltro?: number;
  idDetvista: number;
  orden: number;
  incluyente: string;
  tipoFiltro: number;
  valFiltro: string;
  idDetconsulta2?: number;
}

export interface Vista {
  idvista: number;
  nomvista: string;
  descvista: string;
  usuCreaApp?: string;
  fecCreacion?: string;
  usuModApp?: string;
  fecModApp?: string;
}

export interface VistaColumna {
  idDetvista: number;
  idvista: number;
  nomcolunna: string;
  tipoDato: string;
  longitud: number;
  estado: string;
  pertenecevista: string;
  usuCreaApp?: string;
  fecCreacion?: string;
  usuModApp?: string;
  fecModApp?: string;
}
