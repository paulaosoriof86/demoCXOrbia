# PAQUETE EXCLUSIVO CLAUDE — V109 A V110

## Decisión

V109 queda bloqueada para empalme por dos P0 comprobados. No ampliar alcance ni reabrir puntos cerrados.

## P0 1 — Academia: shopper solo ve su país

Archivo: `app/modules/academia.js`.

Fallo: `CX.acadData.ctx()` usa todos los países del proyecto cuando la sesión shopper no trae `scopePaises`. Un shopper GT ve cursos GT y HN.

Corrección:

- para shopper, resolver `shopperId` y usar exclusivamente `shopper.pais`;
- sin país resoluble, fail-closed para contenido restringido;
- invitados usan `scopePaises`;
- admin/super conserva catálogo administrable;
- no usar `project.countries` como fallback shopper.

Pruebas:

- shopper GT ve GT y no HN;
- shopper HN ve HN y no GT;
- shopper sin país no ve contenido restringido;
- lo oculto no afecta KPIs/rutas/lecciones/certificados.

## P0 2 — Finanzas: dato incompleto no se procesa

Archivos permitidos: `app/core/data.js`, `app/modules/finanzas.js` y `app/core/liquidacion.js` solo si es imprescindible.

Fallo: una visita sin país/moneda enviada a `payVisits()` queda `liquidada`, recibe lote/fecha y crea movimiento `Pagado`.

Corrección:

- validar ID, proyecto, país, moneda y monto finito/no negativo antes de agrupar;
- separar válidas y `reviewRequired`;
- inválidas no cambian estado, no reciben lote/fecha, no crean movimiento ni automatización;
- devolver IDs y motivos;
- UI muestra revisión requerida.

Pruebas:

- falta país;
- falta moneda;
- falta ambos;
- monto `NaN` o negativo;
- falta ID;
- selección mixta procesa solo válidas;
- GT/GTQ + HN/HNL completos siguen separados.

## No reabrir

- Portal Cliente finite scores;
- lotes completos multi-país/moneda;
- IDs determinísticos;
- responsive;
- Beneficios;
- certificaciones;
- cache demo/real;
- manifest/verificador;
- shell/navegación.

## Entrega

`Prototype development request CXOrbia V110.zip` con build lock, manifest, verificador, reporte y `smoke-v110/SMOKE-CRITICOS-V110.json`.

No tocar backend, tools, workflows, Firebase/Auth/Storage real, HR/migración/importadores, Make/Gemini, deploy, producción ni datos sensibles.