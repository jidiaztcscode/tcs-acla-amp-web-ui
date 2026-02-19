import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


@Component({
  standalone: true,
  selector: 'app-drag-and-drop',
  imports: [CommonModule, DragDropModule],
  templateUrl: './drag-and-drop.html',
  styleUrls: ['./drag-and-drop.css']
})

export class DragAndDrop {
  opcionesDisponibles: string[] = ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'];
  opcionesSeleccionadas: string[] = [];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}


