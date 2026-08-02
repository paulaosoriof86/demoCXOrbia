# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-01  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_FRAGMENTED_HUMAN_RUNTIME_PROVEN__UNIFIED_CUMULATIVE_ROOT_FIX_CODE_APPLIED__PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Propósito

Este addendum impide que CXOrbia/TyA vuelva a fragmentarse en versiones aisladas por módulo, etapa, fuente, carril de login o conversación. Solo puede existir una baseline acumulativa construida sobre el HEAD vivo.

## 2. Corrección de la declaración anterior

La validación humana demostró que el build publicado que había obtenido PASS técnico no contenía simultáneamente la experiencia acumulativa completa.

El PASS anterior comprobó Auth/E2E y estabilidad parcial, pero no demostró en la misma URL humana:

- principal autenticado;
- todos los periodos históricos vivos;
- KPI/fases/drill coherentes;
- perfiles, WhatsApp, certificación e histórico;
- Portal Cliente completo;
- Finanzas con configuración correcta por proyecto.

Por tanto:

- el PASS técnico se conserva como evidencia parcial;
- queda supersedido como release PASS;
- Corte 6 no está congelado;
- el Hosting publicado no es la baseline autorizada para cutover.

## 3. Baseline canónica única en recuperación

La única baseline válida para continuar es el HEAD vivo de `docs-tya-v6-v71-audit`, con el root fix acumulativo aplicado y pendiente de gates read-only.

Debe contener simultáneamente:

- frontend aprobado vigente;
- login único Usuario + Contraseña;
- claims para namespace, rol, tenant y proyecto;
- HR viva como autoridad operacional para todos los periodos detectados;
- Firestore como overlay exacto de identidad, perfil y certificación;
- read model canónico v2;
- máquina única de estados y periodo;
- Dashboard, hoja de ruta, fases, detalle, histórico y comparativo completos;
- identidad Shopper y Portal Shopper canónicos;
- Portal Cliente con Panorama, KPIs, sucursales y detalle aprobados;
- Finanzas, Movimientos, Liquidaciones y Beneficios coherentes;
- configuración del proyecto Cinépolis: Q60 GT, L200 HN, modelo delegado, sin facturación local ni regalías, comisión de coordinación compartida configurable;
- Reportes preservados;
- Reservas fail-closed;
- refresh y nueva pestaña idempotentes.

## 4. Fuente viva y conteos dinámicos

La revisión actual previa a agosto contiene 14 periodos, 616 visitas y 208 shoppers, desde junio 2025 hasta julio 2026.

Estos valores son una fotografía de fuente, no invariantes permanentes. Queda prohibido:

- hardcodearlos como condición futura;
- conservar KPIs de cortes anteriores;
- crear agosto por reloj del sistema;
- copiar julio a agosto;
- rechazar crecimiento válido de la HR.

`tya-protected-auth-hr-authority-bridge-v2.js` debe preservar dinámicamente:

- todos los periodos detectados;
- todas las visitas de la revisión;
- llaves técnicas únicas;
- relación visita-periodo válida;
- cero append protegido;
- cero duplicados técnicos.

## 5. Modelo financiero por proyecto

Cada proyecto debe seleccionar al crearse uno de estos modelos:

- `directo/local_invoicing`: existe facturación local y las regalías pueden configurarse cuando correspondan;
- `delegado/delegated_coordination`: no existe facturación local del proyecto, las regalías son 0 y la compensación se registra como comisión de coordinación compartida.

Cinépolis pertenece al segundo modelo.

Queda prohibido:

- aplicar regalías globales a todos los proyectos;
- clasificar Cinépolis como directo;
- descontar regalías a un proyecto delegado;
- inventar el monto de la comisión, participantes o porcentajes de reparto;
- tratar la comisión de coordinación como honorario facturado localmente por visita.

`app/adapters/tya-project-financial-model-contract-v1.js` normaliza el modelo existente y también envuelve la creación de proyectos para preservar esta selección.

## 6. Prevalencia de evidencia

Orden obligatorio para determinar el estado:

1. índice y checkpoint vigentes;
2. evidencia `CORTE6-UNIFIED-CUMULATIVE-RUNTIME-ROOT-FIX-LATEST.json`;
3. este addendum y el lock de estabilidad acumulativa;
4. CAMBIOS-BACKEND de recuperación;
5. evidencias históricas de single-login, R20 full-history y C6 domain/finance/shopper;
6. evidencias técnicas anteriores, solo para los contratos que realmente probaron.

Ningún PASS anterior puede prevalecer sobre una regresión humana reproducible posterior.

## 7. Operaciones prohibidas

Queda prohibido:

- crear otra plataforma, candidata, rama, PR, Firebase o Hosting;
- restaurar una sección desde una versión anterior fuera del HEAD vivo;
- seleccionar “la mejor pantalla” y copiarla de manera aislada;
- aprobar una sección o smoke de carcasa como release completo;
- mantener carriles separados para humano y Auth real;
- permitir que Auth/Firestore reemplace HR;
- recalcular estados, KPIs, identidad o Finanzas en módulos UI;
- deduplicar identidad por nombre, correo, teléfono o similitud visual;
- congelar números de una revisión anterior;
- aplicar regalías sin comprobar facturación local;
- saltar el gate acumulativo por urgencia;
- reutilizar una autorización consumida;
- publicar agosto o producción sin fuente y gate específicos.

## 8. Root fix acumulativo

El HEAD vivo recupera una sola entrada `authenticated-human-canonical`:

- el índice activa Auth, HR viva y adapters canónicos en la misma URL;
- se retiró el override directo de rol;
- se retiró el bridge visual condicionado por token oculto;
- `tya-protected-auth-hr-authority-bridge-v2.js` compone la fuente dinámicamente;
- `tya-project-financial-model-contract-v1.js` distingue local/delegado y bloquea regalías en delegados;
- `tya-c6-unified-human-runtime-v1.js` recupera login Cliente, comparativo completo y configuración financiera correcta;
- `app/modules/*` permanece preservado salvo el comportamiento ya aprobado del wizard, que conserva la selección de modelo.

## 9. Gate de freeze de Corte 6

Secuencia exacta:

`STATIC ROOT CONTRACT → READ-ONLY RUNTIME → AUTH REAL STAFF/CLIENT/SHOPPER → HR ALL DETECTED PERIODS → KPI=PHASE=DRILL → COMPARATIVE ALL PERIODS → PROFILE/CERT/HISTORY → CLIENT → FINANCE SOURCE + PROJECT MODEL → REPORTS/RESERVATIONS → 3 RELOADS + NEW TAB → EVIDENCE`.

El gate financiero debe demostrar:

- Cinépolis = delegado;
- regalías Cinépolis = 0;
- comisión de coordinación compartida sin valores inventados;
- creación de proyecto permite elegir directo o delegado;
- Finanzas aplica regalías únicamente cuando `modelo==='directo'`.

Solo después de PASS local/read-only se solicita autorización fresca para un único deploy del Hosting DEV existente.

Después del deploy autorizado:

- paridad remota;
- mismo gate acumulativo;
- validación humana;
- `APROBADO → C6_BASELINE_CANONICA_ACUMULATIVA_FROZEN`.

## 10. Carril urgente de agosto y postulaciones

Después del freeze:

1. Paula agrega agosto a HR;
2. el runtime lo detecta por fuente;
3. se reconcilia cualquier visita platform-origin;
4. se habilitan disponibles;
5. se habilitan postulaciones;
6. gate multirol;
7. write plan y autorización específica;
8. readback, remote smoke y cutover.

La autorización de Hosting consumida anteriormente no autoriza deploy nuevo, writes, apertura de postulaciones, merge ni producción.

## 11. Invariantes de producto

- todos los periodos HR visibles en histórico/comparativo;
- último periodo = último periodo detectado, no mes del reloj;
- KPI = fase = detalle;
- Portal Cliente y Admin comparten periodo y read model;
- Portal Shopper usa identidad exacta y conserva el dataset interno;
- cero duplicados técnicos;
- conflictos de identidad en review queue;
- honorarios desde configuración cuando HR no trae monto;
- proyecto delegado = regalías 0;
- proyecto local = regalías solo si se configuran;
- comisión de coordinación y reparto pertenecen a la configuración del proyecto;
- fuente financiera exacta y pagos confirmados preservados;
- Reportes sin pérdida;
- Reservas sin mutaciones mientras no exista fuente real.

## 12. Documentación obligatoria

Cada bloque debe actualizar:

- `CAMBIOS-BACKEND.md` o addendum;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- impacto Academia/manuales;
- PR #7;
- evidencia source-safe reproducible.

Si un commit, gate, deploy o herramienta falla, se declara. No se afirma éxito sin evidencia.

## 13. Clasificación

- **Reusable CXOrbia:** baseline acumulativa única, ownership dinámico de fuente, modelo financiero por proyecto, evidencia prevalente y gate transversal.
- **Exclusivo TyA:** operación Cinépolis, Q60/L200, modelo delegado y futura incorporación de agosto.
- **Claude/prototipo:** consumir contratos canónicos sin reimplementar lógica.
- **Academia:** versionado acumulativo, trazabilidad, source ownership y validación E2E real.
- **Sin impacto Claude:** runners, credenciales privadas y consumo one-shot.

## 14. Estado seguro

Root fix aplicado en código; Hosting DEV deploys nuevos 0; Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos/Reservas writes 0; Cloud Run deploys 0; nuevos proyectos/sites 0; credenciales/tokens exportados 0; merge=false; producción=false.
