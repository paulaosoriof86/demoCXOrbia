# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__EXPORT_RECOVERED__PROFILE_HANDOFF_READY__USERNAME88_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 2. P0 Shopper/perfil
La visual anterior falló porque Shopper quedó sin shopperId y Admin estaba usando display-only source-safe.

Read-only protegido confirma que 91/91 shopper claims resuelven perfil real. La nueva visual debe usar Auth/claims/Rules protected runtime.

## 3. Datos ya existentes
Firestore shoppers340:
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0.

Teléfono/email existentes deben aparecer sin migración adicional cuando protected runtime sea publicado.

## 4. Histórico/KPI
- 616/616 visitas con shopperId;
- 194 perfiles referenciados194/194;
- submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Runtime fix preparado para que `submitida` no desaparezca del histórico/KPI. No rediseñar módulo.

## 5. Username
Dry-run exacto desde bundle cifrado:
- 109 registros shopper;
- 88 exactos stable-ID + Auth claim;
- username fill-missing88;
- conflictos0;
- 21 sin perfil exacto HOLD.

Plan Firestore disabled; requiere autorización específica después de combinar el perfil extra real.

## 6. Password
Verificación hash/patrón:
- exactos88;
- `Nombre123*` equivalente verificado para68;
- 20 no siguen ese patrón.

No mostrar contraseña universal falsa. Firebase Auth no devuelve plaintext vigente. Para 20 preservar credencial histórica o reset controlado bajo autorización Auth futura si realmente se necesita.

## 7. Export perfil extra — recuperado
File Library volvió a responder y se recuperó el export vigente ya entregado `tya-plataforma-default-rtdb-export (6).json` del 2026-07-30. No pedir reenvío del archivo original.

El schema real confirma username, teléfono/WhatsApp, email, país/ciudad/departamento y, según registro, DPI, dirección, fecha de nacimiento, certificaciones/historial, términos y metadata de cuenta.

No conectar RTDB legacy.

## 8. Reconciliación v2 y seguridad
`tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs` quedó endurecido:
- match solo por ID técnico estable → `legacyShopperId`;
- no nombre/teléfono/email como llave;
- fill-missing; no overwrite;
- metadata `_eliminados` excluida;
- wrappers/snapshots secundarios no sustituyen root actual;
- password/UID legacy excluidos.

Separación:
- operativos candidatos: username, phone, email, country, city, department;
- sensibles HOLD: document/DPI, address, birthDate;
- evidencia-only: certs/histCerts, visitas, activo/estado, términos, aprobación/origen, rating.

Motivo del HOLD sensible: Rules actuales permiten leer `/shoppers/{id}` a roles operador; DPI/dirección/fecha de nacimiento no deben agregarse ahí hasta tener almacenamiento/RBAC protegido real.

## 9. Handoff cifrado preparado
Para superar la frontera File Library → runner sin re-subir PII cruda:
- `tools/local/cxorbia-corte6-profile-extra-handoff.html`: OFFLINE, excluye pass/password y UID legacy, cifra valores de perfil antes de salir del navegador;
- `tools/qa/cxorbia-corte6-profile-extra-handoff-dryrun.mjs`: descifra solo en memoria dentro del gate DEV y compara contra Firestore read-only;
- `.github/workflows/cxorbia-corte6-profile-extra-readonly.yml`: solo provider read; escribe al repo únicamente evidencia source-safe y consume el request;
- `backend/config/corte6-profile-extra-readonly-request.json`: esperando exclusivamente el bundle cifrado.

No hay provider write/deploy autorizado ni ejecutado.

## 10. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 11. Agosto
No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 12. Siguiente bloque
`GENERAR BUNDLE CIFRADO DEL EXPORT YA EXISTENTE → READ-ONLY RECONCILIATION AUTOMÁTICA → COMBINAR DELTA OPERATIVO CON USERNAME88 → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA`.

Producción/merge siguen bloqueados.
