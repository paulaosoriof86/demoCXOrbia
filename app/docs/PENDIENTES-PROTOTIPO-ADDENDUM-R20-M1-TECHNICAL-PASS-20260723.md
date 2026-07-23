# PENDIENTES PROTOTIPO — ADDENDUM R20/M1

**Fecha:** 2026-07-23

## Cerrado técnicamente

- Builder R20 usa variantes canónicas del contrato.
- Inventario de 14 periodos, 28 tabs y 616 visitas verificado.
- Proyecto, periodo, KPIs e histórico pasan en navegador.
- M1 regression lock pasa.
- Corte 2A canonical pasa.
- Lectura viva in-place pasa sin reload.
- Reportes frontend runtime pasan.

## Pendiente técnico inmediato

1. Regenerar manifest/build-lock después de la documentación viva.
2. Reejecutar el perfil read-only completo contra el lock final.
3. Confirmar verificador V174 PASS.
4. Actualizar PR #7 a `TECHNICAL_PASS_PENDING_VISUAL`.

Este pendiente es de source lock; no es una regresión de HR, visitas o frontend.

## Pendiente para cierre Phase A

Después del PASS técnico final:

1. autorización separada de Hosting DEV;
2. build/deploy Hosting DEV exacto y controlado;
3. smoke remoto con `fresh=1`;
4. verificación de una única `sourceRevision` en Dashboard, Visitas, Liquidaciones y Reportes;
5. validación visual Admin, Cliente y Shopper;
6. corrección solo de P0 reproducible;
7. freeze Phase A;
8. checklist y autorización de cutover de producción.

## Validación visual focalizada

### Admin/Operativo

- selector proyecto/periodo;
- 44 visitas julio y desglose GT/HN;
- estados de Visitas coherentes con HR;
- Reportes PDF/XLSX/PPTX con mismo alcance;
- Liquidaciones sin pagos inferidos;
- estado `ready`, no `degraded` sin causa real.

### Cliente

- MAY/JUN/JUL cambian realmente;
- Dashboard/Panorama/Reportes coinciden;
- métricas sin fuente aparecen como pendientes, no inventadas;
- branding y exportaciones con mismo periodo/alcance.

### Shopper

- Mis Visitas, Reservas y Mi Día aislados por identidad;
- disponibles se retiran al asignarse en HR;
- sesión sin identidad ve cero datos privados;
- reportes y postulaciones no abren datos globales.

## P1/P2 no bloqueantes preservados

- revisión visual de branding final en exportaciones;
- logo gráfico real en PPT;
- copy/encoding histórico menor;
- incorporación curricular en Academia;
- mejoras visuales que no impidan operación Phase A.

## No pedir a Claude ahora

- nueva candidata;
- cambios al builder/contrato HR;
- cambios a `CX.data`;
- workflows o scripts Git;
- hardcodes de 14/28/616/44;
- cambios en live refresh ya validado.

## Estado seguro

Sin Hosting DEV nuevo, producción, merge, imports, writes reales, Make/Gemini ni pagos.
