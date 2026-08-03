# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `A_PLUS_B_VISIBLE_ON_SINGLE_DEV__VISUAL_REVIEW_OPEN__SEMANTIC_READONLY_REVALIDATION_PENDING__NO_PRODUCTION`

## 1. Pendiente inmediato

La candidata única ya está visible en:

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

El trabajo pendiente es:

1. Checkpoint Visual 1 de Paula sobre ese mismo build;
2. revalidación semántica read-only usando el gate corregido, sin redeploy;
3. ajustes focalizados sobre la misma candidata si Paula identifica regresiones;
4. freeze/build-lock únicamente después del PASS visual y técnico.

## 2. Cerrado

- proveniencia M1/Corte 1, Corte 2A y V182;
- matriz SHA A+B;
- manifest de 23 archivos;
- adapter acumulativo;
- source gate exacto PASS;
- unit gate 23/23;
- static cumulative PASS;
- deploy único a Hosting DEV;
- paridad remota PASS;
- HR, Staff, Shopper, Cliente y Finanzas remotas PASS.

## 3. Gate semántico

El workflow terminó STOP_RETRY porque el gate final no persistió `remote-semantic.json`.

Causa reproducible corregida:

- módulo real: `financiero`;
- alias incorrecto usado por el gate: `finanzas`.

Root fix:

`68f1b49b3c03d53e0d9c74d15d0f55e286653a0e`

Ahora el gate usa el ID correcto y guarda el error exacto antes de terminar. No se modificó la candidata desplegada.

## 4. Checklist visual A+B

### Shell/contexto

- login único;
- tenant `tya`;
- proyecto `cinepolis`;
- periodo correcto;
- fuente HR viva;
- navegación por rol;
- ausencia de identidades o datos demo aparentes.

### CRM Ops Leads

- pipeline, cuentas, contactos, actividades y ficha 360;
- estado vacío/pending-source honesto;
- cero fixtures;
- altas nuevas preservadas.

### Dashboard

- tiles, fases, comparativo y drilldowns coherentes;
- GT/HN correctos;
- cero cifras inventadas.

### Hojas de Ruta

- HR y periodo correctos;
- acciones no activadas claramente gateadas.

### Clientes

- sin prospectos/contactos placeholder;
- relación Cliente→Proyecto por IDs.

### Comercial

- herramienta de planificación, no cifra contractual falsa;
- Cinépolis delegado, localBilling false, regalía 0.

### Marketing

- periodo correcto;
- sin contenido/métricas ficticias;
- Make/Gemini inactivos.

## 5. Scope diferido

Hasta cerrar el Checkpoint 1, no abrir salvo P0 transversal:

- Operación e histórico;
- experiencia Shopper/certificaciones;
- Finanzas completa;
- Portal Cliente/reportes/Insights;
- administración/integraciones;
- Academia.

## 6. Protegido

- 14 periodos;
- 616 visitas;
- 208 shoppers en el carril Shopper;
- `ownVisits=1`;
- Cliente `tya/cinepolis`;
- Q60 GT/L200 HN;
- regalía 0;
- segundo deploy 0;
- producción intacta.

## 7. Siguiente bloque exacto

`PAULA REVISA EL DEV ÚNICO → SE DOCUMENTAN HALLAZGOS → SOLO DELTA FOCALIZADO SOBRE LA MISMA CANDIDATA`.
