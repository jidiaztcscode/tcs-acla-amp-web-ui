import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should render the app-sidebar component', () => {
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector('app-sidebar')).toBeTruthy();
});

it('should render the app-footer component', () => {
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector('app-footer')).toBeTruthy();
});

});
