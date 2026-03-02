import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './add-button.html',
  styleUrls: ['./add-button.css']
})
export class AddButton {
  disabled = input(false);
  onClick = output();
}
