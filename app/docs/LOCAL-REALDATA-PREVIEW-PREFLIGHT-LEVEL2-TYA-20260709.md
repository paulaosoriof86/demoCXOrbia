# Local real-data preview preflight Level 2 TyA

Fecha: 2026-07-09  
Bloque: preflight local actualizado con Level 2  
Estado: actualizado, no conectado, seguro.

## 1. Objetivo

Actualizar el preflight local para que, cuando exista Level 1, genere y valide automaticamente Level 2 operacional sanitizado.

Este bloque reduce pasos manuales y mantiene el enfoque en Phase A con informacion real/sanitizada de TyA.

## 2. Archivo actualizado

- `tools/contracts/tya-local-realdata-preview-preflight.mjs`

## 3. Que agrega

El preflight ahora incluye:

1. Locator de outputs Level 1.
2. Generador Level 0.
3. Validador Level 0.
4. Generador Level 1 si existe `--input`.
5. Validador Level 1.
6. Generador Level 2 si existe Level 1.
7. Validador Level 2.
8. Validador bridge real-data preview.
9. Validador runtime switch gate.
10. Validador rollback/smoke.

## 4. Inputs nuevos opcionales

Ademas de `--input`, ahora acepta:

```bash
--shoppers C:/ruta/local/shoppers-sanitizados.json
--certifications C:/ruta/local/certificaciones-sanitizadas.json
--liquidations C:/ruta/local/liquidaciones-sanitizadas.json
```

Si no se entregan, Level 2 puede generar:

- shoppers opacos desde `shopperRef`;
- certificaciones en `pending_mapping_review`;
- liquidaciones candidatas/control de pago desde visitas.

## 5. Comando base

Sin input:

```bash
node tools/contracts/tya-local-realdata-preview-preflight.mjs
```

Con output HR sanitizado:

```bash
node tools/contracts/tya-local-realdata-preview-preflight.mjs --input .tmp/tya-hr-source-private-full-flow/report.json
```

Con outputs adicionales sanitizados:

```bash
node tools/contracts/tya-local-realdata-preview-preflight.mjs --input .tmp/tya-hr-source-private-full-flow/report.json --shoppers C:/ruta/local/shoppers-sanitizados.json --certifications C:/ruta/local/certificaciones-sanitizadas.json --liquidations C:/ruta/local/liquidaciones-sanitizadas.json
```

## 6. Salidas nuevas

El reporte ahora indica si existen payloads:

- Level 0;
- Level 1;
- Level 2.

Y produce, si aplica:

- `.tmp/tya-local-realdata-preview-preflight/level2/tya-minimal-sanitized-input-level2.json`
- `.tmp/tya-local-realdata-preview-preflight/validations/level2/level2-sanitized-operational-report.json`
- `.tmp/tya-local-realdata-preview-preflight/validations/level2/level2-sanitized-operational-report.md`

## 7. Impacto real en Phase A / produccion

Este bloque deja lista una ruta unica para validar localmente:

- proyecto/periodos;
- visitas sanitizadas;
- shoppers opacos/sanitizados;
- certificaciones preservadas;
- liquidaciones como control;
- bridge;
- runtime switch gate;
- rollback/smoke.

No conecta runtime ni autoriza produccion.

## 8. Trabajo previo recuperado

Recupera:

- HR viva multi-tab;
- outputs locales esperados;
- Level 0;
- Level 1;
- Level 2;
- bridge real-data preview;
- runtime switch gate;
- rollback/smoke checklist;
- reglas de no PII/no base vieja.

## 9. Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 0, Level 1 y Level 2.
- Level 2 sigue siendo preview, no import real.
- Certificaciones preservadas deben mostrarse sin forzar retoma.
- Liquidaciones deben mostrarse como control, no pagadas.
- Academia debe explicar niveles, sanitizacion, certificaciones y pagos.

## 10. Siguiente bloque

Preparar checklist GO/NO-GO para cuando el preflight local produzca Level 2 limpio: que condiciones permiten pedir GO a Paula para runtime DEV preview.

## 11. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
