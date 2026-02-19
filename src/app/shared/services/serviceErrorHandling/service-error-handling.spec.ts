import { TestBed } from '@angular/core/testing';
import { ServiceErrorHandling } from './service-error-handling';
import { IServiceErrorHandling } from '../../interfaces/serviceErrorHandling';

describe('ServiceErrorHandling Service', () => {
  let service: ServiceErrorHandling;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceErrorHandling);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit error for status 500', (done) => {
    const expected: IServiceErrorHandling = {
      showError: true,
      status: 500,
      code: 'ERR',
      message: 'Se presento un problema en el sistema, comuníquese con el administrador'
    };
    service.getError().subscribe(error => {
      expect(error).toEqual(expected);
      done();
    });
    service.handleError(500, 'ERR', 'ignored');
  });

  it('should emit error for status 400', (done) => {
    const expected: IServiceErrorHandling = {
      showError: true,
      status: 400,
      code: 'ERR',
      message: 'Se presento un problema en el sistema, comuníquese con el administrador'
    };
    service.getError().subscribe(error => {
      expect(error).toEqual(expected);
      done();
    });
    service.handleError(400, 'ERR', 'ignored');
  });

  it('should emit custom message for status 404 and code INFO_NOT_FOUND', (done) => {
    const customMsg = 'Custom not found';
    const expected: IServiceErrorHandling = {
      showError: true,
      status: 404,
      code: 'INFO_NOT_FOUND',
      message: customMsg
    };
    service.getError().subscribe(error => {
      expect(error).toEqual(expected);
      done();
    });
    service.handleError(404, 'INFO_NOT_FOUND', customMsg);
  });

  it('should emit unexpected error for other codes', (done) => {
    const expected: IServiceErrorHandling = {
      showError: true,
      status: 404,
      code: 'ERR',
      message: 'Error insesperado'
    };
    service.getError().subscribe(error => {
      expect(error).toEqual(expected);
      done();
    });
    service.handleError(404, 'ERR', 'ignored');
  });

  it('should NOT emit for status 401 or 403', (done) => {
    let emitted = false;
    service.getError().subscribe(() => {
      emitted = true;
    });
    service.handleError(401, 'ERR', 'ignored');
    service.handleError(403, 'ERR', 'ignored');
    setTimeout(() => {
      expect(emitted).toBe(false);
      done();
    }, 100); // Wait a short time to check emission
  });
});