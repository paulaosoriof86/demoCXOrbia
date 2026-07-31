# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis14 periodos/616 visitas/current2026-07 Firestore PASS.
- Auth91/91; claims5/5; Rules PASS.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 2. Regla producto que Claude debe preservar
- HR es fuente viva y las pestañas mensuales nuevas deben incorporarse automáticamente, sin configuración mensual por chat.
- Julio puede seguir en ejecución mientras el siguiente mes ya tiene visitas disponibles originadas en plataforma.
- Un periodo/visita de origen plataforma puede anteceder a HR; cuando HR aparezca debe reconciliarse por IDs estables y `assignmentSource`/`assignmentSyncStatus`, sin duplicar.
- Nunca deduplicar por nombre ni fabricar visitas copiando un mes anterior.

## 3. Auto-month backend
Se corrigió la dependencia del inventario estático de meses. El runtime live:
- pide HR con `fresh=1`;
- si Sheets API está disponible, descubre tabs mensuales desde metadata provider en cada refresh;
- si cae a GViz, usa último registry provider fail-closed y rechaza tabs fantasma;
- watcher existente refresca ~20 s/focus/visibility;
- predeploy PASS sin deploy.

Provider actual: Sheets API está `DISABLED` en `cxorbia-backend-dev`; la service account no puede habilitarla, pero **ya tiene rol reader en el HR canónico**. No crear nueva cuenta/HR por este tema.

## 4. P0 seguridad HR
El HR canónico tiene permiso Drive `anyone=writer`. Esto es P0 para producción. Debe quitarse el acceso público de edición y quedar restringido a usuarios autorizados, preservando la service account reader.

No resolver esto desde frontend ni ocultarlo como copy.

## 5. Shopper real
`Shopper protegido` es únicamente máscara source-safe. No insertar PII en JS estático.

Backend preparó una ruta DEV protegida separada:
- `app/core/backend-protected-dev-mode.js`;
- `app/index-backend-dev.html` usa Firebase Hosting init;
- Auth/custom claims/Firestore Rules siguen siendo obligatorios;
- Admin/Coordinación podrá ver identidad real; shopper solo su scope;
- read-only; no writes.

No tocar `app/modules/*` por este bloque. La ruta aún no está desplegada; requiere un redeploy Hosting DEV autorizado.

## 6. Julio/agosto
HR todavía no tiene `AGOSTO 26` ni `AGOSTO 26 HN`. Operativamente julio puede seguir ejecutándose y agosto puede existir como disponibilidad de origen plataforma antes de HR. La plataforma ya tiene configurado este contrato de coexistencia/reconciliación.

No obstante, las fuentes inspeccionadas todavía no contienen un registro exacto source-of-truth de esas visitas disponibles de agosto platform-origin. No clonar julio ni materializar ubicaciones/IDs/estados por inferencia. Ese origen exacto debe recuperarse/conectarse para el delta de agosto.

## 7. Siguiente bloque exacto
`CORREGIR SHARING HR P0 + ENABLE SHEETS API EXISTENTE → REVALIDAR HR READER → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Después: recuperar/conectar fuente exacta agosto platform-origin → delta-only idempotente → autorización Firestore data write → preprod/cutover.

## 8. P1/P2
PDF/gráficas, Excel/formato, reportKit/exportaciones, copy de fuentes/readiness continúan documentados y no deben confundirse con este gate.

## 9. Academia/manuales
Documentar: HR viva/autodescubrimiento de periodos; plataforma-origin antes de HR; conciliación bidireccional; sharing mínimo; source-safe vs runtime protegido; provider capability gate; fail-closed contra tabs inexistentes.

## 10. Estado seguro
API enable0; sharing changes0; Cloud Run deploy0; Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.