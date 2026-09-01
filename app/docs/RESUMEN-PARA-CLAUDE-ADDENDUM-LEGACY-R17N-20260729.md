# RESUMEN PARA CLAUDE — ADDENDUM LEGACY REFRESH / R17N

Fecha: 2026-07-29

No abrir nueva candidata ni modificar frontend por este bloque.

## Backend confirmado
- `cxorbia-backend-dev` continúa siendo DEV canónico.
- Legacy `tya-plataforma` solo aporta shoppers/certificaciones útiles; Hosting público se preserva para cutover final.
- Refresh read-only legacy: PASS, zero writes.
- 149 shoppers legacy únicos, 78 certificaciones útiles.
- R17N no-execute e idempotencia: PASS.

## Regla de producto para frontend/adapter
Distinguir conceptualmente:
1. perfil de shopper;
2. referencia de asignación proveniente de HR;
3. identidad Auth;
4. certificación histórica.
No asumir que compartir nombre equivale a misma identidad. No mostrar duplicados como perfiles independientes si una futura capa de resolución usa referencias internas.

## Pendiente de backend antes de cualquier impacto UI
Resolver las 210 referencias protegidas HR mediante evidencia estable. Stable HR ID/code contra shoppers existentes dio 0 matches; siguiente opción es crosswalk por identidad exacta de visita, no por nombre.

## Academia/manuales
Cuando corresponda, explicar que una referencia HR puede existir antes de estar vinculada a un perfil canónico y que los conflictos requieren revisión; no presentar esa situación como error del shopper.

## Sin cambio frontend ahora
Corte 3/V182 permanece FROZEN. No P0 nuevo de UI. PDF/Excel siguen P1/P2 ya documentados y no se reabren por este bloque.
