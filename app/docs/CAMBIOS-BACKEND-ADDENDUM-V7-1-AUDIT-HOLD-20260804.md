# CAMBIOS BACKEND — Preparación del Laboratorio y auditoría V7.1

**Fecha:** 2026-08-04  
**Estado:** `LAB_SOURCE_ONLY_PREPARED__V7_1_HOLD__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Bloque adelantado mientras Cloud trabajaba

Se completó la preparación source-only del Laboratorio Admin/Operaciones + Shopper.

Archivos materializados:

- `backend/contracts/tya-dev-scenario-lab-runner-v1.json`;
- `backend/contracts/tya-dev-scenario-lab-evidence-schema-v1.json`;
- `tools/qa/tya-dev-scenario-lab-source-contract-gate.mjs`;
- `app/docs/MATRIZ-EJECUCION-LABORATORIO-ADMIN-SHOPPER-20260804.md`.

Quedaron definidos:

- cinco perfiles de escenario;
- máquina de estados hasta `CLEANUP_VERIFIED`;
- máximo de entidades sintéticas `AUDIT-*`;
- fingerprints antes/después;
- cleanup exacto por IDs del mismo run;
- schema de evidencia sanitizada;
- bloqueo P0 ante fallo de cleanup;
- prohibición de reintento automático.

Este trabajo no autorizó ni ejecutó navegador, runtime, credenciales, provider reads/writes, datos temporales, deploy o producción.

## 2. Candidata auditada al cierre

- archivo: `Prototype development request V 7.1.zip`;
- SHA-256: `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- entradas: 5;
- alcance funcional: `app/app.js` y `app/styles/layout.css`;
- decisión: `HOLD_NO_SEND_TO_EMPALME`.

Auditoría detallada:

`app/docs/AUDITORIA-REAL-CANDIDATA-CLOUD-V7-1-20260804-HOLD.md`.

## 3. PASS parciales V7.1

- delta estrecho;
- sintaxis PASS;
- UTF-8 sin BOM;
- secretos 0;
- manifest consistente con sus cuatro entradas listadas;
- desktop 1920×1080 y 1440×900 correcto;
- países 1/2/8/12 visibles y ordenados;
- doce países sin cortar el botón en desktop;
- copy demo/técnico ausente;
- no hay cambios de negocio fuera del Login.

## 4. P0 V7.1

El responsive continúa recortado por una regla heredada de `#login` que mantiene `display:flex`, centrado y `padding:24px`.

Aunque `.lg2` cambia a bloque, sigue siendo un flex item centrado dentro del viewport fixed. En 390×844:

- aside/main: x = -81, width = 552;
- card: x = -65, width = 520;
- strip top = -191.30;
- registro bottom = 1011.30;
- document scrollHeight = 844.

La candidata oculta lateralmente contenido y deja controles fuera del área desplazable real.

## 5. Evidencia faltante

La única captura rotulada 1440×900 mide realmente 924×540 y es JPEG con extensión `.png`.

Faltan cuatro viewports, comparación antes/después y evidencias 1/2/8/12 países.

## 6. Siguiente acción exacta

Cloud debe entregar V7.2 exclusivamente frontend, preservando desktop y corrigiendo:

- `#login` como bloque sin padding/centrado heredado bajo 900 px;
- ancho real 100 % del viewport;
- scrollHeight suficiente hasta el enlace final;
- cero coordenadas negativas;
- evidencias reales y manifest completo.

Después:

```text
AUDITORÍA FINAL V7.2
→ GO SIN P0
→ CODEX SOLO EMPALME DEL DELTA EXACTO
→ SOURCE/STATIC FINAL + GATE DEL LABORATORIO
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## 7. Estado seguro

- empalme V6 aprobado/completado: no;
- V7.1 aplicada: no;
- deploy DEV: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.

## 8. Clasificación

- **Reusable CXOrbia:** contratos, schema, gate, fingerprints, cleanup y auditoría geométrica.
- **Exclusivo TyA:** matriz Admin/Operaciones + Shopper y branding Gravicentra CX.
- **Cloud/prototipo:** V7.2 requerida.
- **Academia:** capturas definitivas pendientes.
- **Sin impacto producción:** source-only y auditoría aislada.
