# RESUMEN PARA CLAUDE — ADDENDUM V171b HOLD

Fecha: 2026-07-21
Estado: `CORRECTION_REQUIRED_BEFORE_EMPALME`

## Qué debe preservarse

V171b es una candidata acumulada amplia y contiene mejoras reales que no deben perderse:

- motor `CX.reportKit` reusable;
- PDF/XLSX/PPTX por múltiples roles;
- editor de columnas, notas, branding y gráficas;
- enfoque multiproyecto;
- Panorama separado conceptualmente entre operación y evaluación;
- add-ons por tenant/proyecto;
- geo-checkin honesto pendiente de backend/Storage;
- `mireportes` visible para Shopper;
- correcciones de router `super`, extensiones y facetas canónicas.

## Bloqueo único demostrado

La identidad Shopper todavía falla abierta en varios caminos:

1. `misvisitas.js` usa `shopperId || 'sh1'` y, si falta `visitsForShopper`, puede usar todas las visitas.
2. `reservas.js` usa `shopperId || 'sh1'`.
3. `midia.js` mezcla identidad con estados y puede mostrar visitas activas de otros shoppers.
4. `app.js` mantiene `sh1` sin un guard explícito que lo limite al modo demo.

La reproducción con el archivo real de V171b confirmó que una sesión Shopper sin identidad renderiza una visita ajena de `sh1`.

## Corrección pedida

Leer y cumplir:

`app/docs/PAQUETE-CORRECCION-CLAUDE-V171B-CORTE1B-20260721.md`

La corrección debe partir exactamente de V171b, tocar únicamente `app.js`, `misvisitas.js`, `reservas.js` y `midia.js` salvo P0 adicional demostrado, y devolver una candidata completa acumulada.

## Gates esenciales

- Shopper A ve solo A.
- Shopper B ve solo B.
- Sesión sin `shopperId` ve cero datos privados y no puede ejecutar acciones.
- Una visita agendada de B no aparece en Mi Día de A.
- Sin `visitsForShopper`, Mis Visitas queda vacío.
- Cero `sh1` ejecutable en live/real; cualquier seed demo queda bajo guard explícito.
- Las siete correcciones V170 y todas las mejoras V171b permanecen.

## No modificar

Backend, `CX.data`, adapters live, contratos, HR, Cloud Run, Hosting, IAM, producción, pagos, Make o Gemini.

## Flujo posterior

`CANDIDATA V171B CORREGIDA → AUDITORÍA FOCALIZADA → GO/APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`
