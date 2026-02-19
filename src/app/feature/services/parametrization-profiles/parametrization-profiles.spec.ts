import { TestBed } from '@angular/core/testing';
import { ParametrizationProfiles } from './parametrization-profiles';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AssignableProfiles, ManageProfile, ProfileOptions } from '../../interfaces/profile_options';
import { provideHttpClient } from '@angular/common/http';

describe('ParametrizationProfiles Service', () => {
  let service: ParametrizationProfiles;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ParametrizationProfiles);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch profile options', (done) => {
    const mockProfileOptions: ProfileOptions = {
      profileOptionName: 'Option A',
      profileOptionId: 1
    };
    const mockAssignedOption: ProfileOptions = {
      profileOptionName: 'Option B',
      profileOptionId: 2
    };
    const mockResponse: AssignableProfiles = {
      profileName: 'TestProfile',
      profileDescription: 'A profile for testing',
      avaliableProfiles: [mockProfileOptions],
      assignedProfiles: [mockAssignedOption]
    };

    service.getProfileOptions().subscribe(result => {
      expect(result).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne('http://localhost:5000/api/pensionados/profile-options');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should save profile options', (done) => {
    const mockProfileOption: ProfileOptions = {
      profileOptionName: 'Option X',
      profileOptionId: 99
    };
    const mockBody: ManageProfile = {
      profileName: 'SaveProfile',
      profileDescription: 'Saving profile options',
      selectedProfileOptions: [mockProfileOption]
    };
    const mockResponse: ManageProfile = {
      profileName: 'SaveProfile',
      profileDescription: 'Saving profile options',
      selectedProfileOptions: [mockProfileOption]
    };

    service.saveProfileOptions(mockBody).subscribe(result => {
      expect(result).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne('http://localhost:5000/api/pensionados/manage-profile-options');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);
    req.flush(mockResponse);
  });
});