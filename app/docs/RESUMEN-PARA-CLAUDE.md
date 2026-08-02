# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `RECONSTRUCTION_ACTIVE__FAMILY_A_CONTRACT_DEFINED__FAMILY_B_INVENTORY_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre `docs-tya-v6-v71-audit`. No crear candidata, shell reducido, nueva rama, PR, Firebase, Hosting o workflow paralelo.

Fuentes nuevas obligatorias:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`;
- `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`.

Una versión técnica sin aprobación humana no se presenta como aprobada.

## 2. Contrato Familia A que no puede romperse

- una sola entrada humana;
- tenant técnico `tya`;
- proyecto `cinepolis`;
- periodos `cinepolis-YYYY-MM` separados del proyecto;
- HR viva gobierna periodos, visitas y estado operacional;
- Firestore solo enriquece por llaves exactas;
- `CX.data` conserva su interfaz pública;
- read model + canonical semantics gobiernan estados/KPIs;
- localStorage no concede Auth, rol, tenant ni scope;
- modelo financiero `tya::cinepolis` delegado, localBilling false, regalía 0;
- bridges DOM/adapters no pueden quedar como única autoridad final;
- build-lock V174 se sustituye solo al ensamblar la candidata acumulativa.

## 3. Familia B — decisiones frontend

### Dashboard

Preservar UI, KPIs clickeables, drilldowns y desglose por país. Reconciliar `phaseFlow()` y comparativos para consumir directamente read model/canonical semantics. No depender de un bridge DOM posterior para corregir el resultado.

### CRM Ops Leads

Preservar pipeline, leads, cuentas, contactos, actividades, ficha 360, metas y reportes. El store actual es local/demo; en modo conectado debe mostrar vacío/pending-source honesto hasta que exista fuente real. No rellenar con prospectos ficticios.

### Clientes

Mantener ficha, relación Cliente→Proyecto y navegación. Retirar en modo conectado contactos, correos y prospectos sintéticos. No deduplicar por nombre visual.

### Comercial

Mantener calculadora y propuestas, pero consumir configuración financiera por proyecto. Para Cinépolis: delegado, localBilling false, regalía 0, Q60/L200. No usar defaults genéricos ni prometer IA/web sin gate.

### Marketing

Preservar diseño/calendario, pero no mostrar contenido, alcance, interacciones o leads ficticios en modo conectado. Gemini/Make solo con autorización y gate real.

### Hojas de Ruta

Preservar interfaz y HR viva. Proyecto/Periodo deben ser correctos. IA/import/Google Sheets requieren gate; no prometer sincronización no activada.

## 4. PASS que deben preservarse

- 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- entrada humana única;
- configuración financiera delegada;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

## 5. Validación visual

El primer build visible será acumulativo A+B. Paula validará módulo por módulo:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se avanza a Operación/Shopper por PASS técnico solamente.

## 6. Próximo bloque

`INSPECCIONAR OVERLAYS/EXTRAS B → RECUPERAR APROBACIONES Y COMMITS → DEFINIR SHAS OBJETIVO A+B → DELTA COMPLETO → GATES SOURCE-ONLY`.

## 7. Prohibiciones

- no parchear UI desde backend para esconder inconsistencias;
- no agregar seeds o métricas falsas;
- no seleccionar por número de versión;
- no despliegue durante inventario;
- no merge ni producción antes de candidata única y aprobación visual.
