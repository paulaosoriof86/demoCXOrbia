# CXOrbia TyA — Corte 3 canonical finance UI/export R23 technical PASS

**Fecha:** 2026-07-24  
**Estado:** `TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Decisión

El gate remoto read-only del carril exacto de Corte 3 terminó en **PASS**.

- Perfil: `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Target HEAD validado: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Resultado observable: `cxorbia/readonly-post-gates/overall = success`.

Corte 3 aún no queda congelado porque faltan Hosting DEV autorizado, revisión visual remota de Paula y comprobación visual de los archivos PDF/Excel reales.

## 2. Evidencia funcional aprobada

El mismo carril confirmó:

- 14 periodos y 616 visitas HR source-safe disponibles;
- 44 visitas HR en mayo de 2026;
- 42 filas financieras de mayo vinculadas exactamente por identidad;
- las 2 visitas restantes no se fabrican como liquidaciones: permanecen en las colas de revisión;
- 209 vínculos exactos globales;
- 207 montos canónicos listos;
- 2 vínculos exactos en revisión de monto;
- 79 entradas de revisión de vínculo;
- 37 evidencias candidatas de ledger;
- 0 pagos confirmados;
- 0 lotes importados;
- 0 diferencias entre honorario, boleto, combo y total del snapshot y lo consumido por UI;
- `visitContract()` mantiene `paymentState=pending_source_confirmation` y `paymentConfirmed=false`;
- Finanzas consume 42/42 filas canónicas del periodo;
- Finanzas distribuye 32 filas GT y 10 HN;
- la especificación de reporte contiene 2 países, 8 columnas y 2 puntos de gráfica;
- Beneficios muestra los cuatro KPI canónicos: honorarios, reembolsos, por cobrar y pagado;
- el shopper de prueba controlada ve 3 liquidaciones y 0 pagadas.

## 3. Diagnóstico de causa raíz y correcciones focalizadas

No se aceptaron reintentos ciegos. Cada fallo se detuvo y se localizó:

1. **Entrada DEV incompleta:** `app/index-backend-dev.html` no reconstruía el binding source-safe V174 completo antes del adapter financiero. Se restauró el orden de carga correcto sin modificar módulos.
2. **Generador R15G inválido:** una expresión regular terminaba en el punto y coma interno del mensaje `210/213; 3 referencias...` y dejaba JavaScript inválido. Se corrigió para tomar la asignación completa y se agregó compilación sintáctica obligatoria del adapter generado.
3. **Recarga PWA en navegador de gate:** el service worker podía destruir el contexto de Playwright. El gate ahora bloquea service workers y conserva una sesión estable.
4. **Expectativa semántica incorrecta:** 44 visitas HR no equivalen a 44 filas financieras exactas. El gate separa inventario operativo de filas financieras canónicas y conserva los casos no exactos en revisión.
5. **Falso delta del repositorio:** el runner interpretaba `.tmp/` —evidencia efímera generada por el propio gate— como modificación del repo. Se identificó con evidencia explícita y se excluyó únicamente `.tmp/` mediante `.git/info/exclude`; el control de cambios rastreados permanece intacto.

## 4. Exportaciones

El gate prueba que la especificación del reporte financiero está conectada a la misma verdad canónica y contiene filas, columnas, gráfica y nombre PDF.

Pendientes visuales no bloqueantes:

- verificar que el PDF real renderice la gráfica correctamente;
- verificar formato operativo del Excel real;
- realizar la comprobación sobre Hosting DEV del mismo build.

No se declara que estos pendientes estén resueltos.

## 5. Archivos funcionales y de gate involucrados

- `app/index-backend-dev.html`;
- `app/adapters/tya-financial-canonical-source-safe-adapter.js`;
- `app/data/tya-financial-canonical-source-safe*.js`;
- `tools/release/tya-source-safe-binding-build-r15g.mjs`;
- `tools/qa/tya-corte3-canonical-finance-ui-export-r23-gate.mjs`;
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`;
- `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `.github/cxorbia-gate-requests/request.json`.

No se modificaron `app/modules/**`, `app/core/**` ni `app/index.html` para resolver este bloque.

## 6. Impacto Phase A

Avanza Corte 3 desde snapshot/adapter aplicado a **consumo UI y especificación de exportación técnicamente comprobados**.

No activa Corte 4. El orden obligatorio continúa:

`TECHNICAL PASS → HOSTING DEV AUTORIZADO → SMOKE REMOTO → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI EXISTE DIFERENCIA → FREEZE CORTE 3`.

## 7. Clasificación

- **Reusable CXOrbia:** separación entre inventario operativo y filas financieras exactas; pagos fail-closed; colas de revisión; gate de UI/export; exclusión efímera sin debilitar el control de archivos rastreados.
- **Exclusivo cliente:** conteos y conciliación TyA/Cinépolis.
- **Claude/prototipo:** no hay corrección de módulos demostrada por este gate. Permanecen P1/P2 de PDF, Excel, responsive y etiqueta visible de fuente.
- **Academia:** debe explicar inventario de visita, conciliación exacta, revisión, liquidación, pago, honorario, boleto, combo y exportaciones como conceptos diferentes.
- **Sin impacto Claude:** runner, sintaxis del generador, service-worker block del gate y evidencia efímera `.tmp/`.

## 8. Estado seguro

Sin merge, Hosting nuevo, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
