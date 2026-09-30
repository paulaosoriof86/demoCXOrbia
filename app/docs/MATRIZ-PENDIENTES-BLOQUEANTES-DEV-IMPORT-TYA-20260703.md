# Matriz pendientes bloqueantes DEV import TyA

Fecha: 2026-07-03

## Objetivo

Identificar que impide pasar de preview seguro a una futura escritura DEV autorizada.

Esta matriz no autoriza escritura, importacion ni deploy.

## Estado actual

- Preview seguro: avanzado.
- Pipeline local seguro: preparado.
- Contrato DEV: bloqueado por diseno.
- Escritura DEV: no autorizada.
- Produccion: no preparada.

## Bloqueantes criticos

| ID | Bloqueante | Responsable | Estado | Accion necesaria |
|---|---|---|---|---|
| B01 | PII shoppers / DPI | Backend + Paula | Bloqueado | Definir politica de exclusion, cifrado o coleccion privada antes de importar shoppers. |
| B02 | questionnaire_marks duplicado | Backend/Data | Bloqueado | Resolver si se excluye o se deduplica contra postulations. |
| B03 | Encoding RTDB V7.1 | Data/Backend | Bloqueado | Corregir mojibake en staging o excluir esos textos del import. |
| B04 | Notificaciones sin destinatario resuelto | Backend/Data | Bloqueado | Mantener como historial hasta resolver mapeo de recipients. |
| B05 | Fila adicional JUNIO 26 HN | Paula + Backend | Bloqueado | Confirmar si se descarta o se corrige la fila extra. |
| B06 | Liquidaciones sin cruce financiero | Paula + Finanzas | Bloqueado | Cruzar contra archivo financiero autorizado antes de importar como final. |
| B07 | Reglas Firestore/Auth/Storage reales | Backend | Pendiente | Validar reglas multi-tenant antes de escritura DEV real. |
| B08 | Runner de escritura DEV | Backend | No creado | Crear runner separado solo con autorizacion explicita futura. |
| B09 | Rollback DEV probado | Backend | Pendiente | Probar rollback antes de cualquier staging/produccion. |
| B10 | Autorizacion Paula | Paula | Pendiente | Requerida antes de cualquier escritura DEV. |

## Pendientes para Claude

| ID | Pendiente frontend | Estado esperado |
|---|---|---|
| C01 | Mostrar HR Source sin URL completa | Debe implementarse en UI. |
| C02 | Mostrar estados honestos | Preview, warning, bloqueado, pendiente backend. |
| C03 | Mostrar contrato DEV como informativo | Sin acciones destructivas. |
| C04 | Mostrar matriz de gates por fase | DEV preview, DEV import, staging, produccion. |
| C05 | Liquidaciones como candidatas | No finales hasta cruce financiero. |

## Criterio para desbloquear escritura DEV futura

Para pasar a escritura DEV futura deben cumplirse todos:

- B01 resuelto.
- B02 resuelto.
- B03 resuelto o excluido.
- B04 resuelto o tratado como historial.
- B05 confirmado.
- B06 validado.
- B07 validado.
- B08 creado y auditado.
- B09 probado.
- B10 autorizado explicitamente.

## Estado seguro esperado

Hasta resolver lo anterior:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport=false.
- executeAllowed=false.
