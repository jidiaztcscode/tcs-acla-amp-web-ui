import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomReport } from './custom-report';

describe('CustomReport', () => {
  let component: CustomReport;
  let fixture: ComponentFixture<CustomReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
