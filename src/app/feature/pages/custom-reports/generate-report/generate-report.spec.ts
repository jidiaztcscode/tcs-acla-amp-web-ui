import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateReport } from './generate-report';

describe('GenerateReport', () => {
  let component: GenerateReport;
  let fixture: ComponentFixture<GenerateReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
