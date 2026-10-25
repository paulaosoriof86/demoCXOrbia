# PENDIENTES PROTOTIPO — ADDENDUM R17N FINAL / HR ACTUAL

Fecha: 2026-07-30

## Backend ya resuelto

- Las 9 referencias shopper del snapshot viejo ya no son el pendiente vigente.
- La HR actual hasta julio contiene 208 refs, no 210.
- Crosswalk actual: 201 existing + 2 legacy-profile create + 5 HR-current create = 208/208 con target; 0 HOLD de identidad actual.
- R17N final no-execute: 1,406 writes potencialmente listos; 0 ejecutados.

## Pendientes reales que NO son tarea frontend

- autorización y materialización DEV exacta;
- relectura de identidad real para los 5 perfiles HR-only durante ejecución;
- tenant update sigue HOLD;
- 22 updates de perfiles existentes siguen HOLD por conflictos;
- 7 perfiles legacy conflictivos siguen HOLD;
- 1 certificación sigue HOLD;
- Agosto HN sigue HOLD;
- Auth/RBAC/sync/evidencias/provider gates posteriores.

## Pendiente frontend

Ninguno bloqueante ahora. No nueva candidata.

Después del write + smoke, validar solamente:
- Admin/Operativo ve identidad real autorizada y no hash/`Shopper protegido`;
- Shopper ve su identidad/perfil e historial permitido;
- no aparecen duplicados por coexistencia de referencia HR y perfil;
- certificación carryover aparece en la persona correcta;
- no se rompe proyecto padre `cinepolis` → periodos → visitas.

## Backlog P1/P2 preservado

- PDF: gráfica ausente en impresión/exportación;
- Excel: formato básico;
- `reportKit` transversal;
- copy específico de fuentes/readiness.

## Estado seguro

Sin writes, deploy, merge ni producción en este bloque.
