import { TestBed } from '@angular/core/testing';
import { Loader } from './loader';
import { Iloader } from '../../interfaces/loader';

describe('Loader Service', () => {
  let service: Loader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit value when showLoader is called', (done) => {
    const expected: Iloader = { showLoader: true };
    service.getLoader().subscribe(loader => {
      expect(loader).toEqual(expected);
      done();
    });
    service.showLoader(true);
  });

  it('should emit correct value for showLoader false', (done) => {
    const expected: Iloader = { showLoader: false };
    service.getLoader().subscribe(loader => {
      expect(loader).toEqual(expected);
      done();
    });
    service.showLoader(false);
  });

  // Optional: Test multiple emissions
  it('should emit multiple values', (done) => {
    const values: Iloader[] = [];
    service.getLoader().subscribe(loader => {
      values.push(loader);
      if (values.length === 2) {
        expect(values).toEqual([{ showLoader: true }, { showLoader: false }]);
        done();
      }
    });
    service.showLoader(true);
    service.showLoader(false);
  });
});