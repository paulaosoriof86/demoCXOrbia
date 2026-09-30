# CX.data runtime switch rollback + smoke checklist

Fecha: 2026-07-09  
Bloque: rollback y smoke para runtime switch CX.data  
Estado: checklist creado, switch no autorizado todavia.

## 1. Objetivo

Dejar listo el plan minimo de reversa y validacion antes de conectar `CX.data` a TyA/Cinepolis real-data preview/staging.

Este documento evita que el cambio de demo/mock a datos reales/sanitizados se haga sin salida de emergencia, sin smoke o tocando modulos UI.

## 2. Alcance

Aplica solamente al futuro runtime switch de `CX.data`.

Permitido bajo gate:

- tocar un unico punto de conexion;
- usar manifest/staging source-safe;
- mantener interfaz de `CX.data`;
- validar en DEV/preview antes de produccion.

Prohibido:

- modificar `app/modules/**` para adaptar datos;
- hardcodear Cinepolis dentro de modulos;
- usar HR URL/fileId en repo;
- incluir PII;
- escribir Firestore sin gate;
- activar HR writes, Make, Gemini, pagos o providers.

## 3. Precondiciones antes de tocar runtime

No tocar runtime si falta alguno:

1. Head/commit pre-switch identificado.
2. Lista exacta de archivos a tocar.
3. Rollback path definido.
4. Manifest HR source-safe generado.
5. Input sanitizado minimo disponible o decision explicita de manifest-only preview.
6. DPI/sensibles excluidos o protegidos.
7. `questionnaire_marks` duplicado excluido.
8. `JUNIO 26 HN` marcado `review_required`.
9. Shoppers sin promocion silenciosa si canonical mismatch sigue pendiente.
10. Certificaciones ya presentadas preservadas o mapeadas.
11. Junio tratado como pagos/liquidaciones, no visitas pendientes.
12. URL DEV/preview verificable o plan local claro.
13. GO explicito de Paula.

## 4. Archivos permitidos para switch

Preferido:

- `app/core/data.js`

Alternativa solo con autorizacion:

- un unico adapter precargado antes de modulos.

Archivos NO permitidos:

- `app/modules/**`;
- UI por modulo;
- `firebase.json`;
- `.firebaserc`;
- reglas Firestore/Auth/Storage;
- secrets;
- workflows de deploy, salvo bloque especifico.

## 5. Rollback minimo

Antes del switch:

- guardar SHA pre-switch;
- documentar archivo/s tocado/s;
- documentar objetivo del cambio;
- documentar criterios NO GO;
- documentar comando/accion de reversa;
- no borrar manifest, staging ni reportes de auditoria.

Rollback esperado:

- restaurar `app/core/data.js` o adapter unico a version pre-switch;
- conservar docs y reportes;
- no borrar evidencia de por que fallo;
- documentar causa raiz;
- no insistir con parches visuales si falla por data contract.

## 6. Smoke minimo DEV / preview

### 6.1 Carga base

- Login/admin abre sin pantalla blanca.
- Navegacion base abre.
- Consola sin error JS critico.
- `CX.data` existe.
- Selector de proyecto abre.

### 6.2 Proyecto

- TyA aparece como tenant/contexto si la UI lo soporta.
- Cinepolis aparece como proyecto normal configurable.
- No aparece como hardcode global.
- Periodos/quincenas se distinguen correctamente.
- GT/HN se distinguen correctamente.

### 6.3 HR / visitas

- No se muestran dashboards como visitas.
- `JUNIO 26 HN` queda en revision si aparece.
- `JULIO 26` queda preparacion/no historico cerrado.
- Visitas disponibles no incluyen asignadas.
- Asignadas, agendadas, realizadas, cuestionario y submitido respetan estados HR.
- Disponible desde se muestra como dato dinamico/configurable, no fijo inventado.

### 6.4 Shoppers

- No se muestran DPI ni datos sensibles.
- Shoppers historicos no se duplican por nombre visual.
- `SHOPPER_REVIEW` pendiente no se promociona silenciosamente.
- Accesos/estado shopper se tratan como preview/staging si no estan importados.

### 6.5 Certificaciones

- Certificaciones ya presentadas se conservan si estan mapeadas.
- Shopper certificado no es obligado a repetir prueba sin regla.
- Gemini no aparece como activo real si no hay provider gate.

### 6.6 Liquidaciones/pagos

- Junio aparece como control de pago/liquidacion cuando aplique.
- Preparado/programado no aparece como pagado.
- Pagado requiere auditoria/evidencia o fuente financiera validada.
- Honorario, reembolso y total se separan.

### 6.7 Copy honesto

- No dice importado si solo es preview.
- No dice sincronizado si solo esta preparado.
- No dice enviado si solo existe outbox preparado.
- No dice pagado si solo hay lote preparado.
- No dice IA final/publicada si solo es borrador.

## 7. NO GO inmediato

Rollback inmediato si ocurre:

- pantalla blanca;
- error JS critico;
- navegacion base rota;
- `CX.data` queda indefinido;
- un modulo queda sin datos por cambio de interfaz;
- Cinepolis queda hardcodeado en modulo;
- aparece PII;
- dashboard se interpreta como visita;
- `JUNIO 26 HN` se importa automaticamente;
- shopper/certificacion se duplica por match visual;
- pagos aparecen como pagados sin auditoria;
- providers se activan sin gate;
- se pierde capacidad de volver a demo/estado anterior.

## 8. Criterio de GO DEV

DEV runtime preview puede seguir si:

- todos los modulos base abren;
- no hay errores criticos;
- Cinepolis aparece como proyecto normal;
- estados source-safe son honestos;
- no hay PII;
- los bloqueantes siguen bloqueados;
- Paula puede visualizar y confirmar.

## 9. Criterio de GO produccion

Produccion solo si:

- DEV/preview fue validado visualmente;
- smoke humano GO;
- rollback listo;
- no demo final source;
- no NO GO critico;
- Paula da GO explicito de produccion.

## 10. Claude/prototipo

Si el smoke revela necesidad visual, preparar paquete Claude corto con maximo 5 tareas:

1. UI de fuente HR configurable.
2. Estados demo/preview/staging/importado/produccion.
3. Cinepolis normal configurable.
4. Copy honesto de import/sync/pago/IA.
5. Academia/manuales de configuracion HR y revision.

## 11. Estado seguro actual

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
