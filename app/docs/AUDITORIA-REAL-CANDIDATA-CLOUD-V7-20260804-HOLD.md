# AUDITORÍA REAL — CANDIDATA CLOUD V7

**Fecha:** 2026-08-04  
**Paquete:** `Prototype development request V7.zip`  
**SHA-256:** `e834a5797230d246504e325cb7b3e3a48e44086b08a75f4a857470c89faad261`  
**Decisión:** `HOLD_NO_SEND_TO_EMPALME`  
**P0 comprobado:** `FULL_PACKAGE_OVERWRITE_AND_REGRESSION_RISK`  
**Estado correcto del bloque anterior:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_APPROVED_NOT_COMPLETED`

## 1. Corrección de estado

La expresión `V6 empalmada` usada en documentos recientes fue incorrecta.

Lo comprobable es que archivos derivados de V6 quedaron materializados provisionalmente en la rama viva. Eso no equivale a un empalme aprobado, cerrado ni validado por Paula.

Desde este documento, el estado correcto es:

```text
V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED
EMPALME_NOT_APPROVED
EMPALME_NOT_COMPLETED
NO_DEPLOY
NO_PRODUCTION
```

## 2. EXECUTION_LANE_READY

- ZIP recibido y extraído: **sí**;
- paquete inspeccionado: **sí**;
- rama viva consultada mediante conector GitHub autenticado: **sí**;
- blobs exactos de archivos críticos obtenidos: **sí**;
- checkout local autenticado del repo: **no**, por fallo de resolución DNS del contenedor.

Consecuencia:

- existe evidencia suficiente para declarar HOLD y prohibir el empalme;
- no existe carril listo para aplicar ningún delta;
- no se autoriza empalme ni modificación funcional.

## 3. Contrato solicitado a Cloud V7

La instrucción vigente exigía:

- un delta visual estrecho;
- principalmente `app/app.js` y `app/styles/layout.css`;
- tercer archivo solo si era indispensable y justificado;
- cinco capturas reales: `1920×1080`, `1440×900`, `768×1024`, `412×915`, `390×844`;
- comparación V6/V7 en `1440×900`;
- escenarios de 1, 2, 8 y 12 países;
- manifest con path, bytes y SHA-256;
- cero reconstrucción o aplicación completa paralela.

## 4. Contenido real del ZIP

El ZIP contiene una aplicación completa:

- 259 archivos;
- árbol completo `app/`;
- `core/`;
- `modules/`;
- documentación histórica;
- manifests antiguos;
- capturas históricas;
- archivos no solicitados.

Solo contiene una captura específica V7:

`capturas/login-v7-strip.png` — `924×540`.

No incluye:

- manifest V7 del paquete;
- las cinco capturas requeridas;
- comparación V6/V7;
- evidencia entregada para 1/2/8/12 países;
- reporte V7 específico.

`app/REPORTE-DE-CAMBIOS.md` corresponde a V182/V181 y rondas históricas, no a V7.

`app/README.md` describe un MVP comercial con datos ficticios, localStorage/mock y una arquitectura separada de TyA; no documenta el delta visual solicitado.

## 5. Comparación exacta con la rama viva

| Archivo | Blob candidata | Blob rama viva | Decisión |
|---|---|---|---|
| `app/app.js` | `e29b39032848c3b18f788ba5e2a5a95e3d622592` | `e345e1f81fc8064d16b80605611601cb5ce269cd` | delta V7 a auditar |
| `app/styles/layout.css` | `c53c7da243a9a95b384313cfcd7dd7b6c9333941` | `7fd40bd7edd6f8452654800d3afd3462c350484d` | delta V7 a corregir |
| `app/index.html` | `3855486bdddcfcdc2c702f08b2a640d99717d980` | `bda55ef224653afde6b2b87d98828dde1fc8f418` | no aplicar |
| `app/core/build-lock.js` | `63863dad3711c7c99347a0c80e0809e3e26dd0bb` | `74bbc85d94b5b31c0be65c22ae9df8f9f2b78c87` | P0 si se sobrescribe |
| `app/core/config.js` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | idéntico |
| `app/core/data.js` | `3a679020205617e44126ec586e0022edc70b0512` | `3a679020205617e44126ec586e0022edc70b0512` | idéntico |
| `app/core/router.js` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | idéntico |
| `app/modules/shoppers.js` | `df8dbfadabbc7f9a808da83d2a78225b7c5e6055` | `92f834bb2b7fcf5d8674acb717ce6b4e920c5766` | P0 si se sobrescribe |
| `app/modules/finanzas.js` | `42a3394065fcf8853450d29fba4c90e6ded397be` | `623fab9ba1e06c39f83beda610bb771e23910a07` | P0 si se sobrescribe |

Conclusión:

Aplicar el ZIP completo reemplazaría archivos vivos de runtime, build lock, Shoppers y Finanzas con versiones distintas y no autorizadas. Este riesgo es reproducible y clasifica como P0.

## 6. Auditoría estática del paquete

Resultado:

- 66 archivos JavaScript no vendor: `node --check` PASS;
- errores de sintaxis JS: 0;
- BOM UTF-8: 0;
- referencias locales faltantes en `index.html`: 0;
- scripts duplicados: 0;
- llaves privadas, JWT, API keys o service accounts detectados: 0;
- mojibake: 1 documento histórico (`app/docs/AUDITORIA-ENTREGA-CLAUDE.md`).

Estos PASS no compensan el P0 de alcance ni el defecto responsive.

## 7. Auditoría funcional y visual aislada del Login

Se ejecutó un harness aislado con el `app.js` y `layout.css` candidatos, sin backend ni writes.

### Desktop

En `1920×1080` y `1440×900` con dos países:

- órbita visible;
- seis nodos visibles;
- países dinámicos visibles;
- tres perfiles visibles;
- usuario, contraseña, botón y registro visibles;
- sin texto canónico de CXOrbia, demo, validación, instalación o patrones de credencial;
- sin overflow horizontal general.

El escritorio presenta una mejora real y un acabado visual razonable.

### Países

Las pruebas aisladas de 1, 2, 8 y 12 países confirmaron:

- todos los países se renderizan;
- mantienen el orden recibido;
- no aparece `+N`;
- no existe selección obligatoria.

Con 12 países en `1440×900`, el contenido excede la altura: el enlace de registro queda cortado por debajo del viewport.

### Tablet y móvil — FAIL

En `768×1024`, `412×915` y `390×844` el panel oscuro se superpone al formulario.

Efectos observados:

- `INGRESO` queda oculto;
- `Iniciá sesión` queda oculto;
- subtítulo y países quedan total o parcialmente cubiertos;
- `PERFIL` queda oculto;
- la primera tarjeta aparece cortada;
- el formulario comienza detrás del panel orbital.

Causa source:

- `.lg2` usa posicionamiento absoluto y viewport cerrado;
- `.lg2-body` conserva una sola fila `minmax(0,1fr)`;
- al pasar a una columna en `max-width:900px`, no se definen filas `auto auto` ni flujo vertical real;
- el aside y main compiten por la misma altura y se superponen.

Este defecto impide aprobar tablet y móvil y clasifica como bloqueo funcional/visual del acceso.

## 8. Hallazgos clasificados

### P0 comprobado

1. **ZIP completo no aplicable:** sobrescribiría build lock, index, Shoppers y Finanzas vivos.
2. **Responsive de acceso roto:** tablet/móvil ocultan encabezado, países y primera opción de perfil.

### P1

1. Falta manifest V7.
2. Faltan cuatro de las cinco capturas exigidas y la única captura no usa un viewport solicitado.
3. Falta comparación V6/V7.
4. Falta reporte V7 específico.
5. Caso de 12 países desborda `1440×900`.
6. Dependencia externa de `flagcdn.com` para banderas, pendiente de política/fallback.

### P2

1. Documentación histórica sobrante y desactualizada.
2. Un documento con mojibake.
3. Footer visual `v1.0 · 2026 · Powered by Gravicentra CX` no fue solicitado y debe validarse como criterio de marca.

## 9. Decisión

```text
HOLD_NO_SEND_TO_EMPALME
```

No enviar este ZIP a Codex ni aplicar el paquete completo.

Tampoco debe extraerse todavía un delta de dos archivos para empalme porque `layout.css` contiene un defecto responsive reproducible.

## 10. Corrección exacta requerida a Cloud

Cloud debe devolver un único paquete estrecho con:

1. `app/app.js`;
2. `app/styles/layout.css`;
3. `MANIFEST.json` con path, bytes y SHA-256;
4. reporte V7 específico;
5. capturas reales en los cinco viewports;
6. escenarios 1/2/8/12 países;
7. comparación en `1440×900`.

Corrección responsive obligatoria:

- en `max-width:900px`, convertir el cuerpo a flujo vertical real;
- usar filas `auto auto` o bloque equivalente;
- eliminar la superposición entre aside y main;
- asegurar que el formulario comience después del panel oscuro;
- mantener visibles `INGRESO`, título, subtítulo, países, `PERFIL` y primera tarjeta;
- mantener órbita visible sin `display:none`;
- cero scroll horizontal general;
- en 12 países, conservar botón y registro accesibles sin corte.

## 11. Estado seguro

- empalme V7: 0;
- deploy: 0;
- browser contra DEV: 0;
- provider reads/writes: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.

## 12. Clasificación

- **Reusable CXOrbia:** auditoría de alcance, blobs, responsive y evidencias.
- **Exclusivo TyA:** protección de Shoppers, Finanzas y build lock vivos.
- **Cloud/prototipo:** corrección de `app.js` y `layout.css`.
- **Academia:** impacto visual en manual de acceso responsive.
- **Sin impacto producción:** no se aplicó ni desplegó nada.
