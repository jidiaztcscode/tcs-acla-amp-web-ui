import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-switch',
 standalone: true,
  imports: [FormsModule, MatSlideToggleModule],
  templateUrl: './switch.html',
  styleUrls: ['./switch.css']
})
export class Switch {
  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  onToggleChange(newValue: boolean) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
  
}
