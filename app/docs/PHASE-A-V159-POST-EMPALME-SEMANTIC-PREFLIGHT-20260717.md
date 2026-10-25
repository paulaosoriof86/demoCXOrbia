# PHASE A — V159 POST-EMPALME SEMANTIC PREFLIGHT

Fecha: 2026-07-17  
Corte: `CORTE_0_V159_POST_EMPALME + CORTE_1_CONTEXTO_HR_HISTORICO`

## Decisión

- Preflight estructural local de la candidata V159: `PASS`.
- Preflight semántico estático de proyecto/periodo/HR/histórico: `PASS`.
- P0 demostrado: no.
- Estado máximo: `TECHNICAL_PASS_PENDING_VISUAL`.
- Browser smoke del build empalmado exacto: pendiente.
- Hosting DEV V159 exacto: pendiente de autorización separada.

## Evidencia estructural ejecutada

Sobre el ZIP V159 adjunto y extraído:

- 67 archivos JS/MJS revisados con `node --check`;
- 0 errores de sintaxis;
- 66 scripts declarados en `app/index.html`;
- 64 scripts locales;
- 0 scripts locales faltantes;
- 40 archivos de módulos presentes;
- 0 archivos UTF-8 con BOM;
- `app.js` e `index.html` sin delta frente a V156.

## Delta runtime efectivo V156 → V159

Se confirmaron 17 archivos modificados:

- `app/core/automations.js`;
- `app/core/data-source.js`;
- `app/core/liquidacion.js`;
- `app/core/manuales-data.js`;
- `app/core/notif.js`;
- `app/core/topbar.js`;
- `app/core/ui.js`;
- `app/modules/academia.js`;
- `app/modules/administrabilidad.js`;
- `app/modules/automatizaciones.js`;
- `app/modules/cert.js`;
- `app/modules/configuracion.js`;
- `app/modules/correo.js`;
- `app/modules/crm.js`;
- `app/modules/finanzas.js`;
- `app/modules/hr-source.js`;
- `app/modules/importador.js`.

Los módulos que gobiernan directamente el corte de contexto/histórico no cambiaron entre V156 y V159:

- `app/modules/dashboard.js`;
- `app/modules/proyectos.js`;
- `app/modules/periodos.js`;
- `app/modules/historico.js`;
- `app/modules/visitas.js`;
- `app/modules/shoppers.js`;
- `app/app.js`;
- `app/index.html`.

## Revisión semántica del delta relevante

- `core/data-source.js`: el único cambio es fallback de etiqueta desconocida a `No disponible`; no modifica proyecto, periodo, snapshot ni consultas.
- `modules/configuracion.js` y `modules/hr-source.js`: normalizan la etiqueta visual de fuente desconocida; no cambian el origen ni el mapping.
- `modules/finanzas.js`: cambia copy `preview` a `vista previa`; no cambia filtros ni cálculos.
- `core/liquidacion.js`, `core/ui.js`, `core/notif.js` y `core/automations.js`: cambios de vocabulario honesto; no confirman pagos reales.
- Academia, administrabilidad, automatizaciones, correo, CRM, certificación e importador: cambios de lenguaje/comprensión operativa y estados honestos; no activan proveedores ni writes.

No se encontró en el delta V159 una modificación que colapse proyecto y periodo o que reemplace el histórico por un único conjunto.

## Evidencia de fuente y mapping preservados

La rama viva conserva:

- build lock V159 con manifest de 174 archivos;
- source-safe HR con 14 periodos desde 2025-06 hasta 2026-07;
- cada periodo con 34 visitas GT y 10 HN, total 44;
- 616 visitas históricas esperadas;
- proyecto padre `cinepolis` separado de los IDs de periodo;
- visitas enlazadas al `periodId` estable;
- periodos MAY/JUN/JUL con claves diferentes;
- junio como ejecución completada y control de liquidación/pago.

El gate existente `tools/qa/tya-project-period-kpi-history-gate.mjs` verifica en browser:

- identidad separada de proyecto y periodo;
- 14 IDs y claves únicos;
- 616 visitas y 44 por periodo;
- cambio real de conjuntos MAY/JUN/JUL;
- 34 GT / 10 HN;
- KPI financiero acotado al periodo activo;
- junio sin ejecución pendiente y con control de pago pendiente.

## Limitación honesta del preflight

El ZIP frontend aislado no contiene los overlays y payloads TyA preservados por el empalme. Por ello, esta sesión no declara un browser smoke del árbol empalmado exacto usando solo la carpeta extraída del ZIP.

La comprobación runtime debe ejecutarse sobre el build V159 exacto de la rama viva, no sobre la candidata aislada ni sobre la URL histórica V131/R18D.

## Siguiente acción autorizable

Publicar únicamente el build V159 exacto en Firebase Hosting DEV `cxorbia-backend-dev`, sin tocar:

- Firestore;
- Auth;
- Storage;
- HR;
- imports;
- Make;
- Gemini;
- pagos;
- producción;
- merge.

Después ejecutar:

1. gate browser proyecto/periodo/KPI/histórico;
2. smoke remoto Admin, Shopper, Cliente y Academia;
3. entrega de matriz visual a Paula;
4. corrección focalizada por capa si existe diferencia;
5. freeze `ACTIVE_BASELINE` si no existe P0.

## Clasificación

- Reusable CXOrbia: preflight por delta + gate semántico browser antes de freeze.
- Exclusivo TyA: 14 periodos, 616 visitas, 34 GT/10 HN y tratamiento de junio.
- Claude/prototipo: no se solicita V160; solo corregir si la revisión visual localiza un fallo frontend.
- Academia: validar rutas, copy, proyecto/periodo y estados reales por rol.
- Sin impacto Claude: Hosting DEV, gate browser, hashes y smoke remoto.

## Estado seguro

Sin deploy ejecutado, sin merge, sin producción, sin imports reales, sin Firestore/Auth/Storage/HR writes, sin Make/Gemini live y sin pagos.