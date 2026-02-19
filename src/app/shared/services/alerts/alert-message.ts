import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IAlertMessage } from '../../interfaces/alertMessage';

@Injectable({
  providedIn: 'root'
})
export class AlertMessage {
  private subject = new Subject<IAlertMessage>();

  showAlert(title: string, message: string) {
    this.subject.next({
      showMessage: true,
      messageTitle: title,
      messageContent: message
    });
  }

  hideMessage() {
    this.subject.next({ showMessage: false });
  }

  getMessage(): Observable<IAlertMessage> {
    return this.subject.asObservable();
  }
}
