import { Component, inject, OnInit } from '@angular/core';
import { Title } from '../../../../shared/components/title/title';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ParametrizationProfiles } from '../../../services/parametrization-profiles/parametrization-profiles';
import { ManageProfile, ProfileOptions } from '../../../interfaces/profile_options';
import { AlertMessage } from '../../../../shared/services/alerts/alert-message';
import { Loader } from '../../../../shared/services/loader/loader';
import { ServiceErrorHandling } from '../../../../shared/services/serviceErrorHandling/service-error-handling';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-profiles-management',
  imports: [Title, CommonModule, DragDropModule, MatInputModule, MatGridListModule],
  templateUrl: './profiles-management.html',
  styleUrl: './profiles-management.css'
})
export class ProfilesManagement implements OnInit {
  avaliableOptions: ProfileOptions[] = [];
  selectedOptions: ProfileOptions[] = [];
  datosForm!: FormGroup;

  //injeccion de dependencias
  profileOptionsService = inject(ParametrizationProfiles);
  alertMessageService = inject(AlertMessage);
  loaderService = inject(Loader);
  errorHandlingService = inject(ServiceErrorHandling);
  formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.datosForm = this.formBuilder.group({
      profileName: new FormControl(''),
      profileDescription: new FormControl(''),
    });

    this.getProfileOptions();
  }

  getProfileOptions() {
    this.loaderService.showLoader(true);

    this.profileOptionsService.getProfileOptions().subscribe({
      next: (res) => {
        this.datosForm.patchValue({
          profileName: res.profileName,
          profileDescription: res.profileDescription,
        });
        this.avaliableOptions = res.avaliableProfiles;
        this.selectedOptions = res.assignedProfiles;
      }, error: (err) => {
        this.errorHandlingService.handleError(err.status, err.error.code, 'No se encontraron las opciones de perfiles.');
      },
      complete: () => {
        this.loaderService.showLoader(false);
      },
    })
  }

  saveProfileOptions() {
    this.loaderService.showLoader(true);

    let body: ManageProfile = {
      profileName: this.datosForm.value.profileName,
      profileDescription: this.datosForm.value.profileDescription,
      selectedProfileOptions: this.selectedOptions
    }

    this.profileOptionsService.saveProfileOptions(body).subscribe({
      next: () => {
        this.alertMessageService.showAlert('Antención', 'La información de los perfiles ha sido gestionada corretamente');
      },
      error: (err) => {
        this.errorHandlingService.handleError(err.status, err.error.code, 'Ha ocurrido un error al gestionar la información de los perfiles.');
      },
      complete: () => {
        this.loaderService.showLoader(false);
      },
    });
  }

  drop(event: CdkDragDrop<ProfileOptions[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

}
