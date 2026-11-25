export type ExportFormat = 'CSV' | 'PDF' | 'Excel';

export const csvCell = (value: string) => {
  const safe = /^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
};

function download(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadTable(name: string, format: ExportFormat, columns: string[], rows: string[][]) {
  if (format === 'CSV') {
    const csv = [columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    download(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }), name + '.csv');
    return;
  }
  if (format === 'Excel') {
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(name);
    sheet.addRows([columns, ...rows]);
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    columns.forEach((label, index) => { sheet.getColumn(index + 1).width = Math.max(20, label.length + 4); });
    const bytes = await workbook.xlsx.writeBuffer();
    download(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name + '.xlsx');
    return;
  }
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const pdf = new jsPDF({ orientation: 'landscape' });
  pdf.setFontSize(14);
  pdf.text(name, 14, 15);
  autoTable(pdf, {
    startY: 20, head: [columns], body: rows, styles: { fontSize: 9, overflow: 'linebreak' },
    horizontalPageBreak: true, horizontalPageBreakRepeat: 0,
  });
  pdf.save(name + '.pdf');
}
