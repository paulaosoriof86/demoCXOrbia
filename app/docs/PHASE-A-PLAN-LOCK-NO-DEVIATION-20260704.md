# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-01  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_UNIFIED_CUMULATIVE_RUNTIME_ROOT_FIX_CODE_APPLIED_PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Objetivo y arquitectura

TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final. No crear Firebase, Hosting, rama o PR por rutina.

La baseline funcional debe ser una sola, acumulativa y construida sobre el HEAD vivo. Quedan prohibidos shells reducidos, carriles humanos paralelos, versiones por módulo y restauraciones manuales de pantallas.

## 2. Secuencia obligatoria

`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → READ MODEL CANÓNICO → REGRESSION GATE SEMÁNTICO → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → REMOTE SMOKE → VALIDACIÓN HUMANA ACUMULATIVA → CUTOVER`.

Un asset-smoke o prueba sintética aislada no congela un corte. Todo gate futuro debe comprobar igualdad entre KPIs, fases, detalles, perfiles, Portal Cliente, Portal Shopper, histórico, Finanzas y periodos.

## 3. Cortes protegidos

- Corte 1/2A/3 FROZEN.
- R17N 1,406/1,406; no repetir.
- Corte 5 CX.data PASS.
- Auth, claims y Rules previamente validados; no reabrir su diseño.
- Perfil protegido, certificación, histórico, finanzas y pagos canónicos se conservan como contratos aprobados.
- Corte 6 no está congelado porque la visual humana probó una regresión de composición.

## 4. Ownership canónico

1. **HR viva:** todos los periodos detectados, visitas, estados, asignación HR, fechas y evidencias operativas.
2. **Firestore protegido:** identidad, perfil, PII, credenciales materializadas y certificación como overlay exacto; nunca reemplaza HR.
3. **Finanzas/pagos canónicos:** liquidaciones, movimientos, beneficios y pagos.
4. **Configuración del proyecto:** honorarios, impuestos, regalías, reglas y parámetros que no deben repetirse en cada fila HR.
5. **Auth/RBAC:** acceso y alcance, no fuente operacional.
6. **Plataforma-origin:** delta reconciliado, nunca duplicación HR.

## 5. Regla dinámica de la HR

No existen cifras operacionales congeladas por corte.

La revisión actual previa a agosto contiene:

- 14 periodos desde junio 2025 hasta julio 2026;
- 616 visitas;
- 208 shoppers;
- agosto 2026 ausente.

Estos conteos son una fotografía, no invariantes permanentes. Cada revisión válida puede crecer cuando la HR agregue periodos o filas nuevas, siempre que:

- cada periodo tenga llave única;
- cada visita tenga llave técnica única;
- cada visita pertenezca a un periodo detectado;
- no exista append de historia protegida;
- no existan duplicados técnicos.

Agosto solo aparece cuando exista realmente en HR o como fuente platform-origin autorizada y reconciliada. Nunca se genera por reloj del sistema ni copiando julio.

## 6. P0 humano demostrado

La visual publicada mostró:

- entrada directa sin principal autenticado;
- Shopper sin identidad;
- julio mezclado con agosto;
- KPIs y fases divergentes;
- comparativo sin todos los periodos;
- perfiles, WhatsApp, credenciales y certificaciones no proyectados;
- identidades repetidas/no reconciliadas;
- Portal Cliente y Finanzas sin su mejor estado aprobado.

Causa raíz: el bootstrap separó un carril humano source-safe de un carril protegido y condicionó los adapters canónicos a un token visual oculto.

El PASS técnico anterior queda como evidencia parcial y no habilita freeze.

## 7. Runtime humano unificado

La única entrada humana válida es `authenticated-human-canonical`:

- selección de perfil y Usuario + Contraseña dentro del mismo login del producto;
- Firebase Auth/claims como autoridad del principal;
- HR viva completa como autoridad operacional;
- Firestore como overlay exacto de identidad/perfil/certificación;
- read model canónico;
- Dashboard, fases, detalle e histórico coherentes;
- Portal Cliente y Portal Shopper completos;
- Finanzas canónicas;
- cero writes mientras el corte permanezca en validación.

El índice ya no carga el override directo de rol ni el bridge visual dependiente de sesión oculta.

## 8. Read model y composición

`app/adapters/tya-cumulative-read-model-v2.js`:

- compone desde HR, nunca desde arreglos ya compuestos;
- protected visits solo hacen overlay por llave técnica exacta;
- perfiles sin crosswalk no se anexan a operación y pasan a review queue;
- no dedupe por nombre/teléfono/email;
- identidad, certificación, histórico y completitud se calculan desde evidencia real;
- genera resumen por todos los periodos detectados.

`app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`:

- valida dinámicamente la revisión viva;
- conserva exactamente sus periodos y visitas;
- prohíbe pérdida de periodos, append protegido y duplicados;
- no hardcodea 14/616/208.

## 9. Consistencia transversal

`app/adapters/tya-c6-domain-consistency-bridge.js` y adapters relacionados deben garantizar:

- KPI = fase = detalle para cada periodo;
- máquina de estados única;
- Portal Shopper con identidad, perfil, certificación e histórico completos;
- Admin y Shopper leyendo la misma identidad canónica;
- comparativo de todos los periodos vivos;
- periodo seleccionado único para operación y Finanzas;
- liquidaciones derivadas de facetas canónicas, no de literales aislados.

## 10. Finanzas y configuración del proyecto

La fuente financiera canónica no se sustituye por cero ni por “pendiente” general cuando ya existe información aprobada.

Cinépolis conserva en configuración:

- honorario GT: Q60;
- honorario HN: L200;
- modelo directo;
- ISR 5 %;
- regalías 10 %.

Cuando HR no repite el honorario, el read model usa la configuración del proyecto. Los montos financieros exactos y pagos confirmados conservan autoridad y nunca se sobrescriben.

## 11. Identidad, perfiles y certificación

La resolución Shopper usa únicamente:

- `shopperId`/`id`;
- `legacyShopperId`;
- `hrRowId`;
- `visitId`;
- `sourceTab + sourceRow`;
- crosswalk persistido y auditado.

Conflictos pasan a review queue. Nunca se fusionan por nombre, teléfono, correo, mayúsculas o tildes.

El perfil debe proyectar, según rol y fuente autorizada:

- identidad;
- usuario/estado de credencial;
- WhatsApp existente;
- histórico;
- certificación presentada/aprobada;
- datos adicionales aportados por el shopper.

## 12. Gate de Corte 6

Secuencia exacta:

`STATIC ROOT CONTRACT → READ-ONLY RUNTIME → AUTH REAL STAFF/CLIENT/SHOPPER → HR ALL DETECTED PERIODS → KPI=PHASE=DRILL → COMPARATIVE ALL PERIODS → PROFILE/CERT/HISTORY → CLIENT → FINANCE CONFIG → 3 RELOADS + NEW TAB → EVIDENCE`.

Solo después del PASS local/read-only:

1. solicitar autorización fresca para un único deploy del Hosting DEV existente;
2. ejecutar el mismo gate remoto;
3. validación humana acumulativa;
4. `APROBADO C6 → FREEZE`.

No se reutiliza autorización consumida.

## 13. Julio y agosto

No iniciar materialización de agosto antes del freeze.

Después del freeze:

- Paula agrega agosto a HR;
- el runtime lo detecta dinámicamente;
- se reconcilia cualquier visita platform-origin;
- se habilitan disponibles y postulaciones;
- se ejecuta gate multirol;
- cualquier write/cutover requiere autorización específica.

## 14. Claude/prototipo

Claude debe preservar como contratos reutilizables:

- baseline acumulativa única;
- máquina de estados única;
- periodo vivo único;
- perfil completo calculado por campos;
- identity review queue;
- histórico Shopper completo;
- certificación visible por rol;
- honorarios desde configuración del proyecto;
- liquidaciones completas derivadas de facetas;
- gate transversal entre tile, fase, drill, portal y Finanzas.

No debe copiar lógica backend a módulos UI ni reintroducir fixtures, carriles alternos o conteos congelados.

## 15. Academia

Fuentes vigentes:

- `ACADEMIA-IMPACTO-C6-RECUPERACION-RUNTIME-ACUMULATIVO-20260801.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-RECUPERACION-BASELINE-ACUMULATIVA-UNICA-20260801.md`.

## 16. Estado seguro

Bloque correctivo actual: Hosting deploys 0; Cloud Run 0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; nuevos Firebase/Hosting 0; merge=false; producción=false.
