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
- **una nueva capa de datos debe superponerse de forma acumulativa y no reemplazar una fuente ya validada.**

## Caso Corte6
Perfil:151 registros;120 exactos;31 HOLD;329 valores. Write PASS:120 documentos,118 field-change +2 marker-only, readback120/329, mismatches0.

El acceso human visual sin credenciales quedó técnico PASS, pero la visual real mostró un P0 de composición: Dashboard0, HR live/auto-refresh ausente, identidad Shopper mezclada, perfiles/histórico incompletos y Finanzas/Beneficios vacíos.

## Causa didáctica
La capa full-profile sustituyó `CX.data` en vez de enriquecer la fuente operacional. Además se deshabilitó el watcher HR y coexistieron dos representaciones de period ID, por lo que el periodo activo dejó de encontrar sus visitas aunque el histórico de616 seguía cargado.

Esto demuestra que validar cada capa aislada no garantiza una aplicación acumulativamente correcta.

## Precedencia reusable de fuentes
Para CXOrbia/TyA:
1. **HR viva** manda sobre periodos, periodo activo, visitas operativas y descubrimiento automático de meses.
2. **Firestore protegido** manda sobre perfil/PII/credenciales legacy materializadas y facetas/histórico, como overlay por llave técnica exacta.
3. **Finanzas/pagos canónicos** mandan sobre liquidaciones, beneficios, movimientos y pago histórico.

Ninguna fuente sustituye a otra por conveniencia de QA.

## Exact identity y aliases
- unir solo por `id/shopperId/legacyShopperId` exacto;
- no dedupe por nombre, teléfono ni email;
- un alias legacy puede ocultarse únicamente si otro perfil canónico declara ese mismo alias en `legacyShopperId` de forma exacta;
- fixtures/demo y referencias técnicas sin identidad operacional no deben convertirse en personas visibles en una prueba real.

## Corrección reusable preparada
- full visual pasa de replace a overlay acumulativo;
- watcher HR sigue activo y reaplica el overlay protegido tras refresh;
- project/period IDs de HR se preservan;
- snapshots financieros canónicos no se reemplazan;
- módulos UI no se tocan.

## Impacto en manuales/cursos/rutas
- Admin QA: una sola visual debe demostrar simultáneamente fuente viva, perfil, histórico y finanzas.
- Shopper QA: la misma identidad debe conservar perfil, histórico y beneficios.
- Backend: HR live → protected overlay → canonical finance, con precedencia explícita.
- QA: un smoke debe medir invariantes acumulativas, no solo presencia de assets.

## Clasificación
- **Reusable CXOrbia:** composición acumulativa y precedencia de fuentes.
- **Exclusivo cliente:**31 identidades HOLD TyA.
- **Claude/prototipo:** no rediseño; solo documentar gap frontend si persiste después de corregir composición.
- **Academia:** incorporar anti-regresión acumulativa y stable-ID overlay.
- **Sin impacto Claude:** bridge/watcher/gates DEV.

## Siguiente hito didáctico
Hosting DEV del fix acumulativo → smoke HR616/auto-month/full-profile fail-closed → human visual conjunta Dashboard+Shopper+Beneficios+Finanzas → freeze Corte6. Todavía no producción.
