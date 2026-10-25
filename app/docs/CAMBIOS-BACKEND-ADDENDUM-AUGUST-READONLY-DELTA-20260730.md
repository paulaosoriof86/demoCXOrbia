# CAMBIOS-BACKEND — addendum Agosto · corrección de causa raíz del refresh HR

**Fecha:** 2026-07-30  
**Estado:** `AUGUST_PROVIDER_TABS_MISSING_CONFIRMED__GVIZ_PHANTOM_REJECTED__NO_WRITES`

## Corrección de evidencia anterior
La lectura inicial por Google Visualization CSV aparentó devolver `AGOSTO 26` y `AGOSTO 26 HN`. Esa conclusión quedó **superseded** al leer directamente la metadata real del Google Sheet: el archivo `HR Guatemala - Sincronizacion Google Sheets` solo tiene tabs mensuales hasta `JULIO 26` / `JULIO 26 HN`; no existen todavía `AGOSTO 26` ni `AGOSTO 26 HN`.

Causa raíz: cuando se consulta por GViz un nombre de pestaña inexistente, el fallback puede devolver contenido de otra hoja en vez de fallar. Por eso aparecieron falsamente 34 filas GT en agosto y una falsa inconsistencia HN.

## Fix reusable aplicado
- Se creó `backend/config/tya-live-hr-tab-registry.source-safe.json` desde metadata provider read-only.
- Se creó `tools/hr-source/tya-enforce-live-tab-registry.mjs`.
- El workflow vivo ahora rechaza cualquier tab devuelta por GViz que no exista en el registro observado del provider.
- El planner de agosto verifica existencia del tab **antes** de interpretar filas, país, estado o shopper mapping.
- No se inventan meses futuros ni se acepta fallback silencioso.

## Re-read final
Después del fix:
- periodos reales detectados:14;
- tabs mensuales reales:28;
- visitas:616;
- último periodo real:2026-07;
- agosto real detectado: GT0/HN0;
- tabs fantasma rechazados: `AGOSTO 26`, `AGOSTO 26 HN`.

Planner final:
`HOLD_AUGUST_REQUIRED_PROVIDER_TABS_MISSING` / `SOURCE_TABS_MISSING`.

- `AGOSTO 26`: no existe;
- `AGOSTO 26 HN`: no existe;
- periodo2026-08 en Firestore: no existe;
- candidatos delta:0;
- writes planificados:0.

La evidencia anterior de “GT34 técnicamente listo / HN34 marcado GT” no debe volver a usarse para decisiones porque provenía del fallback GViz sobre tabs inexistentes.

## Identidad protegida preservada
El hallazgo `Shopper protegido` continúa resuelto por separación de capas: source-safe público enmascara PII, mientras Firestore protegido tiene shoppers340/340 con nombre real y visitas616/616 con identidad real, placeholders0.

## Bloqueo real actual
No hay un lote de agosto en la HR viva. Para publicar agosto debe existir una fuente autorizada con las visitas reales de `AGOSTO 26` y `AGOSTO 26 HN` (contrato operativo esperado GT34/HN10 o el corte real autorizado), antes de generar cualquier delta.

No corresponde copiar julio, fabricar 44 visitas, relabelar datos ni escribir Firestore sin esa fuente.

## Seguridad
Todo este bloque fue read-only contra Google Drive/Sheets y Firestore, más cambios de repo/docs/gates. HR writes0; Firestore writes0; Auth writes0; Rules0; Hosting0; producción=false; merge=false; PII exportada0.

## Siguiente bloque exacto
`FUENTE AUTORIZADA DE AGOSTO DISPONIBLE EN HR → REFRESH METADATA + SOURCE-SAFE → VALIDAR GT/HN/ESTADOS → DELTA PLAN EXACTO → AUTORIZACIÓN WRITE SOLO DELTA`.

No se solicita PowerShell ni Firebase Console.