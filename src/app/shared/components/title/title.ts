import { Component, input } from '@angular/core';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [],
  templateUrl: './title.html',
  styleUrls: ['./title.scss']
})
export class Title {
  text = input('');
}
