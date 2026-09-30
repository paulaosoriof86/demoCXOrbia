# Claude delta acumulado post V90 - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se consolida delta acumulado para Claude despues de V90, incluyendo pendientes, patrones replicables, mejoras locales y Academia.

## Estado actual

- V90 fue auditada.
- V90 no esta empalmada.
- V90 no es source lock.
- V91 o patch correctivo queda esperado como candidata separada.
- PR debe seguir draft hasta auditoria y decision documentada.

## Pendientes Claude P0

### Copy honesto por gate

Corregir textos que prometen acciones reales cuando backend/proveedor/gate no esta activo.

Prioridad inmediata:

- `app/core/topbar.js`: toast `Correo enviado a ...`.
- `app/modules/dashboard.js`: toast `WhatsApp enviado (Make): ...`.
- `app/modules/postulaciones.js`: textos `Aprobada · WhatsApp enviado...`.
- `app/modules/configuracion.js`: textos de invitacion enviada o reenviada.
- `app/modules/soporte.js`: `Respuesta enviada vía Make`.
- `app/modules/finanzas.js`: toasts de liquidaciones/lote pagado si no hay cruce financiero real.

### Cuestionario / submitido

Revisar `cuestionario enviado` cuando pueda confundirse con submitido real o integracion externa.

Preferir:

- `cuestionario completado`;
- `cuestionario realizado`;
- `pendiente revision`;
- `pendiente submitido`.

### Terminos sensibles

Revisar en UI visible:

- enviado;
- enviada;
- enviadas;
- via Make;
- sincronizado;
- pagado;
- pagada;
- proveedor conectado.

## Pendientes Claude P1

- Mantener badges de estado por gate.
- Mostrar acciones como preparadas o pendientes cuando no exista backend real.
- Conservar historial visual sin afirmar ejecucion real.
- Evitar cambios logicos fuera de copy.
- Documentar impacto por modulo.

## Replicables CXOrbia

Patrones reutilizables identificados:

1. Copy honesto por gate.
2. Auditoria de candidata antes de source lock.
3. Runbook de recepcion V91 antes de empalmar.
4. Clasificacion obligatoria por bloque: Reusable CXOrbia, Exclusivo cliente, Claude/prototipo, Academia, Sin impacto Claude.
5. Distincion operativa entre preparado, pendiente, demo, enviado real y confirmado.

## Mejoras locales documentadas

- Auditoria V90 copy honesto.
- Barrido residual V90.
- Runbook recepcion V91.
- Correccion de drift gate para permitir contratos preview-only sin permitir cambios runtime.
- Prompt de continuidad largo para no perder contexto.
- Paquete Claude actualizado con prioridades Phase A.

## Academia

Academia debe reflejar lenguaje operativo claro:

- preparado no significa enviado;
- demo no significa proveedor activo;
- pendiente de gate no significa ejecutado;
- cuestionario completado no significa submitido;
- pago preparado no significa pago confirmado;
- sync preparado no significa sync aplicado.

Cualquier cambio de copy en modulos operativos debe revisar si cursos, manuales o instructivos usan la misma terminologia.

## Que no debe tocar Claude

- backend;
- contracts;
- tools;
- workflows;
- Firebase/Auth/Firestore/Storage;
- Make/Gemini;
- imports;
- datos reales;
- reglas de produccion.

## Criterio de recepcion V91

V91 debe entregarse como ZIP separado, con lista de archivos tocados, resumen por archivo, impacto Academia y confirmacion de no tocar integraciones.

No empalmar automaticamente.

## Estado seguro

Sin merge final, sin produccion real, sin proveedores reales, sin imports reales, sin sync real y sin datos sensibles.
