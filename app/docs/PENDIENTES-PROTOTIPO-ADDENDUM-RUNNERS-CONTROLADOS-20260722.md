# PENDIENTES PROTOTIPO — ADDENDUM RUNNERS CONTROLADOS

**Fecha:** 2026-07-22

## No es pendiente de frontend

La creación de `CXORBIA_ATOMIC_APPLY_RUNNER` y `CXORBIA_READONLY_POST_GATES_RUNNER` no requiere cambios en la candidata ni en los módulos comerciales.

No pedir a Claude:

- workflows;
- scripts Git;
- Playwright/Chromium;
- manifests de aplicación;
- transporte de ZIP;
- PowerShell/CMD;
- nuevas ramas o PR.

## Pendientes técnicos del carril

1. Ejecutar una primera prueba real del runner atómico con una futura candidata GO o delta frontend auditado.
2. Reproducir en remoto la corrección focalizada del builder R20; el commit local de Codex `ec20ff49262a4c315995a278479931d6017ef798` no está aplicado.
3. Activar `CXORBIA_READONLY_POST_GATES_RUNNER` contra el HEAD exacto corregido.
4. Cerrar R20 + M1 compuesto + Corte 2A + verificador.
5. Regenerar manifest/build-lock/verificador después del cierre técnico.
6. Solicitar autorización separada para Hosting DEV solo con todos los gates PASS.
7. Realizar validación visual por roles y freeze posterior.

## Pendientes frontend preservados

Se mantienen los pendientes V174 ya documentados, entre ellos:

- validación visual real de reportes PDF/XLSX/PPT y branding;
- logo gráfico real no demostrado en PPT;
- copy/encoding histórico menor;
- revisión visual de Academia y rutas por rol;
- `Mis Reportes` Shopper debe continuar fail-closed sin identidad verificable.

Ninguno de estos pendientes justifica una nueva candidata antes de cerrar el bloque R20/M1 actual.

## Riesgos bloqueados por contrato

- aplicación parcial archivo por archivo;
- modificación de backend/tools/.github durante un empalme frontend;
- HEAD inesperado;
- archivos actuales diferentes al SHA auditado;
- BOM o secreto detectado;
- push forzado;
- deploy/merge/producción;
- gates de navegador sin Playwright reproducible.

## Siguiente paso exacto

`CORRECCIÓN R20 REMOTA → REQUEST READ-ONLY LIGADO AL HEAD → GATES COMPLETOS → LOCK → HOSTING DEV AUTORIZADO → VALIDACIÓN VISUAL`.
