# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `A_PLUS_B_SOURCE_ASSEMBLED__PRECHECK_PASS__EXACT_CHECKOUT_GATE_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre `docs-tya-v6-v71-audit`. No crear candidata, shell reducido, rama, PR, Firebase, Hosting o workflow paralelo.

Leer primero:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`;
- `EVIDENCE-A-B-CUMULATIVE-SOURCE-PRECHECK-20260802.json`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

## 2. Qué ya se aplicó

Se creó:

`app/adapters/tya-ab-cumulative-composition-v1.js`

Blob final:

`9c0d76382531b8393cc0866ec694935a2a5e25a6`.

Se incorporó una sola vez en:

`app/index-backend-dev.html`

Blob:

`b9a4aaf063d97305c3f4f53eba8f02b526d61761`.

El adapter:

- no reescribe módulos frontend;
- preserva HR viva, `CX.data`, Auth y configuración financiera;
- retira prospectos sintéticos y contactos placeholder en conectado;
- oculta fixtures CRM y Marketing;
- conserva registros creados por usuario con proveniencia `platform_user`;
- alinea Marketing al periodo activo;
- no borra localStorage ni escribe proveedores.

## 3. Módulos A+B preservados

No modificar por rutina:

- `dashboard.js`;
- `crm.js`;
- `clientes.js`;
- `comercial.js`;
- `marketing.js`;
- `rutas.js`;
- `app.js`;
- `layout.css`.

Proveniencia:

- M1/Corte 1 aprobado: `67c0943260f076f5686284ac509458ed5fd34dbd`;
- Corte 2A no cambió A+B;
- V182 frozen preservado en `app.js` y `layout.css`.

Dashboard conserva UI aprobada, pero el runtime compuesto debe revisarse. Los demás módulos son `BEST_TECHNICAL_PENDING_VISUAL`, no se deben presentar como aprobados antes de la revisión de Paula.

## 4. Reglas frontend del Checkpoint 1

### Dashboard

- tile, fase, comparativo y drilldown deben coincidir;
- usar HR/read model/semántica canónica;
- cero métricas fabricadas;
- cualquier bridge posterior forma parte del build a validar y no puede esconder regresiones.

### CRM Ops Leads

- conservar pipeline, leads, cuentas, contactos, actividades, ficha 360, metas y reportes;
- sin backend CRM real: vacío/pending-source honesto;
- no fixtures aparentes;
- nuevos registros locales deben conservar proveniencia `platform_user`.

### Clientes

- conservar Cliente→Proyecto;
- no mostrar prospectos/contactos/correos placeholder;
- no deduplicar por nombre visual.

### Comercial

- conservar como herramienta de planificación/propuestas;
- no presentar defaults como valores contractuales confirmados;
- Cinépolis permanece delegado, localBilling false, regalía 0, Q60/L200;
- IA/web/plantillas no activas sin gate.

### Marketing

- conservar UI/calendario;
- sin contenido, alcance, interacciones o leads ficticios en conectado;
- mes alineado al periodo activo;
- Make/Gemini inactivos.

### Hojas de Ruta

- HR viva;
- proyecto y periodo correctos;
- IA/import/Google Sheets y writes gateados.

## 5. Gates

- `tya-ab-cumulative-composition-unit.mjs`: PASS, 23 verificaciones;
- `tya-ab-cumulative-candidate-source-gate.mjs`: listo, pendiente de checkout exacto;
- no afirmar PASS integral todavía;
- no deploy antes de ese PASS.

## 6. Scope lock

No tocar durante A+B salvo P0 transversal demostrado:

- Operación/Shopper;
- Finanzas completa;
- Portal Cliente/reportes/Insights;
- configuración/integraciones;
- Academia.

## 7. Validación visual obligatoria

Primer build único:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No avanzar a C+D por PASS técnico solamente.

## 8. Próximo bloque

`EXACT CHECKOUT SOURCE GATE → STATIC/CUMULATIVE GATES → SI PASS, UN SOLO HOSTING DEV AUTORIZADO → CHECKPOINT VISUAL 1`.

## 9. Prohibiciones

- no nueva candidata o metodología;
- no reescritura frontend arbitraria;
- no seeds/métricas falsas;
- no expandir alcance;
- no deploy, merge o producción sin autorización y gate.
