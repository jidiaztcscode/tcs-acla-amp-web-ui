import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-download-report-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './download-report-button.html',
  styleUrls: ['./download-report-button.css']
})
export class DownloadReportButton {
}
