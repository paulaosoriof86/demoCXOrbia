# ADDENDUM MAESTRO — EJECUCIÓN DIRECTA DE EMPALMES BASADA EN ORBIT

Fecha: 2026-07-16  
Actualización vinculante: 2026-07-17  
Estado: **ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE**

## 1. Fuente única de verdad

Este documento es la única metodología vigente para empalmes ordinarios de candidatas frontend CXOrbia. Sustituye y deja sin efecto cualquier documento, contrato, agente, script, workflow o propuesta que exija transporte local del ZIP, carpeta `incoming/`, plan JSON de empalme, ejecutable `.cmd`, PowerShell para Paula o instalación local como requisito del empalme.

La metodología fue adaptada del modelo operativo utilizado en Orbit 360: candidata auditada, delta identificado, aplicación directa sobre la rama viva, preservación de backend y documentación, commit/push verificable, gates posteriores y validación visual final.

## 2. Regla irreversible por estado

Estados permitidos:

- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO_READY_DIRECT_APPLY`
- `EMPALMED_PENDING_POST_GATES`
- `ACTIVE_BASELINE`

Cuando una candidata alcanza `AUDITED_GO_READY_DIRECT_APPLY`, no puede regresar a planificación, transporte, instalación, reauditoría general, nueva arquitectura ni preparación de otra candidata.

La única operación permitida es:

`APPLY_DELTA_DIRECTLY`

sobre la rama viva:

`docs-tya-v6-v71-audit`

## 3. Secuencia obligatoria

1. Verificar la auditoría GO, el delta exacto, el HEAD vigente y la ausencia de P0 demostrado.
2. Aplicar directamente el delta auditado sobre la rama viva mediante operaciones autenticadas del repositorio.
3. Preservar backend, contratos, adapters, tools, overlays TyA, datos source-safe y documentación acumulada.
4. Realizar únicamente reconciliaciones explícitas ya documentadas.
5. Generar manifest, `build-lock.js`, verificador y registro de baseline.
6. Actualizar `CAMBIOS-BACKEND.md` o addendum, `RESUMEN-PARA-CLAUDE.md` o addendum y `PENDIENTES-PROTOTIPO.md` o addendum.
7. Crear commit y push verificables sobre la rama viva.
8. Ejecutar gates y smoke después del empalme y antes de DEV o producción.
9. Solicitar validación visual únicamente cuando el bloque técnico esté cerrado.

## 4. Prohibiciones absolutas

Con estado `AUDITED_GO_READY_DIRECT_APPLY` queda prohibido:

- crear otra rama o PR;
- crear workflows o usar GitHub Actions como requisito de transporte/aplicación;
- pedir a Paula PowerShell, `.cmd`, copias manuales, descargas, descompresión o colocación de archivos;
- usar `incoming/`, `EMPALME-*.json` o integradores locales como paso obligatorio;
- usar Drive, Base64, blobs, trees o service accounts como transporte primario;
- solicitar otra candidata;
- reabrir versiones cerradas;
- repetir la auditoría completa;
- iniciar una metodología nueva;
- convertir gates posteriores en bloqueo previo;
- responder con otra explicación metodológica cuando existe una acción directa ejecutable.

Un bloqueo técnico real se informa una sola vez con evidencia exacta. Solo un `P0_PROVEN` puede detener la aplicación directa.

## 5. Criterio P0

Solo se considera P0 cuando existe evidencia reproducible de:

- aplicación que no inicia;
- error sintáctico crítico;
- ruta esencial rota;
- pérdida crítica o eliminación no autorizada;
- secreto o dato sensible expuesto;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impida Phase A.

P1 y P2 se documentan y no bloquean el empalme.

## 6. Preservación obligatoria

El empalme debe conservar:

- backend nuevo y limpio;
- contratos y adapters;
- tools y validadores útiles;
- overlays TyA source-safe;
- multi-tenant y multi-proyecto;
- selección explícita de proyecto;
- Cinépolis como proyecto normal configurable, nunca default;
- shoppers históricos;
- certificaciones ya presentadas;
- liquidaciones y pagos como control;
- separación entre frontend, backend y proveedores reales.

## 7. Control antidesvío

Ningún documento posterior puede sustituir esta metodología por iniciativa de un agente o conversación.

Solo puede modificarse cuando concurran simultáneamente:

1. `P0_PROVEN` con evidencia reproducible;
2. explicación de por qué la aplicación directa resulta técnicamente imposible;
3. propuesta compatible con multi-tenant y multi-proyecto;
4. autorización expresa de Paula en la conversación actual;
5. actualización conjunta de este addendum, `AGENTS.md`, contrato de método, validador y documentación obligatoria.

La demora, el tamaño del ZIP, una limitación temporal del conector o la preferencia de un agente no constituyen P0 ni autorizan cambiar la metodología.

## 8. Estado V156

- Candidata: `V156`.
- Estado: `AUDITED_GO_READY_DIRECT_APPLY`.
- Decisión: GO.
- Delta: 35 archivos runtime modificados y 0 eliminados.
- Operación única: `APPLY_DELTA_DIRECTLY`.
- Rama viva: `docs-tya-v6-v71-audit`.
- Gates y smoke: posteriores al empalme.

## 9. Clasificación

- **Reusable CXOrbia:** máquina de estados, aplicación directa, source lock y control antidesvío.
- **Exclusivo cliente:** gates y reglas TyA/Cinépolis.
- **Claude/prototipo:** V156 como candidata frontend activa y pendientes visuales reales.
- **Academia:** revisión de manuales, cursos, rutas por rol, certificaciones y notificaciones después del empalme.
- **Sin impacto Claude:** manifest, build-lock, validadores y controles internos.

## 10. Estado seguro

Este documento no autoriza merge, deploy, producción, importaciones reales, Firestore/HR writes, Make/Gemini live, Storage real ni pagos.