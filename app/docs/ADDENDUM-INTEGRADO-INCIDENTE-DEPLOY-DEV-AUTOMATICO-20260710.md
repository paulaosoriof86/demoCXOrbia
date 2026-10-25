# Addendum integrado — incidente de deploy DEV automático

Fecha: 2026-07-10  
Aplica como addendum a:

- `CAMBIOS-BACKEND.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- tracker Phase A;
- impacto Academia.

## CAMBIOS-BACKEND — Corrección de estado

Durante el bloque de reconciliación source lock post-V96, el workflow preexistente `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml` desplegó automáticamente Firebase Hosting DEV en run 440.

Cambio de contención aplicado:

- commit `35f1db9ce34e959710adfb1ede05458a7d9bb4f4`;
- se eliminaron triggers `push` y `pull_request`;
- quedó únicamente `workflow_dispatch`;
- requiere texto exacto `DEPLOY_DEV_ROOT`;
- agregó gate source lock post-V96;
- alineó drift al SHA `489b0420a820b390f4307db93fe8280959f3867c`.

Estado real del bloque:

- sí hubo deploy DEV Hosting no autorizado;
- no hubo producción;
- no hubo Firestore/Auth/Storage/Functions/import/HR writeback/Make/Gemini/pagos;
- no se ejecutó rollback;
- futuros deploys automáticos quedaron bloqueados.

## RESUMEN-PARA-CLAUDE — Qué debe preservarse

Claude/frontend debe saber que:

1. El DEV root actual puede contener el runtime del merge ref desplegado en run 440.
2. Ese runtime no coincide con el source lock post-V96: 37 de 67 hashes difieren.
3. No debe usar la URL DEV como prueba de que el empalme post-V96 está terminado.
4. El siguiente prototipo/carril debe trabajar sobre el source lock post-V96 y preservar selectivamente backend safe-only/patches útiles.
5. No debe reactivar triggers automáticos de deploy.
6. Todo deploy futuro requiere autorización explícita y gates verdes.

## PENDIENTES-PROTOTIPO — Nuevo pendiente crítico

P0:

- empalmar el runtime post-V96 antes de declarar DEV aceptable;
- ejecutar hash gate, drift, sintaxis, index/manifest/PWA y smoke por rol;
- decidir qué archivos adicionales se preservan;
- no crear usuarios ni conectar Auth/Firestore mientras el source-lock gate esté en NO GO.

P1:

- copy visible de DEV/preview debe dejar claro que una URL desplegada no equivale a producción ni a backend conectado;
- Diagnóstico/Readiness debe poder mostrar `runtime source lock mismatch` de forma honesta cuando aplique.

## TRACKER PHASE A — Estado actualizado

Bloque completado:

- detección de divergencia runtime;
- creación de manifest/gate;
- reconciliación del drift;
- contención de deploy automático.

Bloqueado:

- source-lock empalme;
- nuevo deploy/rollback DEV;
- Auth/Firestore activation;
- `CX.data` switch;
- producción.

Siguiente bloque exacto:

- empalme controlado del source lock post-V96 en carril frontend autorizado;
- rerun de gates;
- decisión explícita sobre rollback o redeploy DEV.

## ACADEMIA — Impacto

Academia/manuales deben explicar:

- diferencia entre “desplegado en DEV”, “validado”, “conectado” y “producción”;
- que un deploy de Hosting no activa Firestore/Auth/Storage/Make/Gemini;
- que un source-lock mismatch invalida la aceptación del runtime aunque la URL abra;
- que rollback/redeploy requieren autorización y trazabilidad.

No se publican automáticamente cursos ni notificaciones por este addendum.

## Clasificación obligatoria

### Reusable CXOrbia

- deploy workflows manual-only por defecto;
- confirmación explícita humana;
- source-lock gate antes de deploy;
- drift SHA único y coherente;
- registro de incidente y corrección de estado.

### Exclusivo cliente

- destino afectado: Firebase Hosting DEV de CXOrbia TyA;
- no se tocaron datos operativos TyA ni pagos.

### Claude/prototipo

- empalme runtime;
- copy honesto de DEV/producción;
- visualización de mismatch en Diagnóstico/Readiness;
- prohibición de reactivar auto-deploy.

### Academia

- lección de ambientes/gates/deploy;
- checklist de autorización;
- diferencia Hosting vs backend de datos.

### Sin impacto Claude

- eliminación de triggers automáticos;
- confirmación manual exacta;
- gate source-lock previo a Firebase;
- bloqueo de writes/providers/imports.

## Necesidad de Paula

No se requieren datos adicionales.

Se necesita autorización explícita únicamente para una acción que vuelva a modificar Hosting DEV: rollback o redeploy.
