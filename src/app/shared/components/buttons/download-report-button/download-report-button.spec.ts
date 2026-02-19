import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadReportButton } from './download-report-button';

describe('DownloadReportButton', () => {
  let component: DownloadReportButton;
  let fixture: ComponentFixture<DownloadReportButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadReportButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadReportButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
