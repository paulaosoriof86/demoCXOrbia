# CAMBIOS BACKEND — Addendum Corte 6 perfil Shopper completo V2/V3 READ-ONLY PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__FIRESTORE_WRITE_AUTHORIZED_PENDING_EXECUTION__NO_DEPLOY__NO_PRODUCTION`

## 1. Resultado V2/V3 previo
El bundle cifrado del export vigente fue reconciliado contra `cxorbia-backend-dev` exclusivamente read-only.

Resultado sanitizado:151 registros V2;120 match exactos por `legacyShopperId`;31 sin canonical;0 ambiguos/invalid;118 documentos con cambios reales de campos +2 marker-only =120 documentos máximos;329 valores de perfil planificados.

Campos planificados: username113, password legado real118, departamento2, DPI17, dirección1, fecha nacimiento2, términos aceptados72, aprobación cuenta2 y origen registro2. Nombre, teléfono/WhatsApp, email, país y ciudad ya coinciden.

Los31 faltantes fueron investigados por dos bridges adicionales read-only: Auth determinístico + claim y V3 por llave técnica exacta/única (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`) seguido de Auth. Resultado:0 resueltos;31 HOLD comprobados. Nunca se utilizó nombre, teléfono o email como identidad.

## 2. Transporte y gate
El primer intento V2 falló antes del provider por checksum de `part-007.txt`; se restauró el blob cifrado exacto y retry terminó PASS con provider writes0.

El write gate quedó endurecido: request/plan + executor fail-closed + workflow one-shot. El workflow solo dispara mediante `backend/config/corte6-profile-full-firestore-write-execute-v2.json`; modificar el plan/request sin execute marker no accede al provider.

Antes de mutation se revalida autorización, destino, bundle SHA-256,151/120/31,118+2 documentos,329 valores y desglose exacto. Cualquier drift falla antes del provider. Readback de los120 documentos y cada campo escrito es obligatorio.

## 3. Autorización Firestore recibida
Paula autorizó en conversación actual un único write DEV sobre `cxorbia-backend-dev`, exclusivamente `tenants/tya/shoppers`, máximo120 documentos existentes con match exacto `legacyShopperId`:118 perfiles con cambios reales +2 marker-only,329 valores de perfil, seguido de readback completo.

AuthorizationId: `chat-20260731-c6-profile-full-firestore-write-01`.

Alcance autorizado:
- Firestore document writes máximo120;
- username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2;
-31 missing canonical quedan HOLD y no se crean ni emparejan por nombre/teléfono/email;
- Auth writes0 y Firebase Auth password resets0;
- Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0;
- producción=false; merge=false.

Plan y request fueron activados únicamente para esta autorización one-shot. El execute marker aún no existía al documentar este punto; provider writes ejecutados hasta aquí:0.

## 4. Fuente y precedencia
- export vigente manda para perfil actual legacy;
- identidad automática solo por llaves técnicas reproducibles;
- password visible únicamente desde valor real del export;
- Firebase Auth sigue siendo autoridad de autenticación;
-616 visitas y77 certificaciones canónicas permanecen autoridad;
- `certs`, `histCerts`, `visitas`, `activo`, `rating` legacy no sobrescriben histórico canónico.

## 5. P0 visual y siguiente gate
Después de `WRITE+READBACK PASS` se requerirá autorización separada para redeploy del runtime protegido DEV. Solo entonces se repite visual Admin + Shopper con perfil/histórico/KPI completo.

Los31 HOLD no se consideran migrados y requieren alta/conciliación explícita antes de declarar migración legacy completa/freeze final.

## 6. Clasificación
- **Reusable CXOrbia:** handoff cifrado, stable-ID compare, bridges técnico/Auth, write-plan, execute marker one-shot, drift gate y readback.
- **Exclusivo cliente:** datos TyA y31 perfiles legacy sin vínculo canónico.
- **Claude/prototipo:** no rediseño; runtime protegido preparado.
- **Academia:** identidad reproducible, perfil vs histórico canónico, autorización one-shot y readback.
- **Sin impacto Claude:** ejecución/gates/evidencia backend.

## 7. Estado seguro antes del execute marker
Producción intacta; PR#7 draft/open/no merge. Auth/HR/legacy writes0; Rules/Hosting/Cloud Run/Storage/Make/Gemini/pagos0. La única mutación autorizada pendiente es el write Firestore descrito arriba.
