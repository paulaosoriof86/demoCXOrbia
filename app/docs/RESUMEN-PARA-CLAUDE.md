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

La auditoría aislada confirmó que desktop mejora, pero tablet y móvil fallan.

En:

- `768×1024`;
- `412×915`;
- `390×844`;

el panel oscuro se superpone al formulario y oculta:

- `INGRESO`;
- `Iniciá sesión`;
- subtítulo;
- países;
- `PERFIL`;
- parte de la primera tarjeta.

Causa:

- `.lg2` queda encerrado en el viewport;
- `.lg2-body` cambia a una columna, pero mantiene una sola fila `minmax(0,1fr)`;
- aside y main no entran en flujo vertical real.

## 5. Corrección obligatoria

Bajo `max-width:900px`:

- convertir el cuerpo a flujo vertical real;
- usar `grid-template-rows:auto auto`, bloque o equivalente;
- permitir altura documental real;
- asegurar que `.lg2-main` empiece después de `.lg2-aside`;
- eliminar cualquier superposición;
- mantener visible la órbita;
- mantener visibles título, subtítulo, países, perfil y primera tarjeta;
- cero scroll horizontal general.

En `1440×900` con 12 países:

- botón y enlace de registro deben permanecer visibles o accesibles sin corte visual.

## 6. Qué sí funciona

- escritorio `1920×1080` y `1440×900` tiene mejor composición;
- órbita visible;
- seis conceptos visibles;
- países dinámicos en orden;
- pruebas aisladas de 1/2/8/12 países sin `+N`;
- tres perfiles, usuario, contraseña, botón y registro;
- textos de demo, validación, instalación y patrones de credencial eliminados del Login canónico;
- sintaxis JS PASS;
- cero secretos detectados.

Preservar estos avances.

## 7. Nueva entrega exacta

Entregar un único ZIP estrecho con:

1. `app/app.js`;
2. `app/styles/layout.css`;
3. `MANIFEST.json` con path, bytes y SHA-256;
4. `REPORTE-V7-CORRECCION.md`;
5. capturas reales:
   - `1920×1080`;
   - `1440×900`;
   - `768×1024`;
   - `412×915`;
   - `390×844`;
6. comparación antes/después en `1440×900`;
7. evidencia de 1, 2, 8 y 12 países.

No incluir:

- aplicación completa;
- `index.html`;
- `core/`;
- `modules/`;
- documentación histórica;
- manifests V109–V156;
- capturas antiguas.

## 8. Aceptación

La nueva candidata solo podrá ser GO cuando:

- no exista superposición en ningún viewport;
- todos los elementos iniciales del formulario sean visibles;
- el ZIP tenga alcance exacto;
- el manifest valide todos sus archivos;
- las evidencias correspondan realmente a los viewports solicitados;
- el caso de 12 países no corte el cierre del formulario.

## 9. Fuera del alcance de Cloud

No tocar:

- backend;
- Firebase Auth;
- claims/memberships;
- CX.data/HR;
- permisos/scopes;
- Finanzas;
- Shoppers;
- build lock;
- index/load order;
- laboratorio/runner;
- GitHub/gates/deploy/producción.

## 10. Estado seguro

- V7 enviada a empalme: no;
- archivos funcionales aplicados: 0;
- deploy: 0;
- producción: intacta.
