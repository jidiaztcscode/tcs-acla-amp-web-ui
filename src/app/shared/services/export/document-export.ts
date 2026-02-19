import { inject, Injectable } from '@angular/core';
import { Loader as LoadService } from '../loader/loader';
import { AlertMessage } from '../alerts/alert-message';
import dayjs from 'dayjs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DocumentExport {

  private loaderService = inject(LoadService);
  private alertMessageService = inject(AlertMessage);

  async exportExcel(title: string, headers: Array<string>, data: Array<any>, path: string) {
    this.loaderService.showLoader(true);

    if (data.length === 0 || !data) {
      this.alertMessageService.showAlert('Error', 'No hay información disponible para exportar.');
      this.loaderService.showLoader(false);
      return;
    }

    try {
      // Dynamic import of heavy libs only when needed
      const [{ Workbook }, { saveAs }] = await Promise.all([
        import('exceljs'),
        import('file-saver')
      ] as any);

      //Create a workbook with a worksheet
      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet(path);
      // Merge cells in the first row from column 1 to N (N = headers.length)
      const startCol = 1;
      const endCol = headers.length; // Dynamic number of columns
      const rowNumber = 1; // Row to merge (e.g. first row for a title)

      worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
      worksheet.getCell(rowNumber, startCol).value = title;
      worksheet.getCell(rowNumber, startCol).font = {
        bold: true, color: { argb: 'dd141d' },
        size: 20,
      };
      //Adding Header Row
      worksheet.addRow(headers).eachCell((cell: any, number: number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'dd141d' },
          bgColor: { argb: '' },
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFF' },
          size: 12,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      data.forEach((d: any) => {
        let row = worksheet.addRow(Object.values(d));
        row.eachCell((cell: any) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      //Ajustar columna segun contenido
      worksheet.columns.forEach((col: any) => {
        if (col) {
          //we can access the headers through the col.header
          const headerLength = col.header?.length;
          //the reduce functions stays the same
          const largestValueLength = col.values?.reduce((maxWidth: any, value: any) => {
            if (value && value.length > maxWidth) {
              return value.length;
            }
            return maxWidth;
          }, 0);
          //finally we simply use Math.max to choose the larger of the two
          col.width = Math.max(headerLength || 10, largestValueLength || 10) + 2
        }

      });

      let currentDate = dayjs().format('YYYY-MM-DD_H-mm-ss');
      let filename = `${path}_${currentDate}`;

      //Generate & Save Excel File
      let fileData = await workbook.xlsx.writeBuffer();

      let blob = new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      var file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', lastModified: Date.now() });
      saveAs(file, filename);

    } catch (error: any) {
      this.alertMessageService.showAlert('Error', 'Se ha producido un error en el reporte.');
    } finally {
      this.loaderService.showLoader(false);
    }
  }

  async exportTxt(title: string, headers: Array<string>, data: Array<any>, path: string) {
    this.loaderService.showLoader(true);

    if (data.length === 0 || !data) {
      this.alertMessageService.showAlert('Error', 'No hay información disponible para exportar.');
      this.loaderService.showLoader(false);
      return;
    }

    try {

      // Build a "matrix" of rows: header row and data rows
      const rows = [
        headers,
        ...data.map(item => Object.values(item))
      ];

      // Calculate the max width for each column
      const colWidths = headers.map((_, colIdx) => {
        return Math.max(
          ...rows.map(row => {
            const cell = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]) : '';
            return cell.length;
          })
        );
      });

      // Helper to pad cell content
      const pad = (str: string, len: number) => String(str).padEnd(len, ' ');

      // Title and jump line
      let table = title ? title + '\n\n' : '';

      // Header row
      table += '| ' + headers.map((h, i) => pad(h, colWidths[i])).join(' | ') + ' |\n';

      // Separator row
      table += '|-' + colWidths.map(w => '-'.repeat(w)).join('-|-') + '-|\n';

      // Data rows
      data.forEach(item => {
        const rowValues = Object.values(item);
        table += '| ' + rowValues.map((v: any, i) => pad(v ?? '', colWidths[i])).join(' | ') + ' |\n';
      });

      let currentDate = dayjs().format('YYYY-MM-DD_H-mm-ss');
      let filename = `${path}_${currentDate}`;

      let blob = new Blob([table], {
        type: "text/plain;charset=utf-8"
      });

      var file = new File([blob], filename, { type: "text/plain;charset=utf-8", lastModified: Date.now() });
      const { saveAs } = await import('file-saver');
      saveAs(file, filename);
    } catch (error: any) {
      this.alertMessageService.showAlert('Error', 'Se ha producido un error en el reporte.');
    } finally {
      this.loaderService.showLoader(false);
    }

  }

  async exportCsv(title: string, headers: Array<string>, data: Array<any>, path: string) {
    this.loaderService.showLoader(true);

    if (data.length === 0 || !data) {
      this.alertMessageService.showAlert('Error', 'No hay información disponible para exportar.');
      this.loaderService.showLoader(false);
      return;
    }

    try {
      let csv = `${title}\n\n`;
      csv += headers.join(',') + '\n';
      data.forEach(row => {
        // Get values in order of headers
        const values = Object.values(row);
        const line = headers.map((_, i) => values[i] != null ? values[i] : '').join(',');
        csv += line + '\n';
      });

      let currentDate = dayjs().format('YYYY-MM-DD_H-mm-ss');
      let filename = `${path}_${currentDate}`;

      let blob = new Blob([csv.trim()], {
        type: "text/csv"
      });

      var file = new File([blob], filename, { type: "text/csv", lastModified: Date.now() });
      const { saveAs } = await import('file-saver');
      saveAs(file, filename);
    } catch (error: any) {
      this.alertMessageService.showAlert('Error', 'Se ha producido un error en el reporte.');
    } finally {
      this.loaderService.showLoader(false);
    }
  }

  async exportPdf(title: string, headers: Array<string>, data: Array<any>, path: string) {
    this.loaderService.showLoader(true);

    if (data.length === 0 || !data) {
      this.alertMessageService.showAlert('Error', 'No hay información disponible para exportar.');
      this.loaderService.showLoader(false);
      return;
    }

    try {
      // Armar body: la primera fila (headers) la formateamos
      const body = [
        headers.map(h => ({
          text: h,
          fillColor: '#dd141d', // fondo rojo
          color: 'white',       // texto blanco
          bold: true
        })),
        ...data.map(row => Object.values(row))
      ];

      const docDefinition = {
        content: [
          { text: title, fontSize: 20, bold: true, color: '#dd141d', margin: [0, 0, 0, 10] },
          {
            table: {
              headerRows: 1,
              widths: headers.map(() => 'auto'),
              body: body
            },
            layout: {
              hLineWidth: function (i, node) { return 2; }, // grosor horizontal
              vLineWidth: function (i, node) { return 2; }, // grosor vertical
              hLineColor: function (i, node) { return 'black'; },
              vLineColor: function (i, node) { return 'black'; },
            }
          },
        ]
      } as TDocumentDefinitions;

      // Dynamic import pdfmake and file-saver
      const [{ default: pdfMake }, { default: vfsFonts }, { saveAs }] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
        import('file-saver')
      ] as any);

      pdfMake.vfs = vfsFonts.vfs;

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob(async (blob: Blob) => {
        let currentDate = dayjs().format('YYYY-MM-DD_H-mm-ss');
        let filename = `${path}_${currentDate}.pdf`;
        const file = new File([blob], filename, { type: 'application/pdf', lastModified: Date.now() });
        saveAs(file, filename);
      });

    } catch (error: any) {
      this.alertMessageService.showAlert('Error', 'Se ha producido un error en el PDF.');
      this.loaderService.showLoader(false);
    } finally {
      this.loaderService.showLoader(false);
    }
  }
}
