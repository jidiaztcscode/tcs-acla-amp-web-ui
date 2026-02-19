import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextButton } from './text-button';

describe('TextButton', () => {
  let component: TextButton;
  let fixture: ComponentFixture<TextButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
