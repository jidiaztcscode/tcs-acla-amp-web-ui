import { Routes } from "@angular/router";
import { CustomReportList } from "./custom-report-list/custom-report-list";
import { CustomReport } from "./custom-report/custom-report";
import { GenerateReport } from "./generate-report/generate-report";


export const CustomReportsRoutes: Routes = [
    {
        path: '',
        component: CustomReportList,
        // canActivate: []
        // data: {}
    },
    {
        path: 'new',
        component: CustomReport
    },
    {
        path: ':id',
        component: CustomReport
    },
    {
        path: 'generate-report/:id',
        component: GenerateReport
    }
];