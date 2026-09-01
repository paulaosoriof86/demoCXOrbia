# Academia — impacto Corte 6 stable composer root fix

**Fecha:** 2026-07-31  
**Estado:** root fix publicado en Hosting DEV y remote regression PASS; validación humana acumulativa pendiente.

## 1. Patrón reusable
Academia/manuales deben enseñar que la plataforma tiene un read model compuesto por fuentes con ownership explícito:
- HR viva: periodos, visitas y estados operativos;
- perfil protegido: identidad, credenciales y PII autorizada;
- finanzas/pagos: liquidaciones, beneficios, movimientos y pagos;
- Auth/RBAC: acceso, no fuente operativa.

Una capa nueva enriquece; no reemplaza la autoridad de otra fuente.

## 2. Idempotencia
Aplicar una actualización u overlay varias veces no puede duplicar registros ni cambiar conteos. El gate reusable exige tres reaplicaciones consecutivas con resultado idéntico antes de release.

En Corte6 el gate pasó localmente y también sobre el composer servido remotamente desde Hosting DEV.

## 3. Identidad
El Shopper se vincula por llaves técnicas exactas/crosswalk. No se enseña ni se permite conciliación automática por nombre, teléfono o email. Conflictos pasan a revisión.

## 4. Experiencia de usuario
La HR se actualiza en background. Si la revisión no cambió, la pantalla no debe rerenderizar. Si cambia, el sistema debe preservar periodo, filtros, scroll y foco; si existe modal/formulario activo, el rerender se difiere.

Esta conducta todavía requiere confirmación visual humana antes de congelar Corte6, aunque los adapters remotos ya coinciden exactamente con los sources aprobados.

## 5. Estados
Dashboard, Visitas, histórico y Shopper consumen la misma máquina canónica de estados. `cuestionario completado` y `submitido` siguen siendo estados separados.

## 6. Deploy seguro como parte del aprendizaje
El release gate debe enseñar la diferencia entre:
- `CODE PASS`;
- `LOCAL REGRESSION PASS`;
- `REMOTE SMOKE PASS`;
- `HUMAN VISUAL PASS`;
- `FROZEN/READY`.

Corte6 está actualmente en `REMOTE SMOKE PASS`; aún no es `FROZEN`.

El deploy autorizado ejecutó1 Hosting DEV y0 Cloud Run; no hubo Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes, merge ni producción.

## 7. Rutas por rol
- Admin/Coordinación: interpretar fuente vigente, revisión, conflicto e identidad canónica.
- Shopper: actualización de datos sin pérdida de contexto; mismo historial asociado a su identidad canónica.
- Superadmin: regression gate acumulativo antes de aprobar release.

## 8. Checklist para manuales futuros
Toda nueva etapa debe indicar:
1. qué añade;
2. qué fuente es autoridad;
3. qué contratos anteriores conserva;
4. cómo evita duplicación/reinterpretación;
5. evidencia del regression gate local y remoto;
6. qué validación humana falta o pasó;
7. conflictos que permanecen HOLD.

## 9. Estado seguro
No modifica UI desde Academia, no activa Make/Gemini, no ejecuta providers adicionales y no entra a producción.
