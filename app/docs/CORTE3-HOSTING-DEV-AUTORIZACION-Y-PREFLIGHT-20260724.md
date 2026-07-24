# CXOrbia TyA — Corte 3 Hosting DEV autorización y preflight

**Fecha:** 2026-07-24  
**Estado:** `AUTHORIZED_PENDING_EXACT_REQUEST_COMMIT`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Autorización vigente

Paula autorizó expresamente en la conversación actual la publicación del mismo build de Corte 3 en **Hosting DEV**.

Alcance autorizado:

- Hosting DEV `cxorbia-backend-dev` / target `cxorbia-dev`;
- mismo V174 + HR live source-safe + snapshot financiero canónico R23;
- smoke remoto y validación visual;
- cero Cloud Run deploy;
- cero producción, merge, imports, pagos o writes reales;
- cero Firestore/Auth/Storage/HR writes;
- cero Make/Gemini.

La autorización no habilita producción ni Corte 4.

## 2. Gate previo preservado

El deploy queda condicionado al PASS ya demostrado:

- perfil `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`;
- run `30074835544`;
- job `89423207982`;
- artifact `8589444193`;
- digest `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`;
- estado `PASS_READONLY_POST_GATES`.

## 3. Carril exacto

Se reutiliza el workflow existente:

- `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`.

No se crea rama, PR ni workflow paralelo.

El carril ahora exige:

1. solicitud de autorización como único archivo del commit disparador;
2. `HEAD^` igual al source head esperado;
3. composite V174 verificado;
4. endpoint HR live existente listo antes del deploy;
5. binding R22 live HR;
6. overlay R24 del snapshot financiero canónico y adapter único;
7. sintaxis de fuentes y adapters;
8. Hosting DEV únicamente;
9. coincidencia remota de build-lock;
10. endpoint HR remoto 14 periodos / 616 visitas;
11. gate remoto Corte 3 de Finanzas, Beneficios y exportaciones;
12. evidencia sanitizada.

## 4. Archivos funcionales del carril

- `tools/release/tya-corte3-hosting-dev-build-r24.mjs` — helper reusable de build efímero.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` — carril one-time explícitamente autorizado.
- `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json` — solicitud efímera; se activará en el commit final aislado.

No se modificaron `app/modules/**`, `app/core/**` ni `app/index.html` en Git. El workflow modifica `app/index.html` y `firebase.json` únicamente dentro del checkout efímero antes de Hosting DEV.

## 5. Regla de ejecución

El deploy no inicia hasta que el archivo de solicitud quede como `authorized_pending`, con el source head exacto y la autorización de Paula registrada. Ese commit debe modificar solo el archivo de solicitud.

Después del resultado:

- PASS: consumir solicitud, documentar run/job/artifact/digest y entregar URL para revisión visual;
- HOLD: detener, conservar Hosting anterior si el deploy no ocurrió o declarar con precisión el punto de fallo; no reintentar a ciegas.

## 6. Clasificación

- **Reusable CXOrbia:** overlay financiero de build, gate previo al deploy, smoke remoto y solicitud aislada.
- **Exclusivo cliente:** snapshot y conteos TyA/Cinépolis.
- **Claude/prototipo:** no modifica módulos; P1/P2 continúan separados.
- **Academia:** diferenciar validación técnica, publicación DEV, smoke remoto, revisión visual y freeze.
- **Sin impacto Claude:** workflow, helper, solicitud y evidencias del carril.

## 7. Estado seguro

Sin Hosting nuevo todavía, merge, producción, imports, pagos, Cloud Run deploy, Firestore/Auth/Storage/HR writes, Make o Gemini.
