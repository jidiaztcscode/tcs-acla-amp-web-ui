import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAlerts } from './action-alerts';

describe('ActionAlerts', () => {
  let component: ActionAlerts;
  let fixture: ComponentFixture<ActionAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionAlerts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionAlerts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
