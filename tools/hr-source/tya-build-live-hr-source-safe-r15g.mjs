#!/usr/bin/env node
/*
  Entrada de compatibilidad R15G.

  La implementación vigente vive en `tya-build-live-hr-source-safe-r20.mjs`
  y lee la HR multi-tab por Sheets API o por Google Visualization CSV por tab.
  No usa el XLSX público desactualizado como fuente operacional.
*/
await import('./tya-build-live-hr-source-safe-r20.mjs');
