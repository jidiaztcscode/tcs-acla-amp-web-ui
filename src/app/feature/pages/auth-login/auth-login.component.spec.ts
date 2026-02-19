import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLoginComponent } from './auth-login.component';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventType, InteractionStatus, EventMessage } from '@azure/msal-browser';
import { Subject, of } from 'rxjs';

// Mock services
class MockMsalService {
  instance = {
    getAllAccounts: jasmine.createSpy('getAllAccounts').and.returnValue([]),
    getActiveAccount: jasmine.createSpy('getActiveAccount').and.returnValue(null),
    setActiveAccount: jasmine.createSpy('setActiveAccount'),
    enableAccountStorageEvents: jasmine.createSpy('enableAccountStorageEvents'),
  };
  handleRedirectObservable = jasmine.createSpy('handleRedirectObservable').and.returnValue(of({}));
  loginPopup = jasmine.createSpy('loginPopup');
  logout = jasmine.createSpy('logout');
}

class MockMsalBroadcastService {
  msalSubject$ = of({ eventType: EventType.ACCOUNT_ADDED } as EventMessage);
  inProgress$ = of(InteractionStatus.None);
}

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let msalService: MockMsalService;
  let msalBroadcastService: MockMsalBroadcastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLoginComponent],
      providers: [
        { provide: MsalService, useClass: MockMsalService },
        { provide: MsalBroadcastService, useClass: MockMsalBroadcastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLoginComponent);
    component = fixture.componentInstance;
    msalService = TestBed.inject(MsalService) as any;
    msalBroadcastService = TestBed.inject(MsalBroadcastService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call handleRedirectObservable on init', () => {
    expect(msalService.handleRedirectObservable).toHaveBeenCalled();
  });

  it('should set isIframe correctly', () => {
    expect(typeof component.isIframe).toBe('boolean');
  });

  it('should enable account storage events', () => {
    expect(msalService.instance.enableAccountStorageEvents).toHaveBeenCalled();
  });

  it('should set loginDisplay based on accounts', () => {
    msalService.instance.getAllAccounts.and.returnValue([{}]);
    component.setLoginDisplay();
    expect(component.loginDisplay).toBeTrue();
  });

  it('should check and set active account', () => {
    msalService.instance.getActiveAccount.and.returnValue(null);
    msalService.instance.getAllAccounts.and.returnValue([{}]);
    component.checkAndSetActiveAccount();
    expect(msalService.instance.setActiveAccount).toHaveBeenCalledWith({});
  });

  it('should call loginPopup on login', () => {
    component.login();
    expect(msalService.loginPopup).toHaveBeenCalled();
  });

  it('should call logout on logout', () => {
    component.logout();
    expect(msalService.logout).toHaveBeenCalled();
  });
});
