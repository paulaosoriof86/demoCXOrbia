# PENDIENTES PROTOTIPO — ADDENDUM CORTE 4 AUTH / REVALIDACIÓN

Fecha: 2026-07-29

## No pendiente de prototipo

La inicialización de Firebase Authentication ya quedó completada y revalidada. No requiere nueva candidata de Claude ni cambio UI.

## Pendiente técnico vivo

Ejecutar el smoke protegido de `CX.data` contra el Firebase nuevo y vacío bajo las Rules actuales.

Bloqueo exacto: Rules requieren operador autenticado, mientras el Firebase nuevo conserva 0 usuarios y 0 proveedores habilitados. Crear un principal temporal o habilitar Email/Password requiere autorización específica; no se hace por inferencia.

## Criterio de aceptación del smoke

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- interfaz pública `CX.data` preservada;
- readOnly=true / writeMode=disabled;
- Firestore document writes=0;
- usuario temporal eliminado al final;
- proveedor temporal deshabilitado al final;
- Auth users vuelve a 0.

## Pendientes visuales previos no bloqueantes

PDF sin gráfica, Excel con formato básico, reportKit transversal y copy permanecen P1/P2 y no reabren Corte 3 ni bloquean este gate.
