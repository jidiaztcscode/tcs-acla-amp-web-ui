import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { Footer } from './shared/components/footer/footer';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { AlertMessage } from './shared/services/alerts/alert-message';
import { MatDialog } from '@angular/material/dialog';
import { PassiveAlerts } from './shared/components/passive-alerts/passive-alerts';
import { Loader as LoadService } from './shared/services/loader/loader';
import { Iloader } from './shared/interfaces/loader';
import { Loader } from './shared/components/loader/loader';
import { ServiceErrorHandling } from './shared/services/serviceErrorHandling/service-error-handling';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    Footer,
    Sidebar,
    Loader
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('pensionados');
  showLoader?: Iloader;
  readonly dialog = inject(MatDialog);
  private alertMessageService = inject(AlertMessage);
  private loaderService = inject(LoadService);
  private errorHandliingService = inject(ServiceErrorHandling);

  ngOnInit(): void {
    this.alertMessageService.getMessage().subscribe(alert => {
      if (alert.showMessage) {
        const dialog = this.dialog.open(PassiveAlerts, {
          disableClose: false,
          data: alert,
        });

        dialog.afterClosed().subscribe((json: any) => {
          if (json != null) {
            console.log('json :>> ', json);
          }
        });
      }
    });

    this.loaderService.getLoader().subscribe(loader => {
      this.showLoader = loader;
    });

    this.errorHandliingService.getError().subscribe(error => {
      if (error.showError) {
        this.alertMessageService.showAlert('Error', error.message);
        this.loaderService.showLoader(false);
      }
    });
  }

  closeMessage() {
    this.alertMessageService.hideMessage();
  }
}
