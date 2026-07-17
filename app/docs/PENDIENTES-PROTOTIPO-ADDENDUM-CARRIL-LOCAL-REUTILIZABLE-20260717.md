# Pendientes prototipo — carril local reutilizable

Fecha: 2026-07-17

## Pendiente inmediato

1. Sincronizar el checkout local de `demoCXOrbia` con la rama `docs-tya-v6-v71-audit`.
2. Colocar el ZIP V156 y su plan auditado en `incoming/`.
3. Ejecutar el carril local.
4. Verificar commit/push, manifest, build-lock y registro.
5. Ejecutar gates TyA source-safe y validación visual.

## Regla multi-proyecto

Cinépolis puede tener validaciones propias, pero no debe convertirse en proyecto por defecto ni en lógica global. Cada nuevo proyecto TyA debe crearse desde configuración y cada nuevo tenant debe reutilizar el motor con su propia política.

## Pendientes P1/P2

Los pendientes de frontend se conservan por módulo y se atienden sobre la última baseline auditada. No bloquean el empalme salvo P0 demostrado.

## Estado seguro

V156 sigue `AUDITED_GO_READY_DIRECT_APPLY`; no está empalmada hasta completar la ejecución local verificable.
