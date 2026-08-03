# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `A_PLUS_B_VISIBLE_ON_SINGLE_DEV__VISUAL_REVIEW_OPEN__NO_NEW_CANDIDATE__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- DEV exacto: `https://cxorbia-backend-dev.web.app/index-backend-dev.html`.

No crear candidata, shell reducido, rama, PR, Firebase, Hosting o workflow paralelo.

## 2. Qué ya está publicado

La candidata A+B fue desplegada una vez con 2320 archivos y paridad remota exacta.

Componentes acumulativos:

- `app/adapters/tya-ab-cumulative-composition-v1.js`;
- `app/index-backend-dev.html`;
- módulos Dashboard, CRM, Clientes, Comercial, Marketing y Rutas preservados;
- runtime/Auth/HR/Shopper/Cliente/Finanzas C6 preservados.

El adapter:

- retira prospectos sintéticos y contactos placeholder;
- oculta fixtures CRM/Marketing;
- conserva altas con `platform_user`;
- preserva HR, `CX.data`, Auth y finanzas canónicas;
- no escribe proveedores.

## 3. PASS demostrados

- source gate A+B;
- manifest de 23 blobs;
- unit gate 23/23;
- static cumulative;
- paridad remota;
- HR 14 periodos/616 visitas;
- Staff estable;
- Shopper 208 perfiles, identidad exacta y `ownVisits=1`;
- Cliente `tya/cinepolis`;
- Finanzas delegada, localBilling false, regalía 0, Q60/L200.

## 4. False negative del gate semántico

El cierre STOP_RETRY no demostró una regresión del módulo financiero. El gate buscaba `CX.modules.finanzas`, pero el módulo se registra como `CX.module('financiero', ...)`.

Root fix QA:

`68f1b49b3c03d53e0d9c74d15d0f55e286653a0e`

Ahora:

- valida `financiero`;
- persiste `failedStage`, `errorCode` y snapshots parciales;
- no toca `app/`;
- no requiere otra candidata.

## 5. Checkpoint Visual 1

Paula revisará en el mismo build:

- login/shell/tenant/proyecto/periodo/fuente;
- navegación;
- CRM Ops Leads;
- Dashboard y drilldowns;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing.

No presentar como aprobado visualmente antes de su respuesta.

## 6. Reglas para ajustes frontend

- corregir sobre la misma rama/candidata;
- no restaurar versiones por número;
- no insertar seeds o métricas ficticias;
- no parchear desde backend lo que corresponda al módulo UI;
- preservar IDs, contratos y PASS técnicos;
- no abrir Operación/Shopper/Finanzas completa/Portales/Academia hasta cerrar el checkpoint, salvo P0 transversal reproducible.

## 7. Próximo bloque

`OBSERVACIONES VISUALES DE PAULA SOBRE EL DEV EXISTENTE → DELTA FOCALIZADO EN LA MISMA CANDIDATA → REVALIDACIÓN READ-ONLY SIN REDEPLOY INNECESARIO`.

## 8. Estado seguro

- Hosting DEV deploys del macro: 1;
- segundo deploy: 0;
- provider writes: 0;
- merge: false;
- producción: false.
