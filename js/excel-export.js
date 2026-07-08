/* ============================================================
   Acadex LMS — excel-export.js
   Generic client-side Excel & CSV document builder utility
   ============================================================ */

const ExcelExport = {
  /**
   * Export table data to Excel (.xls HTML format with gridlines)
   * @param {string} filename - Target file name
   * @param {Array<string>} headers - Headers list
   * @param {Array<Array<any>>} rows - Row values
   */
  downloadExcel(filename, headers, rows) {
    let excelXml = `
      <html xmlns:o="urn:schemas-microsoft-xml-office:office" 
            xmlns:x="urn:schemas-microsoft-xml-office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Acadex Report</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          th { background-color: #1E3A8A; color: #FFFFFF; font-weight: bold; border: 1px solid #E2E8F0; padding: 8px 12px; font-size: 10pt; }
          td { border: 1px solid #E2E8F0; padding: 6px 10px; font-size: 9.5pt; text-align: left; }
          .number { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; }
          .percent { mso-number-format:"0%"; text-align: right; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => {
                  const val = (cell === null || cell === undefined) ? '' : String(cell);
                  const isPercent = val.endsWith('%') && !isNaN(val.replace('%', '').trim());
                  const isNum = !isNaN(val) && val !== '';
                  
                  if (isPercent) {
                    return `<td class="percent">${parseFloat(val.replace('%','')) / 100}</td>`;
                  } else if (isNum) {
                    return `<td class="number">${val}</td>`;
                  } else {
                    return `<td>${val}</td>`;
                  }
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.xls') ? filename : filename + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export to CSV format (raw text fallback)
   */
  downloadCSV(filename, headers, rows) {
    const csvContent = [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : filename + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
