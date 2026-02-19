import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassiveAlerts } from './passive-alerts';

describe('PassiveAlerts', () => {
  let component: PassiveAlerts;
  let fixture: ComponentFixture<PassiveAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassiveAlerts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassiveAlerts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
