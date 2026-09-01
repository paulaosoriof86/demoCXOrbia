# RESUMEN PARA CLAUDE — ADDENDUM I3 REQUEST08 LEGAL GATE — 2026-08-15

Addendum vigente de `app/docs/RESUMEN-PARA-CLAUDE.md` para el bloque I3 request08. No sustituye la fuente acumulativa; registra únicamente el delta nuevo.

## Qué quedó probado

- La rama viva sigue siendo `docs-tya-v6-v71-audit`, PR #7 draft/open/no merge.
- El Admin canónico autentica y alcanza el handoff necesario para navegar al subgate de Shoppers.
- El bloqueo request07 de `.cx-ov` desconocido quedó clasificado: request08 detectó un **gate legal/confidencialidad pendiente real antes de Alta**.
- El backend/harness se detuvo correctamente sin aceptar, firmar, guardar ni automatizar consentimiento.
- No se creó ni editó ningún Shopper nuevo; cero provider writes del subgate.
- El Shopper histórico permanece congelado y no debe tocarse.

## Qué NO debe corregir Claude por su cuenta

No eliminar, ocultar, deshabilitar globalmente ni saltarse el gate legal. No usar `force:true`, no convertir el NDA en banner informativo y no simular aceptación. Tampoco debe introducir secretos, Firestore writes directos, provider calls directos ni lógica backend en módulos UI.

## Ajuste frontend/prototipo que debe conservarse

La UX legal debe seguir siendo una acción humana explícita. Cuando exista el contrato backend durable:

- mostrar claramente versión/contenido legal aplicable;
- permitir aceptar solo mediante acción humana;
- mostrar éxito únicamente tras ACK durable del backend;
- si el ACK falla, mantener el gate pendiente y explicar el error;
- no convertir una aceptación local/demo en verdad productiva;
- no sobrescribir aceptaciones anteriores al publicar una nueva versión;
- no mezclar NDA con banners informativos como `#bnOk`.

## Backend reusable que Claude debe consumir, no reinventar

Se preparará un contrato reusable de aceptación legal durable con scope `tenantId`/proyecto cuando aplique, identidad exacta, rol, `legalContentId`, `legalVersion`, `acceptedAt`, `acceptanceMethod=human_ui` y auditoría. `pending(role)` deberá derivarse de un read model durable en runtime protegido.

Claude no debe hardcodear TyA/Cinépolis en el patrón reusable.

## Academia

Impacto pendiente por rol:

- manual de primer acceso: explicar el gate legal y que la aceptación es humana;
- guía de Administración: versionado del acuerdo sin invalidación silenciosa de aceptaciones previas;
- troubleshooting: qué significa “aceptación pendiente”, fallo de persistencia y reintento humano;
- rutas de Shopper/Admin: no marcar Academia/Certificación como PASS solo porque el usuario autenticó o aceptó NDA;
- notificación de nueva versión legal, si se implementa, debe requerir revisión humana y trazabilidad.

## Estado

GO-LIVE `35% completado / 65% pendiente`. I3 `0/25` hasta cierre integral.

Siguiente backend exacto: `I3_LEGAL_ACCEPTANCE_DURABLE_ACCOUNT_SCOPED_CONTRACT_AND_PRODUCTION_WIRING_SOURCE_ONLY`.
