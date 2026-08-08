/* CXOrbia frontend export helpers · Cloud V6
   Presentational SheetJS helper only: it preserves missing values and never totals mixed currencies. */
window.CX = window.CX || {};

CX.frontendExports = CX.frontendExports || {};

CX.frontendExports.buildWorkbook = function(XLSX, options){
  const meta = (options && options.meta) || {};
  const columns = (options && options.columns) || [];
  const rows = (options && options.rows) || [];
  if(!XLSX || !XLSX.utils) throw new Error('XLSX utils unavailable');

  const wb = XLSX.utils.book_new();
  const resumen = [
    [meta.title || 'Reporte'],
    [],
    ['Tenant', meta.tenant || ''],
    ['Proyecto', meta.project || ''],
    ['Periodo', meta.period || ''],
    ['Alcance', meta.scope || ''],
    ['Fuente', meta.source || ''],
    ['Fecha', meta.date || new Date().toISOString().slice(0, 10)],
    ['Filas', rows.length]
  ];
  const wsR = XLSX.utils.aoa_to_sheet(resumen);
  wsR['!cols'] = [{wch:16}, {wch:40}];
  XLSX.utils.book_append_sheet(wb, wsR, 'Resumen');

  const header = columns.map(c => c.label || c.key);
  const aoa = [header].concat(rows.map(row => columns.map(col => {
    const value = row ? row[col.key] : null;
    return value == null ? '' : value;
  })));
  const wsD = XLSX.utils.aoa_to_sheet(aoa);
  wsD['!cols'] = columns.map(col => ({wch: Math.min(48, Math.max(String(col.label || col.key || '').length + 2, col.width || 12))}));
  if(columns.length){
    wsD['!autofilter'] = {ref: XLSX.utils.encode_range({s:{r:0,c:0}, e:{r:rows.length, c:columns.length - 1}})};
    wsD['!freeze'] = {xSplit:0, ySplit:1};
  }
  const formats = {date:'yyyy-mm-dd', percent:'0.0%', number:'#,##0', money:'#,##0.00'};
  rows.forEach((row, ri) => columns.forEach((col, ci) => {
    const value = row ? row[col.key] : null;
    if(value == null || value === '') return;
    const cell = wsD[XLSX.utils.encode_cell({r:ri + 1, c:ci})];
    if(cell && col.format && formats[col.format]) cell.z = formats[col.format];
  }));
  XLSX.utils.book_append_sheet(wb, wsD, 'Datos');
  return wb;
};
