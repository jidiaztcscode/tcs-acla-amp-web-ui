import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileService } from './user-profile.service';

describe('UserProfileService', () => {
  let component: UserProfileService;
  let fixture: ComponentFixture<UserProfileService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
