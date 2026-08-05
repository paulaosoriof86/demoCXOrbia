# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_ONLY_PREPARED__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Carril vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- producción intacta;
- deploy DEV: 0.

No existe empalme V6 aprobado y completado.

## 2. Trabajo adelantado

Quedaron preparados source-only:

- contrato del runner del Laboratorio;
- schema de evidencia;
- gate source-only;
- matriz Admin/Operaciones + Shopper;
- límites `AUDIT-*`;
- fingerprints y cleanup exacto.

No se ejecutaron navegador, runtime, provider reads/writes o datos temporales.

## 3. Cloud V7.1 auditada

- ZIP: `Prototype development request V 7.1.zip`;
- SHA-256: `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- entradas: 5;
- alcance funcional: `app/app.js` y `app/styles/layout.css`;
- decisión: `HOLD_NO_SEND_TO_EMPALME`.

## 4. PASS parciales

- paquete estrecho;
- sintaxis PASS;
- UTF-8 sin BOM;
- secretos 0;
- desktop 1920×1080 y 1440×900 correcto;
- países 1/2/8/12 en orden y sin `+N`;
- doce países accesibles en 1440×900;
- tres perfiles y formulario completos en desktop;
- copy demo/técnico ausente.

## 5. P0 responsive reproducible

La corrección no anuló la regla legacy de `#login` que conserva:

- `display:flex`;
- `align-items:center`;
- `justify-content:center`;
- `padding:24px`.

En móvil, `.lg2` pasa a bloque pero sigue siendo un flex item centrado dentro del contenedor fixed.

Evidencia `390×844`:

- aside/main: x = -81 px, width = 552 px;
- card: x = -65 px, width = 520 px;
- strip top = -191.30 px;
- registro bottom = 1011.30 px;
- document scrollHeight = 844 px.

Resultado:

- clipping lateral;
- franja superior fuera de pantalla;
- texto y controles recortados;
- parte inferior fuera del scroll vertical real.

También se reproduce en `412×915`; en `768×1024` la franja superior queda cortada.

## 6. Evidencia candidata

La única captura llamada `02-desktop-1440x900.png` mide realmente `924×540` y es JPEG.

Faltan:

- cuatro viewports;
- comparación antes/después;
- capturas 1/2/8/12 países.

## 7. Decisión

```text
V7_1_GO = false
SEND_TO_EMPALME = false
EXECUTION_LANE_READY_FOR_APPLY = false
```

No enviar a Codex.

## 8. Corrección V7.2 requerida

Bajo 900 px Cloud debe establecer explícitamente:

- `#login{display:block;padding:0;align-items:initial;justify-content:initial;overflow:auto}`;
- ancho real 100 %;
- cero coordenadas negativas;
- `scrollHeight` suficiente hasta el registro;
- capturas reales de todos los viewports.

## 9. Siguiente secuencia

```text
CLOUD V7.2
→ AUDITORÍA FINAL
→ GO SIN P0
→ CODEX SOLO EMPALME
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## 10. Estado seguro

- V7.1 aplicada: no;
- empalme: 0;
- entidades `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.

## 11. Clasificación

- **Reusable CXOrbia:** contratos, fingerprints, cleanup y auditoría geométrica.
- **Exclusivo TyA:** matriz Admin/Operaciones + Shopper.
- **Cloud/prototipo:** V7.2 pendiente.
- **Academia:** capturas finales pendientes.
- **Sin impacto producción:** no se aplicó ni desplegó nada.
