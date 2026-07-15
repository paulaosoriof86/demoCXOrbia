# CHECKPOINT ACUMULADO — BASELINE V131

Fecha de actualización: 2026-07-15

## Baseline viva

- Versión: V131.
- Estado: aceptada, empalmada y con hotfix R18D reconciliado.
- Runtime original: `d5c04054d445723dd0bc9e48acbab75953a4b08b`.
- Hotfix runtime: `593cdb9cc815cfa14d257968026bf3de886efba1`.
- Manifest: `docs/MANIFEST-V131-R18D-HOTFIX-R1.json`.
- Aggregate: `6e833331f5aa9ba9458ef0724756e72747352add3f8c6cc1fa327c96fadec348`.

## Bloques técnicos cerrados

### Plan Firestore source-safe

- PASS.
- 14 periodos, 616 visitas, 216 shoppers, 572 liquidaciones candidatas.
- 1,421 operaciones planificadas en 4 lotes.
- 0 writes, pagos inferidos o certificaciones inventadas.

### R18C

- PASS.
- 196 enlaces financieros exactos.
- 92 revisiones financieras y 1 shopper.
- R11D/R14C no recalculados.

### R18D

- `PASS_R18D_VISIBLE_OVERLAYS`.
- Finanzas, Shoppers y Certificación renderizan sin error técnico.
- Hotfix de Finanzas reconciliado y protegido.

### R18E Hosting DEV

- `PASS_HOSTING_DEV_V131_R18D_REMOTE_VERIFIED`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Build: `v131-r18d-source-safe-20260715-r18e`.
- Workflow `29442279729`.
- Sin producción, Firestore/Auth/Storage/HR writes, imports, Make, Gemini ni pagos.
- Autorización y workflows temporales retirados.

## R18E visual

Estado: **NO_GO_R18E_VISUAL_BUSINESS_SEMANTICS**.

La revisión de Paula confirmó que render y cero errores de consola no equivalen a funcionamiento correcto.

P0 confirmados:

1. KPI y detalle no coinciden (`Pend. realizar` 25 vs detalle 0).
2. Sin asignar y sin agendar están mal separados.
3. El periodo seleccionado no gobierna todos los módulos.
4. Visitas Disponibles y Postulaciones muestran datos de otros estados/periodos.
5. Falta periodo de medición/quincena en detalles.
6. Shoppers infiere 216 activos/completos desde referencias protegidas.
7. Shopper y cliente muestran periodo como proyecto y carecen de selector multiproyecto.
8. Configuración de proyecto/tenant/países/frecuencia/medición/HR no queda visible y verificable de forma consistente.
9. Dashboard Financiero mezcla análisis con creación y presenta datos no confirmados.
10. PWA Windows muestra instrucciones en vez del prompt nativo.

## Reglas confirmadas

- Pend. realizar = toda visita no realizada del periodo activo, aunque esté sin shopper o sin agenda.
- Shopper activo = cuenta activa + visita realizada en los seis meses previos a la referencia del periodo.
- Visitas Disponibles = postulables: sin shopper, no realizadas y del periodo activo.
- País agregado habilita bandera, moneda, filtros, alcance, shoppers y HR.
- Cinépolis = frecuencia mensual y medición quincenal; la HR define la quincena de cada visita.

## Paquete Claude

`cxorbia-claude-r19-cierre-operativo-visual-20260715`.

Incluye cinco P0, matriz de pruebas, evidencias y protocolo de empalme sin reproceso.

## Siguiente bloque exacto

`R19 — CLAUDE + AUDITORÍA DELTA + GATES SEMÁNTICOS + EMPALME + DEV + VALIDACIÓN VISUAL + FREEZE`.

Secuencia obligatoria:

1. Claude entrega candidata completa derivada de V131+R18D.
2. Auditoría delta focalizada; no repetir V131.
3. Gates semánticos de KPI/detalle, periodo, roles, configuración, finanzas y PWA.
4. Empalme atómico solo del delta validado.
5. Hosting DEV y smoke remoto.
6. Revisión visual de Paula por admin, shopper, cliente y PWA.
7. Solo con aprobación, marcar R19 `FROZEN` y continuar Phase A.

## No reprocesar

- V131/V110.
- HR, 14 periodos, 616 visitas y 216 referencias.
- Importadores.
- R11D/R14C.
- 196 enlaces y 92 revisiones.
- Hotfix R18D.

## Restricciones

Sin producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos reales sin autorización específica.
