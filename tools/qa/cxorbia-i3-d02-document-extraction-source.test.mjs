import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const automations=fs.readFileSync('app/core/automations.js','utf8');
const cert=fs.readFileSync('app/modules/cert.js','utf8');

test('D02 removes binary PDF regex extraction and uses a real text-layer parser',()=>{
  assert.doesNotMatch(automations,/raw\.matchAll\(/);
  assert.match(automations,/CX_ATTACHMENT_PDFJS_VERSION='3\.11\.174'/);
  assert.match(automations,/pdfjsLib\?\.getDocument/);
  assert.match(automations,/lib\.getDocument\(\{data:new Uint8Array\(buffer\)\}\)/);
  assert.match(automations,/page\.getTextContent\(\)/);
  assert.match(automations,/ocrExecuted:false/);
  assert.doesNotMatch(automations,/Tesseract|recognize\(|OCR\.recognize/i);
});

test('D02 DOCX uses Mammoth raw-text parser and preserves source hash plus extraction quality',()=>{
  assert.match(automations,/mammoth\?\.extractRawText/);
  assert.match(automations,/window\.mammoth\.extractRawText\(\{arrayBuffer:buffer\}\)/);
  assert.match(automations,/source_sha256/);
  assert.match(automations,/extraction_quality/);
  assert.match(automations,/attachmentQuality\(text\)/);
});

test('D02 fails closed on unsupported or insufficient files before any AI provider call',()=>{
  assert.match(automations,/ATTACHMENT_FORMAT_UNSUPPORTED/);
  assert.match(automations,/ATTACHMENT_TEXT_LAYER_INSUFFICIENT/);
  assert.match(automations,/ATTACHMENT_TEXT_INSUFFICIENT/);
  const extraction=cert.indexOf('extraction=await CX.ai.extractAttachment(file)');
  const quality=cert.indexOf('textQuality=CX.ai.attachmentQuality(txt)');
  const provider=cert.indexOf('await CX.backendAI?.load?.()');
  assert.ok(extraction>=0&&quality>extraction&&provider>quality);
  assert.match(cert,/if\(!textQuality\.sufficient\)throw new Error/);
});

test('D02 certification accepts only parser-supported document formats and stores document provenance',()=>{
  assert.match(cert,/accept="\.pdf,\.docx,\.txt,\.md,\.csv,\.json"/);
  assert.doesNotMatch(cert,/accept="[^"]*\.doc(?:,|"|\s)/);
  assert.match(cert,/documentSource:extraction\?/);
  assert.match(cert,/source_sha256:extraction\.source_sha256/);
  assert.match(cert,/extraction_quality:extraction\.extraction_quality/);
  assert.match(cert,/mode:'manual_text'/);
  assert.match(cert,/no se ejecuta OCR automáticamente/);
});

test('D02 owner files remain syntactically valid JavaScript',()=>{
  assert.doesNotThrow(()=>new Function(automations));
  assert.doesNotThrow(()=>new Function(cert));
});
