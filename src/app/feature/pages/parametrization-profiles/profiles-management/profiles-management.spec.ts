import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilesManagement } from './profiles-management';
import { ProfileOptions, AssignableProfiles, ManageProfile } from '../../../interfaces/profile_options';
import { ParametrizationProfiles } from '../../../services/parametrization-profiles/parametrization-profiles';
import { AlertMessage } from '../../../../shared/services/alerts/alert-message';
import { Loader } from '../../../../shared/services/loader/loader';
import { ServiceErrorHandling } from '../../../../shared/services/serviceErrorHandling/service-error-handling';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { of, throwError } from 'rxjs';

describe('ProfilesManagement', () => {
  let component: ProfilesManagement;
  let fixture: ComponentFixture<ProfilesManagement>;
  let mockProfileService: jasmine.SpyObj<ParametrizationProfiles>;
  let mockAlertMessage: jasmine.SpyObj<AlertMessage>;
  let mockLoader: jasmine.SpyObj<Loader>;
  let mockErrorHandling: jasmine.SpyObj<ServiceErrorHandling>;
  let formBuilder: FormBuilder;

  beforeEach(() => {
    mockProfileService = jasmine.createSpyObj('ParametrizationProfiles', ['getProfileOptions', 'saveProfileOptions']);
    mockAlertMessage = jasmine.createSpyObj('AlertMessage', ['showAlert']);
    mockLoader = jasmine.createSpyObj('Loader', ['showLoader']);
    mockErrorHandling = jasmine.createSpyObj('ServiceErrorHandling', ['handleError']);
    formBuilder = new FormBuilder();

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ParametrizationProfiles, useValue: mockProfileService },
        { provide: AlertMessage, useValue: mockAlertMessage },
        { provide: Loader, useValue: mockLoader },
        { provide: ServiceErrorHandling, useValue: mockErrorHandling },
        { provide: FormBuilder, useValue: formBuilder },
      ]
    });

    fixture = TestBed.createComponent(ProfilesManagement);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and call getProfileOptions on ngOnInit', () => {
    spyOn(component, 'getProfileOptions');
    component.ngOnInit();
    expect(component.datosForm).toBeTruthy();
    expect(component.getProfileOptions).toHaveBeenCalled();
  });

  it('should patch form and set options on successful getProfileOptions', () => {
    const mockResponse: AssignableProfiles = {
      profileName: 'Profile',
      profileDescription: 'Description',
      avaliableProfiles: [{ profileOptionName: 'A', profileOptionId: 1 }],
      assignedProfiles: [{ profileOptionName: 'B', profileOptionId: 2 }]
    };
    mockProfileService.getProfileOptions.and.returnValue(of(mockResponse));
    component.ngOnInit();

    expect(component.datosForm.value.profileName).toBe('Profile');
    expect(component.datosForm.value.profileDescription).toBe('Description');
    expect(component.avaliableOptions).toEqual(mockResponse.avaliableProfiles);
    expect(component.selectedOptions).toEqual(mockResponse.assignedProfiles);
    expect(mockLoader.showLoader).toHaveBeenCalledWith(true);
    expect(mockLoader.showLoader).toHaveBeenCalledWith(false);
  });

  it('should handle error on getProfileOptions', () => {
    const error = { status: 404, error: { code: 'NOT_FOUND' } };
    mockProfileService.getProfileOptions.and.returnValue(throwError(() => error));
    component.ngOnInit();
    expect(mockErrorHandling.handleError).toHaveBeenCalledWith(
      error.status,
      error.error.code,
      'No se encontraron las opciones de perfiles.'
    );
    expect(mockLoader.showLoader).toHaveBeenCalledWith(true);
  });

  it('should call saveProfileOptions with correct body', () => {
    component.datosForm = formBuilder.group({
      profileName: ['NewProfile'],
      profileDescription: ['NewDesc']
    });
    component.selectedOptions = [
      { profileOptionName: 'Opt', profileOptionId: 99 }
    ];
    mockProfileService.saveProfileOptions.and.returnValue(of({
      profileName: 'NewProfile',
      profileDescription: 'NewDesc',
      selectedProfileOptions: [{ profileOptionName: 'Opt', profileOptionId: 99 }]
    }));

    component.saveProfileOptions();

    const expectedBody: ManageProfile = {
      profileName: 'NewProfile',
      profileDescription: 'NewDesc',
      selectedProfileOptions: [{ profileOptionName: 'Opt', profileOptionId: 99 }]
    };

    expect(mockProfileService.saveProfileOptions).toHaveBeenCalledWith(expectedBody);
    expect(mockAlertMessage.showAlert).toHaveBeenCalledWith(
      'Antención',
      'La información de los perfiles ha sido gestionada corretamente'
    );
    expect(mockLoader.showLoader).toHaveBeenCalledWith(true);
  });

  it('should handle error on saveProfileOptions', () => {
    component.datosForm = formBuilder.group({
      profileName: ['ErrProfile'],
      profileDescription: ['ErrDesc']
    });
    component.selectedOptions = [];
    const error = { status: 500, error: { code: 'ERR' } };
    mockProfileService.saveProfileOptions.and.returnValue(throwError(() => error));

    component.saveProfileOptions();

    expect(mockErrorHandling.handleError).toHaveBeenCalledWith(
      error.status,
      error.error.code,
      'Ha ocurrido un error al gestionar la información de los perfiles.'
    );
    expect(mockLoader.showLoader).toHaveBeenCalledWith(true);
  });

  it('should move items within the same array on drop', () => {
    component.selectedOptions = [
      { profileOptionName: 'A', profileOptionId: 1 },
      { profileOptionName: 'B', profileOptionId: 2 }
    ];
    const event = {
      previousContainer: { data: component.selectedOptions },
      container: { data: component.selectedOptions },
      previousIndex: 0,
      currentIndex: 1
    } as CdkDragDrop<ProfileOptions[]>;

    spyOn(Array.prototype, 'splice').and.callThrough();

    component.drop(event);

    expect(component.selectedOptions[0].profileOptionName).toBe('B');
    expect(component.selectedOptions[1].profileOptionName).toBe('A');
  });

  it('should transfer items between arrays on drop', () => {
    component.avaliableOptions = [{ profileOptionName: 'A', profileOptionId: 1 }];
    component.selectedOptions = [];
    const event = {
      previousContainer: { data: component.avaliableOptions },
      container: { data: component.selectedOptions },
      previousIndex: 0,
      currentIndex: 0
    } as CdkDragDrop<ProfileOptions[]>;

    component.drop(event);

    expect(component.avaliableOptions.length).toBe(0);
    expect(component.selectedOptions.length).toBe(1);
    expect(component.selectedOptions[0].profileOptionName).toBe('A');
  });
});