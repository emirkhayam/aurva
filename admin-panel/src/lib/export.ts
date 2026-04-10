// CSV Export
export function exportToCSV(data: Record<string, any>[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) return;

  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
  const header = cols.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row =>
    cols.map(c => {
      const val = row[c.key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// Simple PDF Export (HTML-based, uses print)
export function exportToPDF(title: string, data: Record<string, any>[], columns: { key: string; label: string }[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableRows = data.map(row =>
    `<tr>${columns.map(c => `<td style="border:1px solid #ddd;padding:8px;font-size:12px;">${row[c.key] ?? ''}</td>`).join('')}</tr>`
  ).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        p { color: #666; font-size: 12px; margin-bottom: 15px; }
        table { border-collapse: collapse; width: 100%; }
        th { border: 1px solid #333; padding: 8px; background: #f5f5f5; font-size: 12px; text-align: left; }
      </style>
    </head>
    <body>
      <h1>AURVA — ${title}</h1>
      <p>Дата экспорта: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}</p>
      <table>
        <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
