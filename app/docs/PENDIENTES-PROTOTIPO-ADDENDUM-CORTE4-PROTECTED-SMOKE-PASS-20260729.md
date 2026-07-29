# PENDIENTES PROTOTIPO — ADDENDUM CORTE 4 PROTECTED SMOKE PASS

**Fecha:** 2026-07-29

## No pendiente / cerrado

- No existe P0 demostrado de frontend por el protected smoke.
- `CX.data` alcanzó Firestore como fuente real en modo read-only y backend vacío sin fallback.
- El principal Auth temporal fue limpiado y el proveedor Email/Password quedó nuevamente deshabilitado.
- No se requiere nueva candidata de Claude.

## Pendiente vivo de Corte 4

1. autorización separada de Hosting DEV para exponer el mismo build read-only;
2. validación visual real;
3. corregir únicamente un P0 reproducible si aparece durante esa validación;
4. freeze Corte 4;
5. retirar IAM temporal elevado y dejar runner nuevamente en Viewer.

## Backlog P1/P2 transversal que no bloquea Corte 4

Se conserva sin reabrir Corte 3:

- PDF sin gráfica visible en algunos reportes;
- Excel con formato básico;
- reportKit transversal;
- copy/labels de fuente donde corresponda.

## Regla de no regresión

No convertir el falso negativo del publicador del smoke en tarea frontend. La ejecución válida de `b698a925f5f6a7c8405afb7fb54a9f4c551e8498` comprobó `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true` y cleanup final seguro; la corrección de reporting quedó en `9967146e112322efcd043155ae05351bbbbd4e8a` sin rerun.
