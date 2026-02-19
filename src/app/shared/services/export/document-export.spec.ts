import { TestBed } from '@angular/core/testing';
import { DocumentExport } from './document-export';
import { Loader as LoadService } from '../loader/loader';
import { AlertMessage } from '../alerts/alert-message';

// Mocks
class LoaderMock {
  showLoader = jasmine.createSpy('showLoader');
}

class AlertMessageMock {
  showAlert = jasmine.createSpy('showAlert');
}

// Helper to mock external dependencies
function setupExternalMocks() {
  // file-saver
  (window as any).saveAs = jasmine.createSpy('saveAs');

  // exceljs Workbook
  (window as any).Workbook = function () {
    return {
      addWorksheet: jasmine.createSpy('addWorksheet').and.returnValue({
        mergeCells: jasmine.createSpy('mergeCells'),
        getCell: jasmine.createSpy('getCell').and.returnValue({ value: '', font: {} }),
        addRow: jasmine.createSpy('addRow').and.returnValue({ eachCell: jasmine.createSpy('eachCell') }),
        columns: [],
      }),
      xlsx: {
        writeBuffer: jasmine.createSpy('writeBuffer').and.returnValue(Promise.resolve(new ArrayBuffer(8))),
      },
    };
  };

  // dayjs
  (window as any).dayjs = () => ({ format: () => '2025-10-27_14-27-21' });

  // pdfMake
  (window as any).pdfMake = {
    createPdf: () => ({
      getBlob: (cb: (blob: Blob) => void) => cb(new Blob(['fake-pdf'], { type: 'application/pdf' })),
    }),
  };
}

describe('DocumentExport', () => {
  let service: DocumentExport;
  let loaderService: LoaderMock;
  let alertMessageService: AlertMessageMock;
  let saveAsSpy: jasmine.Spy;

  beforeEach(() => {
    setupExternalMocks();

    TestBed.configureTestingModule({
      providers: [
        DocumentExport,
        { provide: LoadService, useClass: LoaderMock },
        { provide: AlertMessage, useClass: AlertMessageMock },
      ],
    });
    service = TestBed.inject(DocumentExport);
    loaderService = TestBed.inject(LoadService) as any;
    alertMessageService = TestBed.inject(AlertMessage) as any;
    saveAsSpy = (window as any).saveAs;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show alert and not export Excel if data is empty', async () => {
    await service.exportExcel('Test', ['A'], [], 'report');
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(alertMessageService.showAlert).toHaveBeenCalledWith('Error', jasmine.any(String));
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
    expect(saveAsSpy).not.toHaveBeenCalled();
  });

  it('should export Excel when data is provided', async () => {
    await service.exportExcel('Test', ['Name', 'Age'], [{ Name: 'John', Age: 30 }], 'report');
    expect(saveAsSpy).toHaveBeenCalled();
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
  });

  it('should show alert and not export Txt if data is empty', async () => {
    await service.exportTxt('Test', ['A'], [], 'report');
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(alertMessageService.showAlert).toHaveBeenCalledWith('Error', jasmine.any(String));
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
    expect(saveAsSpy).not.toHaveBeenCalled();
  });

  it('should export Txt when data is provided', async () => {
    await service.exportTxt('Test', ['Name', 'Age'], [{ Name: 'John', Age: 30 }], 'report');
    expect(saveAsSpy).toHaveBeenCalled();
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
  });

  it('should show alert and not export Csv if data is empty', async () => {
    await service.exportCsv('Test', ['A'], [], 'report');
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(alertMessageService.showAlert).toHaveBeenCalledWith('Error', jasmine.any(String));
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
    expect(saveAsSpy).not.toHaveBeenCalled();
  });

  it('should export Csv when data is provided', async () => {
    await service.exportCsv('Test', ['Name', 'Age'], [{ Name: 'John', Age: 30 }], 'report');
    expect(saveAsSpy).toHaveBeenCalled();
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
  });

  it('should show alert and not export Pdf if data is empty', async () => {
    await service.exportPdf('Test', ['A'], [], 'report');
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(alertMessageService.showAlert).toHaveBeenCalledWith('Error', jasmine.any(String));
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
    expect(saveAsSpy).not.toHaveBeenCalled();
  });

  it('should export Pdf when data is provided', async () => {
    await service.exportPdf('Test', ['Name', 'Age'], [{ Name: 'John', Age: 30 }], 'report');
    expect(saveAsSpy).toHaveBeenCalled();
    expect(loaderService.showLoader).toHaveBeenCalledWith(true);
    expect(loaderService.showLoader).toHaveBeenCalledWith(false);
  });
});