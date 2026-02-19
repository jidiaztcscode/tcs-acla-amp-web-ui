import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.css']
})
export class AuthLoginComponent {
  loginDisplay = false;
  isIframe = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    console.log('[AuthLogin] ngOnInit');
    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        console.log('[AuthLogin] handleRedirectObservable result:', result);
      },
      error: (err) => {
        console.error('[AuthLogin] handleRedirectObservable error:', err);
      }
    });
    this.isIframe = window !== window.parent && !window.opener;
    console.log('[AuthLogin] isIframe:', this.isIframe);
    this.authService.instance.enableAccountStorageEvents();
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.ACCOUNT_ADDED ||
          msg.eventType === EventType.ACCOUNT_REMOVED
        )
      )
      .subscribe((msg) => {
        console.log('[AuthLogin] msalSubject$ event:', msg);
        this.setLoginDisplay();
      });
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        console.log('[AuthLogin] inProgress$ InteractionStatus.None');
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    console.log('[AuthLogin] setLoginDisplay:', this.loginDisplay);
  }

  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();
    console.log('[AuthLogin] checkAndSetActiveAccount - activeAccount:', activeAccount);
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      console.log('[AuthLogin] setActiveAccount:', accounts[0]);
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  login() {
    console.log('[AuthLogin] loginRedirect called');
    this.authService.loginPopup();
  }

  logout() {
    console.log('[AuthLogin] logout called');
    this.authService.logout();
  }
}
