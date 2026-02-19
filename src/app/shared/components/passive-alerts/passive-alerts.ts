import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-passive-alerts',
  imports: [],
  templateUrl: './passive-alerts.html',
  styleUrl: './passive-alerts.css'
})
export class PassiveAlerts {
  private data = inject(MAT_DIALOG_DATA);

  ngOnInit(): void {
    console.log('this.data :>> ', this.data);
  }
}
