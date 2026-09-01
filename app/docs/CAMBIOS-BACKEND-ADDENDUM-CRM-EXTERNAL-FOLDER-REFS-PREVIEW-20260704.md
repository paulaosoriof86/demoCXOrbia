# Cambios backend addendum - CRM external folder refs preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de CRM external folder refs, usando email/user mailbox, notification outbox y politica de datos sensibles como gates previos.

## Archivos creados

1. `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para entidades CRM y referencias a carpetas externas sin abrir proveedores ni procesar documentos.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de CRM external folder refs.

2. `tools/migration/tya-crm-external-folder-refs-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con entidades CRM y folder refs.
   - Por que: permite clasificar CRM entity lista, folder ref lista, provider pendiente, permission review, private link bloqueado y contenido sensible bloqueado.

3. `app/docs/CRM-EXTERNAL-FOLDER-REFS-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists y glosario para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin proveedor externo real.
- Sin OAuth.
- Sin Make real.
- Sin Gemini real.
- Sin lectura documental.
- Sin datos sensibles.

## Phase A que avanza

- CRM queda conectado conceptualmente a referencias documentales sin proveedor real.
- Las referencias externas se manejan como `externalFolderRef`, no como URL privada.
- No se abre OneDrive/SharePoint/Google Drive desde preview.
- No se guardan links firmados, tokens, secretos, cuerpos o adjuntos.
- Se separan vistas admin/ops/finance/shopper/client.
- Cliente queda como read-only summary, no acceso a documentos internos.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado para entidades CRM y folder refs.
2. Integrar este validator en una secuencia local segura.
3. Crear preview validator de shopper communication history.
4. Relacionar CRM folder refs con email/manual logs, notification outbox, postulaciones, visitas, liquidaciones y Academia sin activar proveedores.
5. Preparar payload draft de proveedor externo sin activar OAuth/API.

## Pendientes prototipo/Claude derivados

1. CRM/documentos no debe decir carpeta creada, conectada o sincronizada si gate esta apagado.
2. Mostrar estados: ref preview, provider pending, permission review, blocked private link, manual review.
3. No exponer URL privada, link firmado, contenido de documentos ni adjuntos.
4. Vincular carpetas a entidad estable, no por nombre visual.
5. Separar vista interna admin/ops/finance de vista cliente read-only.

## Impacto Academia

Se creo documento especifico para Academia sobre CRM folder refs, provider pending, privacidad documental, permission review, checklists y glosario.

## Siguiente bloque recomendado

Preview validator de shopper communication history, usando CRM folder refs, email/mailbox, notification outbox y politica de datos sensibles como gates previos.
