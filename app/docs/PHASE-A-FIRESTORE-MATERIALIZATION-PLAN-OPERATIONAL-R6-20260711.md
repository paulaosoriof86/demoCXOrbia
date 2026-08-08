# Phase A TyA — plan operativo de materialización Firestore R6

Fecha: 2026-07-11  
Baseline backend: CXOrbia V103 Phase A R5 protegida.  
Baseline frontend: V104 en corrección por Claude; no se tocó.

## Objetivo operativo

Convertir los dominios source-safe ya validados en un plan determinístico de documentos Firestore para una base nueva y limpia, sin escribir todavía.

Este bloque no crea otra capa abstracta: toma la fuente real/sanitizada R5 y genera las operaciones exactas que, tras autorización y sobre una base limpia, formarían el primer material Phase A.

## Fuente recuperada

- tenant TyA;
- proyecto Cinépolis configurable;
- 14 periodos;
- 616 visitas;
- 213 shoppers protegidos;
- 572 liquidaciones candidatas hasta junio;
- control financiero y carryover en estado pendiente de fuente separada.

No se vuelve a leer ni reconstruir HR, periodos, shoppers o reglas Q1/Q2.

## Resultado real del dry-run

- plan: `phasea_e2f248c15355824a`;
- 1,418 operaciones `create`;
- 4 lotes técnicos: 400 + 400 + 400 + 218;
- 1 tenant;
- 1 proyecto;
- 1 registro de import HR;
- 14 periodos;
- 213 shoppers;
- 616 visitas;
- 572 liquidaciones;
- 0 pagos;
- 0 lotes de pago;
- 0 movimientos financieros;
- 0 certificaciones materializadas.

Los pagos y certificaciones permanecen bloqueados porque aún no existen los dos exports limpios separados. Una visita `liquidada` no se convierte en `pagada` y ningún ítem queda elegible para lote.

## Reglas operativas

- IDs y rutas determinísticos;
- `create` con precondición `exists=false`;
- no sobrescribir documentos existentes;
- máximo 400 operaciones por lote técnico;
- proyecto base `cinepolis` con periodos como subcolección, no proyectos sintéticos;
- llaves estables para visitas, shoppers y liquidaciones;
- sin campos DPI, banco, cuenta, correo, teléfono, dirección, tarjeta, tokens, secretos o API keys;
- no se materializa una certificación sin fuente revisada;
- no se materializa un pago sin fuente financiera confirmada.

## Compatibilidad

Las rutas planificadas coinciden con las colecciones ya previstas en `firestore.rules`: tenants, shoppers, projects, periods, hrImports, visits, liquidations, lots, finance, certifications y auditLogs.

No se cambiaron reglas Firestore ni se activó el bridge de `CX.data`. El connection point V78 continúa disabled hasta autorización separada.

## Validación

Resultado: PASS.

- 1,418 paths únicos;
- 0 duplicados;
- 0 campos sensibles;
- 0 pagos sin evidencia;
- 0 liquidaciones elegibles para lote;
- 616 enlaces visita-periodo válidos;
- 572 enlaces liquidación-visita válidos;
- 4 lotes dentro del límite;
- `writes=false`, `imported=false`, `production=false`.

## Próximo gate

Después de una candidata frontend aprobada y del smoke, el siguiente bloque backend podrá preparar un executor para Firebase Emulator o una base nueva vacía. No se aplicará el plan sobre la Firebase DEV no limpia ya detectada.
