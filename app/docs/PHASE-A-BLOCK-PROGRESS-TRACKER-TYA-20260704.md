# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-24  
**Estado:** `CORTE3_HOSTING_DEV_REMOTE_LIVE_SMOKE_PASS_PENDING_PAULA_VISUAL`

## 1. Estado general

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V174.
- Hosting DEV: publicado.
- Sin deploy productivo, merge, producción, import real, Firestore/Auth/Storage/HR writes, Cloud Run deploy, Make/Gemini live ni pagos.

## 2. Cortes cerrados

### V174 / M1 / Corte 1 / Corte 2A

- PASS técnico.
- Validación visual aprobada.
- 14 periodos, junio 2025–julio 2026.
- 616 visitas.
- 44 visitas por periodo: 34 GT y 10 HN.
- Proyecto y periodo separados.
- Ciclo Shopper y operación preservados.
- Gate R24 confirma 0 drift funcional prohibido.

No reabrir sin evidencia reproducible.

## 3. Corte activo — Corte 3 Finanzas

### Completado

- inventario de fuente financiera;
- conciliación con identidad estable;
- revisión humana del delta;
- snapshot financiero canónico source-safe;
- adapter único para Finanzas y Beneficios;
- pago fail-closed;
- gate técnico UI/export R23;
- overlay live HR + finanzas;
- Hosting DEV;
- build-lock remoto;
- endpoint HR remoto;
- smoke remoto live R25;
- evidencia de Admin, Shopper y export spec.

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

### Mayo 2026 remoto

- 44 visitas HR;
- 42 filas financieras exactas;
- 2 revisiones fail-closed;
- 32 exactas GT y 10 HN;
- 0 diferencias de monto;
- 0 pagos;
- Finanzas y Beneficios consumen la misma verdad.

## 4. Evidencia principal

### Gate técnico R23

- run `30074835544`;
- job `89423207982`;
- artifact `8589444193`;
- digest `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`;
- PASS.

### Hosting DEV

- run `30098823043`;
- job `89499452079`;
- artifact `8598747476`;
- digest `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`;
- deploy success.

### Smoke remoto live R25

- request commit `cf86e115dde490fbb8c1d407482413411c9079e8`;
- run `30099476156`;
- job `89501621499`;
- artifact `8598990578`;
- digest `sha256:09c69c975a0933368b346d27218386b28421616adc039f3a37caf16ca8bbba12`;
- PASS;
- no redeploy.

## 5. Bloques intermedios agregados y cerrados

1. Binding V174 en entrada DEV.
2. Sintaxis del generador R15G.
3. Service worker bloqueado en gates.
4. Separación visita HR / fila financiera exacta.
5. Evidencia efímera `.tmp/` separada del repo.
6. Verificador V174 full-app obsoleto reemplazado por gate R24.
7. Snapshot congelado diferenciado del runtime live.
8. Gate R25 para 42 exactas + 2 revisiones fail-closed.
9. Modo smoke-only para evitar redeploy innecesario.

Estos bloques fueron necesarios para cerrar el mismo objetivo; no abren metodología paralela.

## 6. Pendientes para congelar Corte 3

1. Validar visualmente Admin → Finanzas.
2. Validar las dos filas pendientes de fuente financiera.
3. Descargar/inspeccionar PDF real, incluida gráfica.
4. Descargar/inspeccionar Excel real y formato operativo.
5. Validar Shopper → Beneficios y pagado en cero.
6. Revisar responsive y copy de fuente.
7. Corregir solo una diferencia reproducible, si existe.
8. Recibir `APROBADO`.
9. Congelar Corte 3.

## 7. Pendientes prototipo / Claude

- responsive parcial;
- gráfica del PDF real pendiente de inspección;
- formato operativo del Excel real;
- copy visible de `sourceAccessMode`;
- no hay corrección nueva demostrada en `modules/finanzas.js` o `modules/beneficios.js`.

## 8. Pendientes Academia

- inventario HR vs fila exacta;
- fila en revisión fail-closed;
- honorario, boleto, combo, total y moneda;
- liquidación vs pago;
- snapshot congelado vs runtime live;
- Hosting DEV vs producción;
- checklist UI/PDF/Excel.

## 9. Siguiente bloque exacto

`VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → REVALIDACIÓN PUNTUAL → APROBADO → FREEZE CORTE 3`.

Corte 4 no comienza antes del freeze.

## 10. Regla de cierre

Cada bloque debe indicar qué se hizo, avance Phase A, preservación, documentación Claude/Academia, pendiente real, siguiente bloque, estado seguro y bloqueo comprobado o ausencia de bloqueo.
