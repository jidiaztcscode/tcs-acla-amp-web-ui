import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Switch } from './switch';

describe('Switch', () => {
  let component: Switch;
  let fixture: ComponentFixture<Switch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Switch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Switch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('Should update value and emit valueChange when onToggleChange is called', () => {
    const newValue = true;
    spyOn(component.valueChange, 'emit');

    component.onToggleChange(newValue);

    expect(component.value).toBe(newValue)
  })
});
