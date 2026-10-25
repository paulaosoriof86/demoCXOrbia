# COMPARACIÓN DE SHAS APROBADOS PHASE A — BLOQUE 1 M1 / CORTE 2A

**Fecha:** 2026-08-03  
**Estado:** `PASS_8_APPROVED_OR_FROZEN_BLOBS_PRESENT__NO_RESTORE_REQUIRED_FOR_PROVEN_SET`

## 1. Fuentes de autoridad

### M1 / Corte 1

Documento:

`VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.

Estado:

`CORTE_1_M1_APROBADO_CON_P1_P2_DOCUMENTADOS`.

Build funcional aprobado:

`67c0943260f076f5686284ac509458ed5fd34dbd`.

### Corte 2A / V174

Manifest:

`MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`.

Source head:

`d47400ce070002b109cf21f6fe6a24661cba4619`.

Estado histórico:

`FROZEN/APROBADO`.

## 2. Comparación exacta por Git blob

| Archivo | Autoridad | Blob aprobado/frozen | Blob vivo | Resultado | Decisión |
|---|---|---|---|---|---|
| `app/modules/dashboard.js` | M1 `67c094...` | `e879fc3f1dd5a7486762b197346cadd086e1d99d` | `e879fc3f1dd5a7486762b197346cadd086e1d99d` | EXACTO | `PRESERVAR_APROBADO` |
| `app/core/config.js` | M1 `67c094...` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | EXACTO | `PRESERVAR_APROBADO` |
| `app/core/router.js` | M1 `67c094...` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | EXACTO | `PRESERVAR_APROBADO` |
| `app/modules/visitas.js` | Corte 2A `d47400...` | `d7c65650e4972d438f2641cbcaaff25486fb7f01` | `d7c65650e4972d438f2641cbcaaff25486fb7f01` | EXACTO | `PRESERVAR_FROZEN` |
| `app/modules/postulaciones.js` | Corte 2A `d47400...` | `f38593885c245841710934971dd335ee5eddf1da` | `f38593885c245841710934971dd335ee5eddf1da` | EXACTO | `PRESERVAR_FROZEN` |
| `app/modules/novedades.js` | Corte 2A `d47400...` | `3a8a4ac11fe3dfe5bff11c4840f355742bc93375` | `3a8a4ac11fe3dfe5bff11c4840f355742bc93375` | EXACTO | `PRESERVAR_FROZEN` |
| `app/modules/operacion-extra.js` | Corte 2A `d47400...` | `896d1e97af7761209955a0df2cad1dca68820801` | `896d1e97af7761209955a0df2cad1dca68820801` | EXACTO | `PRESERVAR_FROZEN` |
| `app/modules/cliente-extra.js` | Corte 2A `d47400...` | `ca3d2d6b356b3d942ebbb2076625ce0b000e4b64` | `ca3d2d6b356b3d942ebbb2076625ce0b000e4b64` | EXACTO | `PRESERVAR_FROZEN` |

## 3. Dictamen

Para estos ocho archivos:

- no existe pérdida de SHA;
- no corresponde restaurar desde ZIP o commit histórico;
- no corresponde pedir nueva candidata;
- no corresponde reescribir UI;
- deben permanecer intactos durante la reconstrucción salvo P0 reproducible.

El problema acumulativo de estos módulos no es ausencia del archivo aprobado. El gate pendiente es de **composición y comportamiento transversal**:

- una sola fuente/revisión;
- overlays que no alteren semántica;
- navegación por rol;
- reportes y perfiles conectados;
- anti-regresión sobre el build completo.

## 4. Diferencia legítima identificada

`app/app.js` no coincide con M1:

- M1: `faee4058a0ada7dbda84ddf172cfd4fd64dcad22`;
- vivo: `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36`.

Esto no se clasifica como regresión porque `app/app.js` fue modificado y congelado posteriormente en V182/Corte 3. Debe compararse contra la autoridad V182, no restaurarse a M1.

## 5. Invariantes M1 que siguen obligatorias

- Dashboard Admin, Visitas, Postulaciones, Panorama Cliente y Reportes usan el mismo tenant/proyecto/periodo/sourceRevision;
- refresco HR in-place sin `location.reload()`;
- estados operativos por facets canónicas;
- ausencia financiera distinta de cero;
- coherencia transversal de totales;
- reportes por rol y fail-closed Shopper sin identidad.

## 6. Pendiente del siguiente subbloque

Recuperar y comparar:

- V182/Corte 3: `app.js`, `layout.css`, `beneficios.js`, `finanzas-core.js`, `finanzas.js` y fixes focales posteriores;
- C6: entrada, Auth/HR overlays, Reservas, Portal Cliente/Shopper y runtime multirol;
- módulos Phase A no cubiertos por M1/V174 exactos: Histórico, detalle/revisión, Shoppers, Mis Visitas, Certificación, Cuestionario, Documentos, Cliente, Liquidación y Costos.

## 7. Estado seguro

- archivos funcionales modificados: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
