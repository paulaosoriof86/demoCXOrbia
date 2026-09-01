# Academia — impacto Corte 6 perfil Shopper + visual acumulativa

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- provider compare read-only → write-plan → autorización one-shot → drift gate → write → readback;
- separar human visual de provider Auth cuando QA no dispone de credenciales técnicas;
- preservar auto-entry del prototipo;
- mantener identidades no resolubles en HOLD;
- un PASS técnico no reemplaza validación visual humana;
- una nueva capa de datos debe superponerse de forma acumulativa y no reemplazar una fuente ya validada;
- los gates deben validar **marcadores semánticos reales**, no depender de frases literales frágiles del código.

## Caso Corte6
Perfil:151 registros;120 exactos;31 HOLD;329 valores. Write PASS:120 documentos,118 field-change +2 marker-only, readback120/329, mismatches0.

El acceso human visual sin credenciales quedó PASS, pero la visual real mostró un P0 de composición: Dashboard0, HR live/auto-refresh ausente, identidad Shopper mezclada, perfiles/histórico incompletos y Finanzas/Beneficios vacíos.

## Causa didáctica
La capa full-profile sustituyó `CX.data` en vez de enriquecer la fuente operacional. Además se deshabilitó el watcher HR y coexistieron dos representaciones de period ID. Validar cada capa aislada no garantiza una aplicación acumulativamente correcta.

## Precedencia reusable de fuentes
1. **HR viva**: periodos, periodo activo, visitas operativas y auto-mes.
2. **Firestore protegido**: perfil/PII/credenciales legacy materializadas y facetas/histórico, como overlay por llave técnica exacta.
3. **Finanzas/pagos canónicos**: liquidaciones, beneficios, movimientos y pago histórico.

## Exact identity y aliases
- unir solo por `id/shopperId/legacyShopperId` exacto;
- no dedupe por nombre, teléfono ni email;
- alias legacy solo se suprime por vínculo exacto reproducible;
- fixtures/demo y referencias técnicas sin identidad operacional no se convierten en personas visibles.

## Corrección reusable — ejecutada PASS
Authorization `chat-20260731-c6-cumulative-human-visual-hosting-01`:
- Hosting DEV redeploys1;
- Cloud Run redeploys0;
- decisión `PASS_EXISTING_HOSTING_DEV_CUMULATIVE_HR_PROFILE_FINANCE_REMOTE_READY`;
- HR fresh/runtimeRead +616 visitas + auto-discovery PASS;
- overlay protegido exacto PASS;
- asset financiero canónico preservado PASS;
- full-profile fail-closed401 PASS;
- módulos UI intactos.

El primer disparo del gate falló **antes** de provider mutation porque buscaba la frase literal `cumulative overlay`. Como `hostingDeployExecutions` seguía0, la autorización no estaba consumida. Se sustituyó esa comprobación por el marcador semántico real `cumulativeVisual:true` y se reejecutó el mismo gate. Resultado: un solo deploy real, sin duplicación.

## Impacto en manuales/cursos/rutas
- Admin QA: una sola visual debe demostrar simultáneamente fuente viva, perfil, histórico y finanzas.
- Shopper QA: la misma identidad debe conservar perfil, histórico y beneficios.
- Backend: HR live → protected overlay → canonical finance, con precedencia explícita.
- QA: un smoke debe medir invariantes acumulativas y usar contratos semánticos estables.

## Clasificación
- **Reusable CXOrbia:** composición acumulativa, precedencia de fuentes y gates semánticos.
- **Exclusivo cliente:**31 identidades HOLD TyA.
- **Claude/prototipo:** no rediseño; solo documentar gap frontend si persiste después de la validación acumulativa.
- **Academia:** anti-regresión acumulativa, stable-ID overlay y diseño de gates resistentes a cambios de texto.
- **Sin impacto Claude:** bridge/watcher/gates/deploy DEV.

## Siguiente hito didáctico
Human visual conjunta Dashboard+HR+Shopper+Beneficios+Finanzas → PASS/FAIL → freeze Corte6. Todavía no producción.
