import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './edit-button.html',
  styleUrls: ['./edit-button.css']
})
export class EditButton {

}
