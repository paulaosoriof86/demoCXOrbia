# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-24  
**Estado:** `CORTE3_TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL`

## 1. Estado general

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V174.
- Sin Hosting nuevo, deploy productivo, merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.

## 2. Cortes cerrados

### V174 / M1 / Corte 1 / Corte 2A

- PASS técnico.
- Validación visual aprobada.
- 14 periodos, junio 2025–julio 2026.
- 616 visitas.
- 44 visitas por periodo: 34 GT y 10 HN.
- Proyecto y periodo separados.
- Ciclo Shopper y operación preservados.

No reabrir sin evidencia reproducible.

## 3. Corte activo — Corte 3 Finanzas

### Completado

- inventario de fuente financiera;
- conciliación con identidad estable;
- revisión humana del delta;
- snapshot financiero canónico source-safe;
- adapter único para Finanzas y Beneficios;
- pago fail-closed;
- entrada Backend DEV alineada con binding V174;
- gate remoto de Finanzas, Beneficios y export spec;
- runner read-only limpio y reproducible.

### Conteos canónicos

- 616 visitas HR;
- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos;
- 0 lotes.

### Evidencia UI/export PASS

- Target HEAD: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Resultado: `PASS_READONLY_POST_GATES`.

Mayo 2026:

- 44 visitas HR;
- 42 filas financieras exactas;
- 2 casos no exactos permanecen en revisión;
- 32 filas GT y 10 HN;
- 0 pagos;
- Finanzas y Beneficios consumen la misma verdad.

## 4. Bloques intermedios agregados y cerrados

1. Diagnóstico de entrada DEV source-safe.
2. Corrección de sintaxis del adapter generado R15G.
3. Gate sintáctico del código generado.
4. Estabilización Playwright frente a service worker/PWA.
5. Separación semántica de visitas HR y filas financieras exactas.
6. Evidencia del falso delta `.tmp/`.
7. Exclusión efímera local sin debilitar cambios rastreados.

Estos bloques eran necesarios para cerrar el gate remoto; no abren una metodología paralela.

## 5. Pendientes para congelar Corte 3

1. Autorización específica de Paula para Hosting DEV.
2. Publicar el mismo build aprobado técnicamente.
3. Ejecutar smoke remoto.
4. Validar visualmente Admin y Shopper.
5. Descargar/inspeccionar PDF real: gráfica y datos.
6. Descargar/inspeccionar Excel real: formato operativo y datos.
7. Corregir únicamente una diferencia reproducible, si existe.
8. Recibir `APROBADO`.
9. Congelar Corte 3.

## 6. Pendientes prototipo / Claude

- responsive parcial;
- gráfica del PDF real pendiente de inspección;
- formato operativo del Excel real;
- copy visible de `sourceAccessMode`;
- no hay una corrección nueva demostrada en `modules/finanzas.js` o `modules/beneficios.js`.

## 7. Pendientes Academia

- curso/manual por rol para conciliación financiera;
- diferencia visita/vínculo exacto;
- honorario, boleto, combo, total y moneda;
- revisión de vínculo y monto;
- liquidación vs pago;
- exportación PDF/Excel y checklist de contraste con UI;
- caso práctico 44 visitas / 42 vínculos / 2 revisiones;
- publicación únicamente después de revisión humana.

## 8. Siguiente bloque exacto

`AUTORIZACIÓN ESPECÍFICA DE HOSTING DEV → PUBLICAR EL MISMO BUILD → SMOKE REMOTO → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → FREEZE CORTE 3`.

Corte 4 no comienza antes del freeze.

## 9. Regla de cierre

Cada bloque debe indicar:

- qué se hizo;
- qué parte de Phase A avanzó;
- qué se preservó;
- qué se documentó para Claude y Academia;
- pendiente real;
- siguiente bloque exacto;
- estado seguro;
- bloqueo comprobado o ausencia de bloqueo.
