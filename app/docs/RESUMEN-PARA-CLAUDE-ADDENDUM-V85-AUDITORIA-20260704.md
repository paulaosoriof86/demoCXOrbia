# Resumen para Claude addendum - Auditoria V85

Fecha: 2026-07-04

## Decision

El ZIP V85 recibido no contiene cambios de contenido contra V84. El hash del ZIP cambio, pero los archivos extraidos son identicos: 0 agregados, 0 eliminados, 0 modificados.

No se acepta V85 como source lock. Debe generarse V86 correctiva real.

## Evidencia

- Archivos app V84: 97.
- Archivos app V85: 97.
- Agregados: 0.
- Eliminados: 0.
- Modificados: 0.
- JS revisados: 61.
- Fallas JS: 0.
- Scripts faltantes: 0.
- Scripts duplicados: 0.

## P0 que deben corregirse con cambios reales

1. `modules/cuestionario-shopper.js`: cambiar `cuestionario enviado` por `cuestionario realizado/completado`.
2. `modules/postulaciones.js`: eliminar toasts `HR sincronizada`.
3. `modules/misvisitas.js`: eliminar promesas de sincronizacion HR/liquidacion automatica.
4. `modules/dashboard.js` y `modules/postulaciones.js`: cambiar `WhatsApp enviado` por fallback manual/copia/confirmacion manual.
5. `modules/academia.js`: corregir `Sincronia automatica`, `sincroniza la HR externa` y `mueve la liquidacion`.
6. `docs/ADDENDUM-V87-PHASE-A.md`: corregir versionado residual V87/Base V86 dentro de ZIP V85.

## Bloques backend que deben incorporarse

- Notification outbox: `notificationId`, `templateId`, `templateVersion`, `recipientRef`, `outboxStatus`, `manualFallbackStatus`.
- Email/user mailbox: `mailboxId`, `providerType`, `connectionStatus`, `canDraft`, `canLogManual`, `draft_ready_preview`, `manual_log_only`.
- Ficha dinamica: `formId`, `formVersion`, `fieldId`, sensibilidad y versionado.
- Assignment sync/conflicts: no dedupe visual, no duplicar, conflicto/revision manual.
- Visit lifecycle/reservas: `availableFrom`, franja, quincena, override, realizada, cuestionario completado.

## Instruccion para Claude

Generar V86 correctiva real sobre V85/V84. Debe entregar ZIP con cambios efectivos en archivos. No rediseño libre. No tocar backend protegido.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Firestore/Auth/Storage/Make/Gemini/WhatsApp/correo/pagos reales.
- Datos reales o sensibles.
