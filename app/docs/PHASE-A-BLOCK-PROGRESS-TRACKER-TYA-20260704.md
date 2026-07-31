# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_P0_OPEN__EXPORT_RECOVERED__PROFILE_HANDOFF_READY__USERNAME88_READY__NO_WRITE__NO_DEPLOY`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N 1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. P0 visual Corte6 — abierto
La visual anterior demostró Shopper `shopperId=null`, Admin en `display_name_only` e histórico/KPI incompletos. Corte6 no se congela todavía.

## 3. Protected runtime read-only — PASS
Firestore shoppers340; phone123; email39; username0; documento0; banco/pago0.

Auth108; shopper claims con shopperId91; perfiles existentes91/91.

Histórico616/616 con shopperId; shopperIds distintos194; perfiles194/194; submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

## 4. Corrección runtime preparada — no desplegada
- protected no se degrada a source-safe;
- watcher source-safe no sobrescribe CX.data protegido;
- aliases leen solo datos reales;
- KPI/histórico incluye `submitida` y usa shopperId;
- password no se sintetiza.

Gate estático previo PASS. No deploy nuevo autorizado.

## 5. Username/password
Username: shopper109; match estable exacto88; Auth claim binding88/88; fill-missing88; conflictos0; 21 HOLD.

Password: 68/88 verifican patrón inicial histórico;20/88 no. No mostrar/resetear patrón universal.

## 6. Export perfil extra — recuperado
File Library volvió a responder y se recuperó el export ya entregado `tya-plataforma-default-rtdb-export (6).json` del 2026-07-30.

Schema real confirma username, teléfono/WhatsApp, email, país/ciudad/departamento y, según registro, DPI, dirección, fecha de nacimiento, certs/histCerts, términos y metadata de cuenta.

No conectar legacy.

## 7. Reconciliación y handoff seguro
Reconciliador v2 listo: match ID estable → `legacyShopperId`, fill-missing, no overwrite, password/UID excluidos.

Campos:
- operativos candidatos: username, phone, email, country, city, department;
- sensibles HOLD: document/DPI, address, birthDate;
- evidence-only: certs/histCerts, visitas, estado, términos, aprobación/origen, rating.

Se preparó handoff OFFLINE cifrado + runner DEV read-only + workflow read-only + request de espera. File Library no expone bytes/path al runner, por lo que este puente evita PII cruda y conexión legacy.

## 8. Julio/agosto
No materializar agosto hasta cerrar P0 Shopper/perfil y congelar Corte6. No copiar julio ni repetir histórico.

## 9. Siguiente bloque
`BUNDLE CIFRADO DEL EXPORT EXISTENTE → RECONCILIACIÓN READ-ONLY → DELTA OPERATIVO + USERNAME88 → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL → FREEZE C6`.

## 10. Claude/Academia
- Claude: preservar diseño; no inventar password; frontend solo si backend protegido entrega el dato y la UI no lo refleja.
- Academia: source-safe vs protected, claims→shopperId, migración por ID estable, PII protegida por Rules, evidencia legacy vs estado canónico, KPI por facetas.

## 11. Estado seguro
Provider writes0; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
