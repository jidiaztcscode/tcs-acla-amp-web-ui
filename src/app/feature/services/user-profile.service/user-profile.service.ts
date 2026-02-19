import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private perfiles = [
    { nombre: 'GG-Rol AMP_Prod_Admin', descripcion: 'Perfil de administración', activo: true },
    { nombre: 'GG-Rol AMP_Prod_Analista', descripcion: 'Perfil de analista', activo: true },
    { nombre: 'GG-Rol AMP_Prod_Reintegros', descripcion: 'Perfil de reintegros', activo: true },
    { nombre: 'GG-Rol AMP_Prod_Autorización', descripcion: 'Perfil de Autorizaciones', activo: true },
    { nombre: 'GG-Rol AMP_Prod_GestionPerfiles', descripcion: 'Perfil de Perfiles', activo: true },
    { nombre: 'GG-Rol AMP_Prod_GestionPerfiles', descripcion: 'Perfil de Prueba', activo: true },
    { nombre: 'GG-Rol AMP_Prod_GestionPerfiles', descripcion: 'Perfil de Prueba2', activo: true },

  ];

  constructor() {}

  getPerfiles(page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedData = this.perfiles.slice(start, end);
    return {
      data: pagedData,
      total: this.perfiles.length
    };
  }
}
