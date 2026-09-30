# RESUMEN PARA CLAUDE — C6 SKIP 13 perfiles Auth

**Fecha:** 2026-08-06  
**Estado backend:** `IDENTITY_HOLD_0_SOURCE_ONLY`

## Conectado

Los 13 perfiles que estaban HOLD fueron excluidos del repair Auth por decisión expresa de Paula. El plan source-safe pasa de:

```text
HOLD=13
PRESERVE_NO_AUTH=127
```

a:

```text
HOLD=0
PRESERVE_NO_AUTH=140
```

Se preservan las otras operaciones: `CREATE_AUTH=81`, `UPDATE_AUTH=46`, `NO_OP=73`.

## Frontend

No modificar módulos, pantallas, copy, navegación ni componentes por este bloque. No mostrar los 13 perfiles como error técnico ni como bloqueo visible. Si se desarrolla una vista administrativa futura, tratarlos como perfiles históricos sin acceso habilitado y con opción de reincorporación manual.

## Pendiente real

El bloqueo principal sigue siendo backend/HR viva:

- metadata provider actualmente no operativa;
- `autoDiscovery=false`;
- `AGOSTO 26` y `AGOSTO 26 HN` fueron detectadas y luego rechazadas por registry desactualizado;
- debe existir una sola `sourceRevision` para todos los módulos.

## Academia y manuales

Documentar la diferencia entre conservar identidad/historial y habilitar credenciales. No agregar instrucciones que impliquen hard delete de shopper histórico.
