import { Component, EventEmitter, input, Input, output, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-text-button',
  imports: [
    MatButtonModule
  ],
  templateUrl: './text-button.html',
  styleUrl: './text-button.scss'
})
export class TextButton {
  // @Input() disabled: boolean = false;
  // @Output() onClick: EventEmitter<any> = new EventEmitter();
  disabled = input(false);
  onClick = output();
}
