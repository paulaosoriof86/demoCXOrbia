# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_APPROVED_NOT_COMPLETED__CLOUD_V7_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Corrección obligatoria

No existe un empalme V6 aprobado y completado.

La rama viva contiene archivos derivados de V6 materializados provisionalmente, pero Paula no validó ni cerró ese empalme. La documentación anterior que decía `V6 empalmada` fue incorrecta y queda sustituida por este checkpoint.

## 2. Carril vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- producción `tya-plataforma` intacta;
- deploy DEV: 0.

## 3. Cloud V7 recibida

- ZIP: `Prototype development request V7.zip`;
- SHA-256: `e834a5797230d246504e325cb7b3e3a48e44086b08a75f4a857470c89faad261`;
- archivos: 259;
- decisión: `HOLD_NO_SEND_TO_EMPALME`.

La candidata no es el delta estrecho solicitado. Contiene una aplicación completa con core, módulos y documentación histórica.

## 4. P0 comprobados

### P0-1 — aplicación completa sobrescribiría la rama viva

Archivos candidatos distintos de los vivos:

- `app/index.html`;
- `app/core/build-lock.js`;
- `app/modules/shoppers.js`;
- `app/modules/finanzas.js`;
- además de los dos archivos visuales esperados.

Aplicar el ZIP completo podría revertir runtime, build lock, Shoppers y Finanzas.

### P0-2 — Login responsive roto

Prueba aislada real con el código candidato:

- `768×1024`: panel orbital cubre título y parte del formulario;
- `412×915`: encabezado, países y perfil quedan ocultos;
- `390×844`: la primera tarjeta aparece cortada y el formulario empieza detrás del panel oscuro.

Causa source: el layout pasa a una columna sin crear flujo vertical `auto auto`; aside y main compiten por la misma fila/altura.

## 5. PASS parciales

- 66 JS no vendor: sintaxis PASS;
- secretos: 0;
- BOM: 0;
- referencias locales faltantes: 0;
- escritorio `1920×1080` y `1440×900`: composición mejorada;
- países 1/2/8/12: todos renderizados, en orden y sin `+N`;
- textos demo/validación/instalación fuera del Login canónico.

No autorizan empalme porque existen P0.

## 6. Evidencia contractual faltante

- manifest V7 con paths, bytes y SHA-256;
- capturas en cinco viewports;
- comparación V6/V7;
- reporte V7 específico;
- evidencia entregada de escenarios 1/2/8/12 países.

La única captura V7 incluida es `924×540` y no corresponde a un viewport solicitado.

## 7. EXECUTION_LANE_READY

```text
ZIP_EXTRACTED = true
AUTHENTICATED_GITHUB_BRANCH_READ = true
LOCAL_AUTHENTICATED_CHECKOUT = false
EXECUTION_LANE_READY_FOR_APPLY = false
```

El fallo del checkout local fue resolución DNS del contenedor. La evidencia del paquete y los blobs exactos de GitHub son suficientes para declarar HOLD, pero no para aplicar nada.

## 8. Corrección requerida a Cloud

Entregar solamente:

- `app/app.js`;
- `app/styles/layout.css`;
- manifest V7;
- reporte V7;
- cinco capturas reales;
- comparación V6/V7;
- escenarios 1/2/8/12 países.

Responsive obligatorio:

- aside y formulario en flujo vertical real bajo `900px`;
- formulario comienza después del panel oscuro;
- título, subtítulo, países, perfil y primera tarjeta visibles;
- órbita conservada;
- cero overflow horizontal;
- 12 países sin cortar botón o registro.

## 9. Secuencia exacta

```text
CORRECCIÓN CLOUD V7
→ NUEVO DELTA ESTRECHO
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ SOURCE/STATIC FINAL
→ ÚNICO HOSTING DEV AUTORIZADO
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## 10. Estado seguro

- empalme V6 aprobado/completado: no;
- empalme V7: 0;
- Hosting/Cloud Run: 0;
- provider reads/writes de esta auditoría: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.

## 11. Clasificación

- **Reusable CXOrbia:** auditoría de paquete, blobs, responsive y evidencias.
- **Exclusivo TyA:** protección de Finanzas, Shoppers y runtime vivos.
- **Cloud/prototipo:** corrección visual V7.
- **Academia:** manual de acceso responsive pendiente de versión aprobada.
- **Sin impacto producción:** no se aplicó ni desplegó nada.
