# RESUMEN PARA CLAUDE — Addendum C6 perfiles HOLD y HR viva agosto

**Fecha:** 2026-08-06

## Backend conectado/preservado

- Baseline acumulativa única y todos los módulos Phase A permanecen preservados.
- El plan Auth tiene 340 filas y 13 HOLD: 12 por apellido sin fuente autoritativa y 1 por empate multi-Auth.
- No se permite inferir identidad, ejecutar parcialmente ni crear credenciales para esos HOLD sin decisión de Paula.

## Regla frontend obligatoria

La plataforma no puede presentar archivos estáticos, Firestore materializado o conteos históricos fijados como si fueran la HR viva.

Debe mostrar y consumir:

- `sourceRevision` común;
- fecha/hora de lectura real;
- estado `actualizando`, `listo` o `degradado` honesto;
- periodo actual descubierto desde la fuente;
- actualización del histórico cuando cambie cualquier fila antigua;
- último dato válido solo como fallback temporal claramente identificado.

No hardcodear agosto, 616 visitas, 14 periodos ni ninguna cifra HR.

## Hallazgo reproducible

El builder bruto encontró 30 tabs, 15 periodos y 684 visitas, pero el registry desactualizado rechazó `AGOSTO 26` y `AGOSTO 26 HN`, dejando 28 tabs, 14 periodos y 616 visitas. Esto es un P0 de autoridad de datos, no una ausencia real de agosto.

## Ajustes por módulo

- Dashboard, Histórico, Visitas, Shopper y Finanzas deben compartir una sola revisión viva.
- Selectores de periodo deben usar el mes actual disponible desde metadata provider, no una lista estática.
- Configuración debe permitir ver la fuente y el estado de sincronización, pero no editar conteos derivados de HR.
- Perfiles archivados sin Auth deben conservar historia y mostrarse como históricos/inactivos, no desaparecer.

## No tocar

No rediseñar módulos ni inventar datos. No crear otra candidata, rama, PR o shell. Los cambios frontend solo se ejecutan cuando exista una diferencia reproducible localizada.
