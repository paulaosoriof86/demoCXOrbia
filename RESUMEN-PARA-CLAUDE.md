# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK_PASS__31_IDENTITY_HOLD_PROVEN__WAITING_SEPARATE_PROTECTED_DEV_REDEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- PR#7 draft/open/no merge; producción intacta.

## 2. Corte6 visual
La visual anterior falló por Shopper sin shopperId en source-safe y Admin sin perfil protegido completo. El write de perfil ya quedó cerrado; falta redeploy protegido DEV + visual humana.

## 3. Perfil completo Firestore — PASS
AuthorizationId `chat-20260731-c6-profile-full-firestore-write-01` consumida.

Resultado exacto:
-120 Firestore document writes sobre perfiles existentes con `legacyShopperId` exacto;
-118 documentos con cambios reales +2 marker-only;
-329 valores escritos;
- readback120 docs/329 campos;
- mismatches0;
-31 sin canonical permanecen HOLD.

Campos escritos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2.

Auth writes0; Firebase Auth password changes0; deploys0; producción=false.

## 4. Identidad HOLD
Los31 faltantes fueron investigados por bridge técnico exacto/único y Auth determinístico + custom claim;0 resueltos. No dedupe por nombre/teléfono/email ni creación silenciosa. Requieren alta/conciliación explícita.

## 5. Precedencia
Export vigente manda para perfil actual; password visible solo desde valor legacy real; Firebase Auth sigue siendo autoridad de login. Las616 visitas y77 certificaciones canónicas permanecen autoridad y no fueron sobrescritas.

## 6. Runtime protegido
Fix preparado sin deploy: protected lane no se degrada a source-safe, watcher no sobrescribe CX.data protegido y histórico/KPI usa shopperId + estados canónicos incluido `submitida`.

## 7. Claude/prototipo
No nueva candidata ni rediseño. La UI ya contempla usuario/contraseña; backend protegido debe entregar valores reales cuando existan. Tocar módulos UI solo si el adapter entrega correctamente el dato y la UI aun no lo refleja.

## 8. Siguiente gate
`AUTORIZACIÓN SEPARADA REDEPLOY DEV PROTEGIDO → HUMAN VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

La autorización Firestore ya fue consumida y no puede reutilizarse para Hosting/Cloud Run.
