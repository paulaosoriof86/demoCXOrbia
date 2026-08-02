# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_FRAGMENTED_HUMAN_RUNTIME_PROVEN__UNIFIED_CUMULATIVE_ROOT_FIX_CODE_APPLIED__PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Repositorio y destinos

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama viva `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta.

## 2. Fuentes obligatorias vigentes

1. reglas maestras y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-RECUPERACION-BASELINE-ACUMULATIVA-UNICA-20260801.md`;
7. evidencia `CORTE6-UNIFIED-CUMULATIVE-RUNTIME-ROOT-FIX-LATEST.json`;
8. evidencias aprobadas de login, R20 full-history y auditoría C6 live domain/finance/shopper;
9. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD vivo.

## 3. Regla prevalente de fuente

La HR viva es autoridad para **todos los periodos detectados**, no únicamente el mes actual y nunca números congelados de cortes anteriores.

Fotografía de la revisión vigente previa a agosto:

- 14 periodos desde junio 2025 hasta julio 2026;
- 616 visitas;
- 208 shoppers;
- no existe agosto 2026 en HR.

Estos conteos describen la revisión actual y no son límites permanentes. El runtime debe aceptar crecimiento legítimo cuando la HR agregue periodos o filas nuevas, siempre que las llaves técnicas sean completas y únicas.

Agosto no puede aparecer ni heredarse de julio hasta que Paula agregue la fuente. Cuando aparezca, debe incorporarse por detección de HR, no por reloj del sistema ni por copia de otro mes.

## 4. Regla prevalente de modelo financiero

El modelo se selecciona por proyecto al crearlo:

- `directo/local_invoicing`: facturación local; las regalías solo aplican si el proyecto las configura;
- `delegado/delegated_coordination`: sin facturación local del proyecto; regalías 0; compensación mediante comisión de coordinación compartida.

Cinépolis es proyecto delegado.

Configuración vigente:

- honorario Shopper GT: Q60;
- honorario Shopper HN: L200;
- regalías: 0;
- comisión y reparto: configurables por proyecto, sin montos ni porcentajes inventados;
- tratamiento tributario: específico del proyecto, no inferido.

El contrato reusable es `app/adapters/tya-project-financial-model-contract-v1.js`.

## 5. P0 humano vigente

El build publicado abrió un carril reducido que:

- deshabilitó el login real en la entrada humana;
- permitió Shopper sin identidad;
- dejó inactivos los adapters canónicos salvo token oculto;
- fragmentó KPIs, fases, comparativo, perfil, certificación, Cliente y Finanzas.

El PASS técnico anterior queda supersedido como release PASS. Corte 6 no está congelado.

## 6. Root fix de código

El HEAD vivo recupera una sola entrada `authenticated-human-canonical`:

- login visible Usuario + Contraseña;
- Auth/claims para principal y alcance;
- HR viva como autoridad operacional dinámica;
- Firestore protegido como overlay exacto;
- todos los periodos y visitas de cada revisión;
- dominio, Shopper y Finanzas canónicos;
- modelo financiero directo/delegado por proyecto;
- Cinépolis delegado, sin regalías;
- comparativo de todos los periodos HR;
- sin módulos paralelos ni shell reducido.

No hubo deploy ni writes de proveedor.

## 7. Gate vivo

`STATIC ROOT CONTRACT → READ-ONLY AUTH STAFF/CLIENT/SHOPPER → HR ALL DETECTED PERIODS → KPI=PHASE=DRILL → HISTORICAL ALL PERIODS → PROFILE/CERT/HISTORY → CLIENT → FINANCE SOURCE + PROJECT MODEL → 3 RELOADS → EVIDENCE`.

El gate financiero debe demostrar:

- selector directo/delegado al crear proyecto;
- Cinépolis delegado;
- regalías Cinépolis 0;
- comisión compartida sin valores inventados;
- regalías calculadas únicamente para proyectos directos.

## 8. Después del PASS

Solo después del PASS local/read-only:

1. solicitar autorización fresca de un único deploy DEV;
2. ejecutar paridad y gate remoto idéntico;
3. validación humana acumulativa;
4. `APROBADO C6 → FREEZE`;
5. Paula agrega agosto a HR;
6. reconciliación agosto → disponibles → postulaciones → gate multirol → cutover autorizado.

## 9. Estado seguro

Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; Hosting deploy 0 en este bloque; merge false; producción false.
