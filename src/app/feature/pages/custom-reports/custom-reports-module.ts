import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '../../../shared/components/title/title';
import { IconButton } from '../../../shared/components/buttons/icon-button/icon-button';
import { AddButton } from '../../../shared/components/buttons/add-button/add-button';
import { EditButton } from '../../../shared/components/buttons/edit-button/edit-button';
import { DownloadReportButton } from '../../../shared/components/buttons/download-report-button/download-report-button';
import { TextButton } from "../../../shared/components/buttons/text-button/text-button";
import { RouterModule } from '@angular/router';
import { CustomReportsRoutes } from './custom-reports.routing';
import { CustomReportList } from './custom-report-list/custom-report-list';
import { GenerateReport } from './generate-report/generate-report';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { PageLayout } from '../../../shared/components/page-layout/page-layout';
import { CustomReport } from './custom-report/custom-report';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { provideNativeDateAdapter } from '@angular/material/core';

@NgModule({
  declarations: [
    CustomReportList,
    CustomReport,
    GenerateReport
  ],
  imports: [
    CommonModule,
    Title,
    PageLayout,
    AddButton,
    EditButton,
    DownloadReportButton,
    IconButton,
    TextButton,
    RouterModule.forChild(CustomReportsRoutes),
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDatepickerModule,
    FormsModule,
    CdkDropList, 
    CdkDrag
  ],
  exports: [RouterModule],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class CustomReportsModule { }
