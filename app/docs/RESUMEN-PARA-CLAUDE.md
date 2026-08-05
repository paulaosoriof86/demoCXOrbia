# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V7_HOLD__DO_NOT_SEND_TO_EMPALME__CORRECTION_REQUIRED`

## 1. Corrección de continuidad

No existe un empalme V6 aprobado y completado.

El repo contiene archivos derivados de V6 materializados provisionalmente, pero Paula no validó ni cerró ese empalme. No usar `V6 empalmada` como estado.

## 2. V7 recibida

Paquete auditado:

- `Prototype development request V7.zip`;
- SHA-256 `e834a5797230d246504e325cb7b3e3a48e44086b08a75f4a857470c89faad261`;
- 259 archivos.

Decisión:

```text
HOLD_NO_SEND_TO_EMPALME
```

## 3. Problema de alcance

La instrucción solicitó un delta estrecho, principalmente:

- `app/app.js`;
- `app/styles/layout.css`.

La entrega contiene la aplicación completa, core, módulos, documentación histórica y archivos no solicitados.

No se puede enviar el ZIP completo a empalme porque sobrescribiría archivos vivos diferentes, incluyendo:

- `app/index.html`;
- `app/core/build-lock.js`;
- `app/modules/shoppers.js`;
- `app/modules/finanzas.js`.

## 4. Problema responsive reproducible

En `768×1024`, `412×915` y `390×844`, el panel oscuro se superpone al formulario y oculta encabezado, países, `PERFIL` y parte de la primera tarjeta.

Bajo `max-width:900px` debe existir flujo vertical real: panel orbital y después formulario completo, sin superposición ni overflow horizontal.

## 5. Qué sí funciona y debe preservarse

- escritorio mejorado;
- órbita y seis conceptos;
- países dinámicos 1/2/8/12 en orden y sin `+N`;
- tres perfiles;
- usuario, contraseña, botón y registro;
- textos demo/validación/instalación fuera del Login canónico;
- sintaxis PASS y secretos 0.

## 6. Nueva entrega exacta

Entregar un único ZIP estrecho con:

1. `app/app.js`;
2. `app/styles/layout.css`;
3. `MANIFEST.json` con path, bytes y SHA-256;
4. reporte específico;
5. capturas reales `1920×1080`, `1440×900`, `768×1024`, `412×915`, `390×844`;
6. comparación antes/después `1440×900`;
7. evidencia 1/2/8/12 países.

No incluir aplicación completa, `index.html`, `core/`, `modules/`, documentación histórica ni capturas antiguas.

## 7. Trabajo paralelo de ChatGPT — sin tarea para Claude

Mientras Claude corrige únicamente el frontend, ChatGPT preparó source-only:

- contrato del runner del Laboratorio;
- schema de evidencia;
- matriz Admin/Operaciones + Shopper;
- fingerprints;
- cleanup exacto;
- gate source-only.

Claude no debe tocar, implementar ni incluir estos elementos. No debe modificar backend, laboratorio, runner, gates, deploy ni producción.

## 8. Estado seguro

- V7 enviada a empalme: no;
- archivos funcionales de V7 aplicados: 0;
- deploy: 0;
- producción: intacta.
