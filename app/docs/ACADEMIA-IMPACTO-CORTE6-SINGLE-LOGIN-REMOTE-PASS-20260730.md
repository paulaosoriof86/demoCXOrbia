# Academia — impacto Corte 6 · acceso, source-safe, identidad y fuente operacional

**Fecha:** 2026-07-30  
**Estado:** `IDENTITY_PROTECTED_PASS__AUGUST_SOURCE_FAIL_CLOSED`

## Criterio reusable de acceso
La validación humana demostró que Firebase/Auth no debe transformarse en pasos visibles añadidos al prototipo. Para el preview humano DEV, el flujo correcto es perfil → entrada automática.

## Source-safe no equivale a identidad final
La HR source-safe enmascara PII y puede mostrar `Shopper protegido`. El runtime protegido usa Auth/RBAC/Rules + Firestore: Admin/Operativo recibe la identidad necesaria; shopper solo la propia; cliente solo su alcance.

Gate protegido PASS: shoppers340/340 con nombre real, visitas616/616 con nombre real, placeholders0, perfiles referenciados194/194, Rules/adapter PASS.

## Nueva lección reusable — fuente operacional contradictoria
El refresh de agosto mostró dos contradicciones que deben fallar cerrado:
- pestaña `AGOSTO 26 HN`:34 filas cuyo campo país es GT; no se pueden convertir a HN solo por el nombre de la pestaña;
- `AGOSTO 26` GT:34 filas ya aparecen assigned/scheduled/realized, con27 submitidas y7 en cuestionario; no se pueden convertir en “disponibles” solo porque el negocio necesita publicar agosto.

El backend debe distinguir **dato técnicamente legible** de **dato operacionalmente publicable**. El delta GT está técnicamente identificable (34 nuevas, mapping28/28), pero su `releaseReadiness` es `NO_UNASSIGNED_VISITS_IN_ACCEPTED_SOURCE`.

## Patrón de seguridad/release reusable
- source-safe minimiza PII;
- protected runtime aplica scopes reales;
- discrepancia país↔pestaña o estado↔intención de negocio va a HOLD;
- nunca corregir por inferencia visual, nombre de tab o conveniencia de release;
- una fuente corregida se revalida antes de generar write plan;
- write exacto siempre requiere autorización y readback.

## Contenido para manuales/cursos
- UX DEV vs Auth real;
- privacidad por capa;
- identidad protegida y mínimo privilegio;
- fuente operacional vs artefacto source-safe;
- data-quality gates país/estado/periodo;
- troubleshooting por UI, fuente, identidad, credencial y scope;
- conflictos a revisión humana, no overwrite silencioso.

## Siguiente actualización
Después de corregir la HR de agosto, repetir refresh/delta; luego write autorizado, preprod autenticada y validación final de identidad/operación antes de cutover.