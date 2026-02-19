import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomReportList } from './custom-report-list';

describe('CustomReportList', () => {
  let component: CustomReportList;
  let fixture: ComponentFixture<CustomReportList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomReportList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomReportList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
