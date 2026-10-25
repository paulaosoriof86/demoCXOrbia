import zlib from 'node:zlib';

const decoder = new TextDecoder('utf-8');

function u16(buf, offset){ return buf.readUInt16LE(offset); }
function u32(buf, offset){ return buf.readUInt32LE(offset); }

function findEocd(buf){
  for(let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--){
    if(u32(buf, i) === 0x06054b50) return i;
  }
  throw new Error('XLSX ZIP EOCD not found');
}

export function unzipXlsx(buffer){
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const eocd = findEocd(buf);
  const total = u16(buf, eocd + 10);
  const cdOffset = u32(buf, eocd + 16);
  const files = new Map();
  let ptr = cdOffset;
  for(let i = 0; i < total; i++){
    if(u32(buf, ptr) !== 0x02014b50) throw new Error('Invalid central directory');
    const method = u16(buf, ptr + 10);
    const compressedSize = u32(buf, ptr + 20);
    const nameLen = u16(buf, ptr + 28);
    const extraLen = u16(buf, ptr + 30);
    const commentLen = u16(buf, ptr + 32);
    const localOffset = u32(buf, ptr + 42);
    const name = decoder.decode(buf.subarray(ptr + 46, ptr + 46 + nameLen));

    if(u32(buf, localOffset) !== 0x04034b50) throw new Error(`Invalid local header: ${name}`);
    const localNameLen = u16(buf, localOffset + 26);
    const localExtraLen = u16(buf, localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const data = buf.subarray(dataStart, dataStart + compressedSize);
    let content;
    if(method === 0) content = data;
    else if(method === 8) content = zlib.inflateRawSync(data);
    else content = Buffer.alloc(0);
    files.set(name, content);
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function xmlDecode(text){
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function attrs(tag){
  const out = {};
  const re = /([A-Za-z_:][\w:.-]*)="([^"]*)"/g;
  let m;
  while((m = re.exec(tag))) out[m[1]] = xmlDecode(m[2]);
  return out;
}

function textOf(xml){
  return xmlDecode(String(xml || '').replace(/<[^>]+>/g, ''));
}

function xml(files, name){
  const b = files.get(name);
  return b ? decoder.decode(b) : '';
}

export function sharedStrings(files){
  const raw = xml(files, 'xl/sharedStrings.xml');
  if(!raw) return [];
  const list = [];
  const re = /<si[\s\S]*?<\/si>/g;
  let m;
  while((m = re.exec(raw))) list.push(textOf(m[0]));
  return list;
}

export function workbookSheets(files){
  const book = xml(files, 'xl/workbook.xml');
  const relsXml = xml(files, 'xl/_rels/workbook.xml.rels');
  const rels = new Map();
  const relRe = /<Relationship\b[^>]*>/g;
  let r;
  while((r = relRe.exec(relsXml))){
    const a = attrs(r[0]);
    if(a.Id && a.Target){
      const target = a.Target.startsWith('/') ? a.Target.slice(1) : `xl/${a.Target}`;
      rels.set(a.Id, target.replace(/\/\.\//g, '/'));
    }
  }
  const sheets = [];
  const sheetRe = /<sheet\b[^>]*>/g;
  let s;
  while((s = sheetRe.exec(book))){
    const a = attrs(s[0]);
    const rid = a['r:id'] || a.id || '';
    sheets.push({
      name: a.name || `Sheet ${sheets.length + 1}`,
      sheetId: a.sheetId || String(sheets.length + 1),
      relId: rid,
      path: rels.get(rid) || `xl/worksheets/sheet${sheets.length + 1}.xml`
    });
  }
  return sheets;
}

function cellValue(cellXml, shared){
  const cellTag = (cellXml.match(/<c\b[^>]*>/) || [''])[0];
  const a = attrs(cellTag);
  const inline = cellXml.match(/<is[\s\S]*?<\/is>/);
  if(inline) return textOf(inline[0]);
  const v = cellXml.match(/<v[^>]*>([\s\S]*?)<\/v>/);
  if(!v) return '';
  const raw = xmlDecode(v[1]);
  if(a.t === 's') return shared[Number(raw)] || '';
  return raw;
}

function colIndexFromRef(ref){
  const letters = String(ref || '').match(/^[A-Z]+/i)?.[0] || '';
  if(!letters) return -1;
  let n = 0;
  for(const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function worksheetRows(files, sheet, shared){
  const raw = xml(files, sheet.path);
  if(!raw) return [];
  const rows = [];
  const rowRe = /<row\b[\s\S]*?<\/row>/g;
  let rm;
  while((rm = rowRe.exec(raw))){
    const rowXml = rm[0];
    const values = [];
    const cRe = /<c\b[\s\S]*?<\/c>/g;
    let cm;
    let sequential = 0;
    while((cm = cRe.exec(rowXml))){
      const cellXml = cm[0];
      const tag = (cellXml.match(/<c\b[^>]*>/) || [''])[0];
      const a = attrs(tag);
      const idx = colIndexFromRef(a.r) >= 0 ? colIndexFromRef(a.r) : sequential;
      values[idx] = cellValue(cellXml, shared);
      sequential = idx + 1;
    }
    const normalized = values.map(v => v ?? '');
    if(normalized.some(v => String(v || '').trim() !== '')) rows.push(normalized);
  }
  return rows;
}

export function worksheetPreview(files, sheet, shared, sampleRows = 5){
  const raw = xml(files, sheet.path);
  if(!raw){
    return { name: sheet.name, path: sheet.path, rows: 0, columns: 0, headers: [], sample: [], issue: 'worksheet_missing' };
  }
  const rows = worksheetRows(files, sheet, shared);
  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return {
    name: sheet.name,
    sheetId: sheet.sheetId,
    path: sheet.path,
    rows: rows.length,
    columns: maxCols,
    headers: (rows[0] || []).slice(0, 30),
    sample: rows.slice(0, sampleRows)
  };
}

export function previewWorkbook(buffer){
  const files = unzipXlsx(buffer);
  const shared = sharedStrings(files);
  const sheets = workbookSheets(files);
  const tabs = sheets.map(s => worksheetPreview(files, s, shared));
  return {
    sheets: tabs.length,
    rows: tabs.reduce((n, t) => n + t.rows, 0),
    tabs,
    workbookFiles: files.size
  };
}
