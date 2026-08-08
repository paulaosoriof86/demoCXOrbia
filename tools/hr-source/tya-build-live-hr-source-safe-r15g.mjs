#!/usr/bin/env node
/*
  Entrada de compatibilidad R15G.

  La implementación vigente usa el inventario source-safe de tabs verificado
  mediante Drive/Sheets metadata y consulta cada hoja por gid con GViz CSV.
  No usa XLSX público para leer datos y no consulta títulos inexistentes.
*/
await import('./tya-build-live-hr-source-safe-r20-inventory.mjs');
