import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-button.html',
  styleUrls: ['./add-button.css']
})
export class AddButton {
  disabled = input(false);
  onClick = output();
}
