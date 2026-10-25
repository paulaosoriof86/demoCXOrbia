#!/usr/bin/env node
/*
  CXOrbia TyA - Post V89 honest copy patch
  Safe local patch helper. Does not connect Firestore, Auth, Storage, HR, Make, Gemini, WhatsApp, email or production.

  Usage from repo root:
    node tools/migration/tya-post-v89-honest-copy-patch.mjs --check
    node tools/migration/tya-post-v89-honest-copy-patch.mjs --apply
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const check = args.has('--check') || !apply;
const root = process.cwd();

const replacements = [
  {
    file: 'app/modules/postulaciones.js',
    pairs: [
      ['WA enviado al shopper', 'WA fallback/manual preparado · pendiente confirmación'],
      ['Sugiero el mejor shopper por historial y certificación, detecto reprogramaciones tardías y disparo WhatsApp y notificaciones automáticamente al aprobar. Cada decisión queda firmada y trazada.', 'Sugiero el mejor shopper por historial y certificación, detecto reprogramaciones tardías y preparo WhatsApp/fallback manual y notificaciones para revisión al aprobar. Cada decisión queda firmada y trazada.'],
      ["ui.toast('WhatsApp a '+s.nombre+' (Make)','ok');", "ui.toast('WhatsApp Web/fallback manual preparado para '+s.nombre,'ok');"],
      ["act(b.dataset.ap,'✅ Aprobada','green','Aprobada · WhatsApp enviado al shopper');", "act(b.dataset.ap,'✅ Aprobada','green','Aprobación registrada · WhatsApp Web/fallback manual preparado');"],
      ["act(x.id,'✅ Aprobada','green','Aprobada · WhatsApp enviado');", "act(x.id,'✅ Aprobada','green','Aprobación registrada · notificación preparada');"],
      ["ui.toast('Asignación actualizada · HR sincronizada · por '+gestor(),'ok');", "ui.toast('Asignación actualizada · HR sync pendiente backend · por '+gestor(),'ok');"],
      ['<span class="bdg bdg-g">● En vivo</span>', '<span class="bdg bdg-n">Preview · backend pendiente</span>']
    ]
  },
  {
    file: 'app/modules/dashboard.js',
    pairs: [
      ["ui.toast('Correo enviado a '+n+' shopper(s) (Make/Outlook)','ok');", "ui.toast('Borrador/notificación preparada para '+n+' shopper(s) · envío real pendiente backend','ok');"],
      ['<span class="bdg bdg-g">● En vivo</span><button', '<span class="bdg bdg-n">Preview · backend pendiente</span><button'],
      ["ui.toast('WhatsApp enviado (Make): '+decodeURIComponent(b.dataset.wa).slice(0,40)+'…','ok');", "ui.toast('WhatsApp Web/fallback manual preparado · Make pendiente backend: '+decodeURIComponent(b.dataset.wa).slice(0,40)+'…','ok');"],
      ["ui.toast('WhatsApp a '+s.nombre+' (Make)','ok');", "ui.toast('WhatsApp Web/fallback manual preparado para '+s.nombre,'ok');"]
    ]
  },
  {
    file: 'app/modules/automatizaciones.js',
    pairs: [
      ['CXOrbia · Automatizaciones (Make) + integraciones + IA — admin', 'CXOrbia · Automatizaciones preview + integraciones + IA — admin'],
      ['Programa recordatorios automáticos (Make) o dispáralos manualmente.', 'Prepara recordatorios y payloads; el disparo real requiere backend/Make activo.'],
      ['📜 Registro de disparos (Make)', '📜 Registro preview de eventos preparados'],
      ['últimos eventos enviados', 'últimos eventos preparados'],
      ['Payload de prueba enviado al escenario Make', 'Payload de prueba preparado para revisión · Make pendiente backend'],
      ["ui.toast(A.hook()?'Disparo enviado a Make':'Configura el webhook primero','ok');", "ui.toast(A.hook()?'Evento preparado · webhook pendiente backend':'Configura el webhook primero','ok');"]
    ]
  },
  {
    file: 'app/modules/cuestionario-shopper.js',
    pairs: [['marca la visita como cuestionario enviado', 'marca la visita como cuestionario realizado/completado']]
  },
  {
    file: 'app/modules/reservas.js',
    pairs: [['Reserva aprobada · visita asignada · shopper notificado', 'Reserva aprobada · visita asignada · notificación preparada']]
  },
  {
    file: 'app/core/manuales-data.js',
    pairs: [
      ['Da seguimiento al estado de cada visita hasta el cuestionario enviado.', 'Da seguimiento al estado de cada visita hasta cuestionario realizado/completado, sin confundirlo con revisión, submitido, liquidación o pago.'],
      ['Notifica a los shoppers atrasados.', 'Prepara notificaciones o usa fallback manual para shoppers atrasados hasta activar backend/canales reales.']
    ]
  },
  {
    file: 'app/core/topbar.js',
    pairs: [["CX.ui.toast('Correo enviado a '+to,'ok');", "CX.ui.toast('Correo preparado para '+to+' · envío real pendiente de proveedor conectado','ok');"]]
  },
  {
    file: 'app/modules/correo.js',
    pairs: [["ui.toast(conn?'Correo enviado':'Correo guardado en Enviados · se despachará al conectar tu cuenta','ok',3500);", "ui.toast(conn?'Correo enviado':'Correo preparado · pendiente envío al conectar tu cuenta','ok',3500);"]]
  },
  {
    file: 'app/modules/finanzas.js',
    pairs: [
      ["ui.toast(r.pagadas+' liquidaciones pagadas · egreso(s) automáticos · Beneficios y Finanzas sincronizados','ok',4200);", "ui.toast(r.pagadas+' liquidaciones marcadas para revisión de pago · egresos pendientes confirmación backend','ok',4200);"],
      ["p.name+' · sincronizadas con el avance de cada visita'", "p.name+' · vinculadas al avance de cada visita · validación backend pendiente'"],
      ['se generan los egresos automáticamente.', 'los egresos quedan preparados y requieren confirmación/backend antes de pago real.'],
      ["ui.toast('Liquidación corregida · sincronizada','ok',3200);", "ui.toast('Liquidación corregida · validación backend pendiente','ok',3200);"]
    ]
  },
  {
    file: 'app/modules/importador.js',
    pairs: [["ui.toast('Importadas '+ent.cantidad+' visita(s) · sincronizado con liquidaciones y dashboard','ok',4000);", "ui.toast('Preview importado: '+ent.cantidad+' visita(s) · liquidaciones/dashboard pendientes de backend','ok',4000);"]]
  },
  {
    file: 'app/modules/operacion-extra.js',
    pairs: [['Una sola fuente de verdad: edita fechas y reembolsos aquí o en la hoja externa; la plataforma se mantiene sincronizada y no duplica visitas (match por ID de fila).', 'Fuente única preparada: fechas y reembolsos se revisan aquí o desde fuente externa; la sincronización real y dedupe por ID de fila quedan pendientes de backend/gate.']]
  }
];

const criticalResidues = [
  'WhatsApp enviado',
  'WA enviado',
  'HR sincronizada',
  'shopper notificado',
  'Correo enviado a',
  'Payload de prueba enviado',
  'Disparo enviado',
  'eventos enviados',
  'cuestionario enviado',
  'egreso(s) automáticos',
  'se generan los egresos automáticamente',
  'Liquidación corregida · sincronizada'
];

const changed = [];
const missing = [];

for (const item of replacements) {
  const abs = path.join(root, item.file);
  if (!fs.existsSync(abs)) {
    missing.push(item.file);
    continue;
  }
  let text = fs.readFileSync(abs, 'utf8');
  const original = text;
  for (const [from, to] of item.pairs) text = text.split(from).join(to);
  if (text !== original) {
    changed.push(item.file);
    if (apply) fs.writeFileSync(abs, text, 'utf8');
  }
}

const filesToValidate = replacements.map(x => x.file).filter(f => fs.existsSync(path.join(root, f)) && f.endsWith('.js'));
let syntaxOk = true;
if (apply || check) {
  for (const rel of filesToValidate) {
    try {
      execFileSync('node', ['--check', path.join(root, rel)], { stdio: 'pipe' });
    } catch (err) {
      syntaxOk = false;
      console.error('SYNTAX_FAIL', rel);
      console.error(String(err.stderr || err.message));
    }
  }
}

const residueHits = [];
for (const rel of filesToValidate) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const term of criticalResidues) {
    if (text.includes(term)) residueHits.push({ file: rel, term });
  }
}

const report = {
  mode: apply ? 'apply' : 'check',
  changedCandidates: changed,
  missing,
  syntaxOk,
  residueHits,
  safeState: {
    deploy: false,
    production: false,
    firestoreWrites: false,
    authWrites: false,
    storageWrites: false,
    hrWrites: false,
    makeCalls: false,
    geminiCalls: false,
    whatsappCalls: false,
    emailCalls: false
  }
};

console.log(JSON.stringify(report, null, 2));

if (!syntaxOk || residueHits.length) process.exitCode = 1;
