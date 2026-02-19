import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon-button',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss'
})
export class IconButton {
  disabled = input(false);
  action = input<string>('add');
  color = input<string>('red');
  onClick = output();

  icon: string = 'add_outline';
  ariaLabel: string = 'Agregar';

  constructor() {
    effect(() => {
      this.setIcon(this.action());
    });
  }

  setIcon(type: string) {
    switch (type) {
      case 'edit':
        this.icon = 'edit_circle_outline';
        this.ariaLabel = 'Editar';
        break;
      case 'delete':
        this.icon = 'delete_outline';
        this.ariaLabel = 'Eliminar';
        break;
      case 'add':
        this.icon = 'add_circle_outline';
        this.ariaLabel = 'Agregar';
        break;
      case 'download':
        this.icon = 'open_in_browser'
        this.ariaLabel = 'Descargar';
        break;
      case 'remove':
        this.icon = 'do_not_disturb_on';
        this.ariaLabel = 'Remover';
        break;
    }
  }
}

