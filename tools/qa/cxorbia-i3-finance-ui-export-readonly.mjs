// Reuses the approved Benefits byte parser; does not import or run its gate.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {need,digest,norm,hashBytes,displayCell,assertReportRows} from './cxorbia-i3-finance-ui-readonly-contract.mjs';
import {encryptManifest} from './cxorbia-i3-finance-residual-readonly.mjs';
export const XLSX_READ=String.raw`import sys,zipfile,xml.etree.ElementTree as E,json,posixpath
z=zipfile.ZipFile(sys.argv[1]);ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ss=[]
if 'xl/sharedStrings.xml' in z.namelist():
 ss=[''.join(n.itertext()) for n in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
rels={n.attrib['Id']:n.attrib['Target'] for n in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
out={}
for s in E.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet',ns):
 target=rels[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
 file=target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
 rows=[]
 for row in E.fromstring(z.read(file)).findall('s:sheetData/s:row',ns):
  cells=[]
  for c in row:
   v=c.find('s:v',ns);val='' if v is None else v.text or ''
   if c.attrib.get('t')=='s':val=ss[int(val)]
   elif c.attrib.get('t')=='inlineStr':val=''.join(c.find('s:is',ns).itertext())
   ref=c.attrib.get('r','A1');col=0
   for ch in ref:
    if not ch.isalpha():break
    col=col*26+ord(ch.upper())-64
   while len(cells)<col:cells.append('')
   cells[col-1]=val
  rows.append(cells)
 out[s.attrib['name']]=rows
print(json.dumps(out,ensure_ascii=False))`;
export function readXlsxFile(file){
  return JSON.parse(execFileSync('python3',['-c',XLSX_READ,file],{encoding:'utf8',maxBuffer:4*1024*1024,timeout:30000,stdio:['ignore','pipe','pipe']}));
}
// Keep the strict acceptance predicate. Diagnostics never grant PDF credit.
export function pdfContentDiagnostic({pages,text,title,periodLabel,rows}){
  const actual=norm(text),compact=actual.replace(/\s+/g,''),missing=[];
  for(const [rowIndex,row]of rows.entries())for(const [columnIndex,value]of row.entries()){
    const expected=norm(displayCell(value));
    if(!actual.includes(expected))missing.push({row:rowIndex,column:columnIndex,expectedCharacters:expected.length,expectedSha256:hashBytes(Buffer.from(expected)),matchesIgnoringWhitespace:compact.includes(expected.replace(/\s+/g,''))});
  }
  const titleMatches=actual.includes(norm(title)),periodMatches=actual.includes(norm(periodLabel));
  return {matches:pages>0&&titleMatches&&periodMatches&&missing.length===0,pages,textCharacters:actual.length,textSha256:hashBytes(Buffer.from(actual)),titleMatches,periodMatches,
    titleMatchesIgnoringWhitespace:compact.includes(norm(title).replace(/\s+/g,'')),periodMatchesIgnoringWhitespace:compact.includes(norm(periodLabel).replace(/\s+/g,'')),
    missingCellCount:missing.length,missingCells:missing.slice(0,64),missingCellsTruncated:missing.length>64};
}
export function saveFailedPdfEvidence({destination,label,publicKey,identity,payload}){
  need(/^session-\d+-(?:movements|dashboard)$/.test(label),'SOURCE_FAILURE:C09_C10_PRIVATE_EVIDENCE_LABEL');
  const entry='private-'+label+'-pdf.envelope.json';
  const envelope=encryptManifest({schemaVersion:'cxorbia.i3.finance-ui-private-pdf.v1',identity,label,...payload},publicKey);
  const serialized=JSON.stringify(envelope)+'\n';fs.writeFileSync(path.join(destination,entry),serialized);
  return {entry,sha256:hashBytes(Buffer.from(serialized)),plainSha256:envelope.plainSha256,encrypted:true,algorithm:envelope.algorithm};
}
export async function proveReport({page,exportButton,headers,rows,periodLabel,title,privateDir,label,failureArchive}){
  need(rows.length>0,'FUNCTIONAL_DEFECT:C09_C10_REPORT_EMPTY_SCOPE');
  await page.locator(exportButton).click();
  await page.locator('#rkBody table').waitFor({timeout:30000});
  const preview=await page.locator('#rkBody table').evaluate(table=>({
    headers:[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim()),
    rows:[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(x=>x.textContent.trim()))
  }));
  need(digest(preview.headers)===digest(headers),'FUNCTIONAL_DEFECT:C09_C10_EXPORT_HEADERS');
  assertReportRows(preview.rows,rows,{columns:headers.length,code:'PREVIEW_ROWS'});
  const pending=page.waitForEvent('download',{timeout:30000});
  await page.locator('#rkXls').click();const download=await pending;
  need(/\.xlsx$/i.test(download.suggestedFilename()),'FUNCTIONAL_DEFECT:C09_C10_XLSX_EXTENSION');
  const file=path.join(privateDir,label+'.xlsx');await download.saveAs(file);
  const xlsx=fs.readFileSync(file),workbook=readXlsxFile(file);
  need(['Resumen','Datos','Catálogo de columnas'].every(name=>Array.isArray(workbook[name])),'FUNCTIONAL_DEFECT:C09_C10_XLSX_SHEETS');
  need(digest(workbook.Datos[0])===digest(headers),'FUNCTIONAL_DEFECT:C09_C10_XLSX_HEADERS');
  assertReportRows(workbook.Datos.slice(1),rows,{format:'xlsx',columns:headers.length,code:'XLSX_ROWS'});
  const meta=Object.fromEntries(workbook.Resumen);
  need(String(meta.Filas)===String(rows.length)&&norm(meta.Periodo)===norm(periodLabel)&&norm(meta.Reporte)===norm(title),'FUNCTIONAL_DEFECT:C09_C10_XLSX_META');

  await page.locator('#rkPdf').click();
  await page.locator('#cxRKPrint table').waitFor({state:'attached',timeout:30000});
  const print=await page.locator('#cxRKPrint table').evaluate(table=>({
    headers:[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim()),
    rows:[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(x=>x.textContent.trim()))
  }));
  need(digest(print.headers)===digest(headers),'FUNCTIONAL_DEFECT:C09_C10_PRINT_HEADERS');
  assertReportRows(print.rows,rows,{columns:headers.length,code:'PRINT_ROWS'});
  const pdf=await page.pdf({format:'A4',printBackground:true});
  need(pdf.subarray(0,5).toString()==='%PDF-','FUNCTIONAL_DEFECT:C09_C10_PDF_BYTES');
  const partialProof={decision:'PARTIAL_EXPORT_PROOF_PDF_PENDING',rows:rows.length,semanticRowsSha256:digest(rows),
    preview:{sha256:digest(preview),contentMatches:true},xlsx:{bytes:xlsx.length,sha256:hashBytes(xlsx),parsed:true,contentMatches:true},
    nativePrintDom:{sha256:digest(print),contentMatches:true},pdf:{bytes:pdf.length,sha256:hashBytes(pdf),parsed:false,contentMatches:false}};
  const texts=[],pdfPages=[];let document=null;
  try{
    const pdfjs=(await import('pdfjs-dist/legacy/build/pdf.js')).default;
    document=await pdfjs.getDocument({data:new Uint8Array(pdf),disableFontFace:true,useSystemFonts:true,isEvalSupported:false}).promise;
    for(let i=1;i<=document.numPages;i++){
      const content=await(await document.getPage(i)).getTextContent();
      pdfPages.push({page:i,items:content.items.map(x=>({str:x.str,dir:x.dir,transform:x.transform,width:x.width,height:x.height,fontName:x.fontName,hasEOL:x.hasEOL}))});
      texts.push(content.items.map(x=>x.str).join(' '));
    }
    Object.assign(partialProof.pdf,{pages:document.numPages,parsed:true});
    const pdfDiagnostic=pdfContentDiagnostic({pages:document.numPages,text:texts.join(' '),title,periodLabel,rows});
    if(!pdfDiagnostic.matches){const error=Error('FUNCTIONAL_DEFECT:C09_C10_PDF_CONTENT');error.financePdfDiagnostic={...pdfDiagnostic,bytes:pdf.length,sha256:hashBytes(pdf)};throw error;}
    partialProof.pdf.contentMatches=true;
    const proof={decision:'PASS_EXPORT_PARITY',rows:rows.length,semanticRowsSha256:digest(rows),previewSha256:digest(preview),
      xlsx:partialProof.xlsx,pdf:{...partialProof.pdf,renderMode:'CHROMIUM_CAPTURE_OF_NATIVE_PRINT_OUTPUT_NOT_DOWNLOAD'}};
    await page.locator('.cx-modal [data-x]').last().click();
    return proof;
  }catch(error){
    error.financeExportPartial=partialProof;
    error.financePdfDiagnostic=error.financePdfDiagnostic||{bytes:pdf.length,sha256:hashBytes(pdf),pages:document?.numPages||0,parsed:partialProof.pdf.parsed};
    try{
      need(failureArchive?.publicKey,'SOURCE_FAILURE:C09_C10_PRIVATE_EVIDENCE_KEY');
      error.financePdfDiagnostic.privateEvidence=saveFailedPdfEvidence({...failureArchive,label,payload:{error:{name:error.name,message:error.message},expected:{title,periodLabel,headers,rows},preview,print,partialProof,pdf:{sha256:hashBytes(pdf),base64:pdf.toString('base64'),pages:pdfPages}}});
    }catch(_){error.financePdfDiagnostic.privateEvidenceError='ENVIRONMENT_FAILURE:C09_C10_PRIVATE_EVIDENCE_SEAL';}
    throw error;
  }finally{if(document)await document.destroy();fs.rmSync(file,{force:true});}
}
