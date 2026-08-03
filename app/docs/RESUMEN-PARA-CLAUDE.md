# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `RECONSTRUCTION_ACTIVE__A_PLUS_B_SCOPE_LOCKED__NO_DEPLOY__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre `docs-tya-v6-v71-audit`. No crear candidata, shell reducido, nueva rama, PR, Firebase, Hosting o workflow paralelo.

Fuentes obligatorias:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-A-B-SCOPE-LOCK-OVERLAYS-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

Una versión técnica sin aprobación humana no se presenta como aprobada.

## 2. Contrato Familia A

- una sola entrada humana;
- tenant técnico `tya`;
- proyecto `cinepolis`;
- periodos `cinepolis-YYYY-MM` separados del proyecto;
- HR viva gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- `CX.data` conserva su interfaz pública;
- read model + canonical semantics gobiernan estados/KPIs;
- localStorage no concede Auth, rol, tenant ni scope;
- `tya::cinepolis`: delegado, localBilling false, regalía 0, Q60/L200;
- bridges DOM no pueden ser autoridad final;
- build-lock V174 se sustituye al ensamblar la candidata acumulativa.

## 3. Familia B — decisiones frontend

### Dashboard

Preservar UI, KPIs, drilldowns y desglose por país. Reconciliar fases/comparativos con read model/canonical semantics. No depender de bridge DOM posterior.

### CRM Ops Leads

Preservar pipeline, leads, cuentas, contactos, actividades, ficha 360, metas y reportes. Sin backend CRM real: vacío/pending-source honesto, no prospectos ficticios.

### Clientes

Mantener ficha y Cliente→Proyecto. Retirar en modo conectado contactos, correos, prospectos y scores sintéticos. No deduplicar por nombre visual.

### Comercial

Mantener calculadora/propuestas, pero consumir configuración financiera por proyecto. Cinépolis: delegado, localBilling false, regalía 0, Q60/L200. IA/web/plantillas con gate.

### Marketing

Preservar diseño/calendario. No mostrar contenido, fechas, alcance, interacciones o leads ficticios en conectado. Gemini/Make solo con autorización real.

### Hojas de Ruta

Preservar interfaz y HR viva. Proyecto/Periodo correctos. IA/import/Google Sheets con gate; no prometer sincronización no activada.

## 4. Scope lock A+B

No tocar durante el primer checkpoint:

- `operacion-extra.js` → Familia D;
- `cliente-extra.js` → Familias F/G;
- `cliente-insights.js` → Familia F;
- Portal Cliente, reportes, Insights, Shopper, Finanzas completa, Academia e integraciones.

Solo una dependencia transversal P0 demostrada permite abrirlos.

## 5. PASS preservados

- 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- entrada humana única;
- configuración financiera delegada;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

## 6. Validación visual

Primer build A+B, validado por Paula módulo por módulo:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No avanzar a C+D por PASS técnico solamente.

## 7. Próximo bloque

`PROVENIENCIA/APROBACIONES A+B → SHAS OBJETIVO → DELTA COMPLETO → GATES SOURCE-ONLY`.

## 8. Prohibiciones

- no parchear UI desde backend;
- no seeds ni métricas falsas;
- no ampliar alcance a módulos posteriores;
- no seleccionar por número de versión;
- no deploy durante inventario;
- no merge ni producción antes de candidata única y aprobación visual.
