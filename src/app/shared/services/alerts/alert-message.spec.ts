import { TestBed } from '@angular/core/testing';
import { AlertMessage } from './alert-message';
import { IAlertMessage } from '../../interfaces/alertMessage';

describe('AlertMessage Service', () => {
  let service: AlertMessage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertMessage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit value when showAlert is called', (done) => {
    const title = 'Test Title';
    const message = 'Test Message';
    const expected: IAlertMessage = {
      showMessage: true,
      messageTitle: title,
      messageContent: message,
    };
    service.getMessage().subscribe(result => {
      expect(result).toEqual(expected);
      done();
    });
    service.showAlert(title, message);
  });

  it('should emit value when hideMessage is called', (done) => {
    const expected: IAlertMessage = { showMessage: false };
    service.getMessage().subscribe(result => {
      expect(result).toEqual(expected);
      done();
    });
    service.hideMessage();
  });

  // Optional: Test multiple emissions
  it('should emit show and then hide message', (done) => {
    const title = 'Test Title';
    const message = 'Test Message';
    const emissions: IAlertMessage[] = [];
    service.getMessage().subscribe(result => {
      emissions.push(result);
      if (emissions.length === 2) {
        expect(emissions).toEqual([
          { showMessage: true, messageTitle: title, messageContent: message },
          { showMessage: false }
        ]);
        done();
      }
    });
    service.showAlert(title, message);
    service.hideMessage();
  });
});