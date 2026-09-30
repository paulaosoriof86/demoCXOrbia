import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const now = new Date().toISOString();
const tenantId = 'tya';

const catalog = [
  ['outlook365', 'correo', 'Outlook / Microsoft 365', 'Bandeja integrada; vincula correos a proyectos, shoppers, clientes y gestiones.', 'pro', ['oauthTenant', 'mailbox'], ['clientSecret', 'refreshToken']],
  ['gmail', 'correo', 'Gmail / Google Workspace', 'Sincroniza correos y contactos de Google.', 'pro', ['oauthClient', 'workspaceDomain'], ['clientSecret', 'refreshToken']],
  ['imap', 'correo', 'IMAP / POP3', 'Conecta cualquier proveedor con dominio corporativo.', 'standard', ['host', 'port', 'username'], ['password']],
  ['whatsapp_business', 'comunicacion', 'WhatsApp Business', 'Recordatorios, notificaciones, encuestas y mensajería a shoppers y clientes.', 'standard', ['mode', 'phoneNumber'], ['apiToken']],
  ['telegram', 'comunicacion', 'Telegram', 'Notificaciones internas del equipo y alertas operativas.', 'pro', ['botName'], ['botToken']],
  ['sms', 'comunicacion', 'SMS', 'Avisos de visita y alertas por mensaje de texto.', 'enterprise', ['provider', 'sender'], ['apiKey']],
  ['google_sheets', 'google', 'Google Sheets', 'HR viva colaborativa; importación/exportación de datos y reportes.', 'standard', ['spreadsheetUrl'], ['refreshToken']],
  ['google_drive', 'google', 'Google Drive', 'Expedientes y documentos por cliente, shopper y proyecto.', 'pro', ['folderId'], ['refreshToken']],
  ['google_calendar', 'google', 'Google Calendar', 'Agenda operativa y recordatorios por visita/proyecto.', 'pro', ['calendarId'], ['refreshToken']],
  ['google_forms', 'google', 'Google Forms', 'Cuestionarios externos y captura auxiliar.', 'pro', ['formUrl'], ['refreshToken']],
  ['looker_studio', 'google', 'Looker Studio', 'Dashboards externos y tableros para cliente.', 'enterprise', ['reportUrl'], []],
  ['teams', 'microsoft', 'Microsoft Teams', 'Alertas y coordinación interna.', 'pro', ['teamId', 'channelId'], ['webhookSecret']],
  ['onedrive_excel', 'microsoft', 'OneDrive / Excel Online', 'HR viva en Excel Online e intercambio de reportes.', 'pro', ['workbookUrl'], ['refreshToken']],
  ['gemini', 'ai', 'Gemini', 'Generación y análisis IA con modelos Google.', 'standard', ['model'], ['apiKey']],
  ['openai', 'ai', 'OpenAI', 'Generación, análisis, síntesis y extracción con modelos OpenAI.', 'pro', ['model'], ['apiKey']],
  ['anthropic', 'ai', 'Anthropic Claude', 'Análisis documental y generación con Claude.', 'pro', ['model'], ['apiKey']],
  ['custom_ai', 'ai', 'Endpoint IA propio', 'Proveedor propio o proxy backend.', 'enterprise', ['endpointPublic'], ['apiKey']],
  ['canva', 'contenido', 'Canva', 'Piezas visuales, presentaciones y materiales comerciales.', 'pro', ['workspaceId'], ['accessToken']],
  ['gamma', 'contenido', 'Gamma', 'Presentaciones comerciales y reportes narrativos.', 'pro', ['workspaceId'], ['apiKey']],
  ['heygen', 'contenido', 'HeyGen', 'Videos con avatar y capacitación.', 'enterprise', ['workspaceId'], ['apiKey']],
  ['metricool', 'marketing', 'Metricool', 'Programación y medición de redes.', 'pro', ['brandId'], ['apiKey']],
  ['meta', 'marketing', 'Meta Business', 'Publicaciones, anuncios y campañas.', 'pro', ['businessId'], ['accessToken']],
  ['linkedin', 'marketing', 'LinkedIn', 'Publicación y gestión comercial.', 'pro', ['organizationId'], ['accessToken']],
  ['tiktok', 'marketing', 'TikTok', 'Contenido y medición social.', 'pro', ['accountId'], ['accessToken']],
  ['youtube', 'marketing', 'YouTube', 'Videos de entrenamiento y difusión.', 'pro', ['channelId'], ['refreshToken']],
  ['mailchimp', 'marketing', 'Mailchimp', 'Campañas y correo masivo.', 'pro', ['audienceId'], ['apiKey']],
  ['make', 'automatizacion', 'Make', 'Webhooks y automatizaciones operativas.', 'standard', ['webhookUrl'], ['webhookSecret']],
  ['zapier', 'automatizacion', 'Zapier', 'Automatizaciones no-code.', 'pro', ['webhookUrl'], ['webhookSecret']],
  ['n8n', 'automatizacion', 'n8n', 'Automatizaciones self-hosted o cloud.', 'enterprise', ['webhookUrl'], ['apiKey']],
  ['notion', 'productividad', 'Notion', 'Bases de conocimiento y documentación.', 'pro', ['databaseId'], ['apiKey']],
  ['slack', 'productividad', 'Slack', 'Alertas y coordinación interna.', 'pro', ['workspaceId', 'channelId'], ['botToken']],
  ['zoom', 'productividad', 'Zoom', 'Reuniones, grabaciones y resúmenes.', 'pro', ['accountId'], ['clientSecret']],
  ['trello', 'productividad', 'Trello', 'Tableros de tareas y seguimiento.', 'pro', ['boardId'], ['apiToken']],
  ['billing', 'datos_finanzas', 'Facturación', 'Facturas, comprobantes e impuestos por país.', 'enterprise', ['countryProvider'], ['apiKey']],
  ['open_banking', 'datos_finanzas', 'Banca / Open Banking', 'Conciliación bancaria y movimientos reales.', 'enterprise', ['bankProvider'], ['clientSecret']]
].map(([id, category, name, description, plan, requiredFields, secretFields]) => ({
  id,
  category,
  name,
  description,
  plan,
  requiredFields,
  secretFields,
  status: 'available'
}));

const tenantConfig = {
  tenantId,
  brandConfig: {
    name: 'T&A Consultores',
    logoStoragePath: null,
    theme: 'cxorbia',
    countries: ['GT', 'HN']
  },
  moduleConfig: {
    source: 'prototype-v53-review',
    mode: 'draft',
    enabledModules: []
  },
  countryConfig: {
    countries: ['GT', 'HN'],
    currencyByCountry: { GT: 'Q', HN: 'L' }
  },
  ndaConfig: {
    active: false,
    documentStoragePath: null,
    version: null
  },
  plan: 'pro',
  updatedAt: now,
  updatedBy: 'dry-run'
};

const projectConfig = {
  tenantId,
  projectId: 'cinepolis-plantilla',
  countries: ['GT', 'HN'],
  currencyByCountry: { GT: 'Q', HN: 'L' },
  visitRules: {
    scheduling: 'byProjectRules',
    evidenceRequired: true,
    questionnaireRequired: true
  },
  questionnaireConfig: {
    source: 'projectProgram',
    versioned: true
  },
  evidenceConfig: {
    storageRequired: true,
    allowedTypes: ['photo', 'video', 'audio', 'document']
  },
  hrConfig: {
    sourceType: 'googleSheets|excelOnline|native|upload',
    syncMode: 'manual|scheduled|incremental',
    writeBackEnabled: false
  },
  financeConfig: {
    model: 'franchise',
    benefitsSeparatedFromMovements: true
  },
  updatedAt: now,
  updatedBy: 'dry-run'
};

const tenantIntegrations = catalog.map((item) => ({
  tenantId,
  integrationId: item.id,
  status: 'draft',
  planAllowed: ['standard', 'pro'].includes(item.plan),
  configPublic: {},
  secretRef: null,
  lastTestAt: null,
  lastTestStatus: null,
  lastError: null,
  scopes: [],
  updatedAt: now,
  updatedBy: 'dry-run'
}));

const automationRules = [
  ['agenda', 'Visita agendada', 'shopper/admin', 'whatsapp'],
  ['reprog', 'Solicitud o autorización de reprogramación', 'shopper/admin', 'whatsapp'],
  ['realizada', 'Visita realizada', 'admin', 'push'],
  ['cuestionario', 'Cuestionario completado', 'admin', 'push'],
  ['submit', 'Visita submitida', 'finance/admin', 'email'],
  ['pago_programado', 'Pago programado', 'shopper', 'whatsapp'],
  ['pago_realizado', 'Pago realizado', 'shopper', 'whatsapp'],
  ['fuera_rango', 'Agenda fuera de rango', 'shopper/admin', 'whatsapp'],
  ['pendiente_cuestionario', 'Cuestionario pendiente', 'shopper/admin', 'whatsapp'],
  ['integracion_error', 'Error de integración', 'admin', 'email']
].map(([event, label, target, channel]) => ({
  tenantId,
  ruleId: `tya-${event}`,
  event,
  label,
  active: false,
  channel,
  target,
  template: `Plantilla pendiente para ${label}`,
  integrationId: null,
  webhookRef: null,
  countryScope: ['GT', 'HN'],
  projectScope: [],
  retryPolicy: { maxRetries: 2, retryMinutes: 10 },
  updatedAt: now,
  updatedBy: 'dry-run'
}));

const aiConfig = {
  tenantId,
  provider: null,
  model: null,
  active: false,
  secretRef: null,
  endpointPublic: null,
  usagePolicy: {
    allowDocumentAnalysis: false,
    allowGeneration: false,
    allowImportMapping: false,
    monthlyBudget: null
  },
  updatedAt: now,
  updatedBy: 'dry-run'
};

const output = {
  meta: {
    generatedAt: now,
    mode: 'config-integrations-automation-dry-run-read-only',
    tenantId,
    note: 'No escribe Firestore. Solo prepara estructura inicial candidata.'
  },
  counts: {
    catalog: catalog.length,
    tenantIntegrations: tenantIntegrations.length,
    automationRules: automationRules.length
  },
  catalog,
  tenantConfig,
  projectConfig,
  tenantIntegrations,
  automationRules,
  aiConfig
};

const jsonPath = path.join(outDir, 'config-integrations-automation-dry-run.json');
const mdPath = path.join(outDir, 'config-integrations-automation-dry-run-summary.md');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

const byCategory = catalog.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});

const md = [];
md.push('# Configuración / Integraciones / Automatizaciones — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore. No modifica frontend.');
md.push('');
md.push(`Tenant: ${tenantId}`);
md.push(`Integraciones catálogo: ${catalog.length}`);
md.push(`Integraciones tenant draft: ${tenantIntegrations.length}`);
md.push(`Automation rules draft: ${automationRules.length}`);
md.push('');
md.push('## Integraciones por categoría');
md.push('| Categoría | Cantidad |');
md.push('|---|---:|');
Object.entries(byCategory).forEach(([k, v]) => md.push(`| ${k} | ${v} |`));
md.push('');
md.push('## Reglas de seguridad');
md.push('- ConfigPublic no contiene secretos.');
md.push('- Secretos van por secretRef.');
md.push('- Automatizaciones arrancan inactivas.');
md.push('- IA arranca inactiva y sin proveedor.');
md.push('- Storage requerido para logo/evidencias queda como pendiente.');
md.push('');
md.push('## Salidas');
md.push(`- ${jsonPath}`);
md.push(`- ${mdPath}`);
fs.writeFileSync(mdPath, md.join('\n'), 'utf8');

console.log(md.join('\n'));
