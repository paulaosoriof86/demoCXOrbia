# TRACKER PHASE A — materialización Firestore R6

## Completado

- Backend R5 protegido.
- V104 continúa en carril Claude/frontend.
- Plan determinístico Firestore construido contra la fuente R5 real/sanitizada.
- 1,418 operaciones divididas en 4 lotes.
- Tenant, proyecto, HR import, periodos, shoppers, visitas y liquidaciones listos para materialización futura.
- Pagos, lotes financieros y certificaciones bloqueados por falta de fuente separada.
- Validación de paths, seguridad, relaciones y estados: PASS.
- Fixture y workflow CI preparados.
- Workflow `CXOrbia Phase A Firestore Materialization Plan`: SUCCESS.

## Avance del plan de trabajo

Este bloque adelanta la creación de la base nueva y limpia sin tocar todavía Firebase. Ya no falta diseñar desde cero qué documentos se crearían ni cómo se partiría el lote inicial.

## En progreso

- Claude corrige V104.
- Recuperación de exports limpios de pagos y certificaciones.

## Pendiente backend

- preparar executor Emulator/DEV limpio con gate explícito;
- inspeccionar/crear una base realmente nueva y vacía;
- materializar solo después de smoke y autorización;
- conectar el punto único de `CX.data` después de validación.

## Gate

Plan local: PASS.  
Workflow CI: PASS.  
Drift/predeploy visual: HOLD controlado.  
Materialización: HOLD.  
Firebase writes: 0.  
Deploy/producción: HOLD.

## Siguiente bloque exacto

1. Esperar candidata corregida de Claude y auditar/empalmar.
2. Mientras tanto, preparar el executor para Firebase Emulator o base nueva limpia, pero mantenerlo hard-disabled.
3. No usar la Firebase DEV no limpia.
4. Cuando lleguen los exports, regenerar el mismo plan incluyendo pagos/certificaciones confirmados.
