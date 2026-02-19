import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Iloader } from '../../interfaces/loader';

@Injectable({
  providedIn: 'root'
})
export class Loader {
  private subject = new Subject<Iloader>();

  showLoader(status: boolean) {
    this.subject.next({
      showLoader: status,
    });
  }

  getLoader(): Observable<Iloader> {
    return this.subject.asObservable();
  }
}
