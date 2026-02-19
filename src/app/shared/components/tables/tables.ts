import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditButton } from '../buttons/edit-button/edit-button';
import { Switch } from '../../../feature/components/switch';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.html',
  styleUrls: ['./tables.css'],
  standalone: true,
  imports: [CommonModule, EditButton, Switch]
})
export class Tables implements OnChanges {
  @Input() data: any[] = [];

  columnas: string[] = ['nombre', 'descripcion', 'modificar', 'Activar/Desactivar'];

  currentPage = 1;
  pageSize = 5;
  paginatedData: any[] = [];
  totalPages = 0;
  totalItems = 0;

  ngOnChanges() {
    this.totalItems = this.data.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.validatePage();
    this.paginate();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.data.slice(start, end);
  }

  cambiarPagina(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginate();
  }

  validatePage() {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  onToggleChange(el: any, newValue: boolean) {
    el.activo = newValue;
    console.log('Nuevo estado:', newValue);
  }

  onEditar(el: any) {
    console.log('Editar elemento:', el);
  }
}
