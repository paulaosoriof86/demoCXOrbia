# ADDENDUM PREVALENTE — I3 B1 TINYFISH SESSION-TRANSPORT EXCEPTION — 2026-10-06

**ID:** `CXORBIA-I3-B1-TINYFISH-SESSION-TRANSPORT-EXCEPTION-20261006`
**Estado:** `FROZEN_PREVALENT_FOR_B1_ONLY`
**Iteración:** `I3 — FUNCTIONAL CLOSURE`
**Bloque:** `B1 — IDENTIDAD SHOPPER + MI DÍA + SHELL IDENTITY`
**Zona horaria operativa:** `America/Guatemala (UTC-06:00)`
**Producción:** `DO_NOT_TOUCH`

## 1. Causa

Después de guardar manualmente dos Browser Context Profiles de TinyFish sobre `https://cxorbia-backend-dev.web.app/`, incluyendo una sesión visible de Administración y una sesión visible de shopper Julissa Flores, TinyFish volvió al login al iniciar automatizaciones nuevas. El perfil de shopper quedó registrado con `0 cookies` y `1 storage origin`; la automatización posterior no restauró la sesión Firebase y reportó ausencia de credenciales de Vault.

La clasificación exacta es `ENVIRONMENT_FAILURE` del transporte/restauración de sesión de TinyFish. No existe evidencia de `AUTH_FAILURE` de CXOrbia: el login manual funcionó, el DEV mostró la identidad correcta y el E2E técnico autenticado pasó.

## 2. BEFORE

La regla incremental de B1 exigía `TINYFISH_PRE_HUMAN_PASS` antes de entregar el DEV a Paula para PASS/FAIL humano.

## 3. AFTER — EXCEPCIÓN FOCAL B1

Para B1 únicamente, TinyFish deja de ser bloqueo previo al checkpoint humano cuando, sobre el mismo DEV, concurren todos estos hechos demostrados:

1. source proof B1 PASS;
2. materialización DEV exacta PASS;
3. E2E técnico autenticado PASS;
4. evidencia humana viva del DEV mostrando la identidad shopper correcta;
5. TinyFish reproduce `ENVIRONMENT_FAILURE` después de que el perfil autenticado fue guardado;
6. no existe evidencia de defecto de producto causada por ese fallo de TinyFish;
7. producción permanece intacta.

Esta excepción NO convierte el resultado TinyFish en PASS. Se registra como `ENVIRONMENT_FAILURE_SESSION_RESTORE`. El checkpoint humano de Paula sigue siendo obligatorio y B1 no queda `BLOCK_LOCKED` hasta recibir PASS explícito.

## 4. Evidencia B1 que habilita el checkpoint humano

- Source B1: `6232caedfcfd1e0136b5ece5f55bfaa0c1b3934a`
- Tree B1: `5ab902bad55e52ef3a06953fbe27eeb70c263fc6`
- Source proof: Run `1275` / `37531710035` / `PASS_B1_CANONICAL_VISIBLE_IDENTITY_SOURCE_PROOF`
- Materialización DEV: Run `1278` / `37536234515` / `PASS_B1_EXACT_DEV_HOSTING_MATERIALIZATION`
- Hosting version: `sites/cxorbia-backend-dev/versions/c4823c13c2679fae`
- Runtime reutilizado: `cxorbia-live-hr-dev-00273-6p9`
- HR revision: `f77e740a8f8c92f48ded256276e03c15594711ce57204381b672d61c19aa9305`
- E2E técnico: Run `1280` / `37536774581`, job `112519775541`, decisión `PASS_I3_PHASEA_REPRESENTATIVE_SAME_ARTIFACT_LIVE_REPROOF`
- E2E Julissa: `Julissa Flores`, visibleLogin `julissa.flores`, `currentVisits=1`, `activeVisits=1`, próxima/activa `C. Miraflores`, histórico propio preservado.
- Controles: Paula Osorio y Priscila López conservaron identidades propias; `duplicateActivePrincipals=0`; `duplicateHrVisitKeys=0`; writes Auth/HR/provider = 0; production=false.
- TinyFish B1: Run `a8f43379-e5ca-42dd-89d8-f4e6c3a63d70` = `ENVIRONMENT_FAILURE: auth_required` después de guardar el perfil autenticado `prof_67673ed0a9194322`.
- Evidencia humana viva: Paula mostró DEV autenticado como Julissa Flores con `Hola, Julissa`, periodo `OCT 2026`, `C. Miraflores`, honorario `Q 60`, acciones `Agendar`, `Instructivo`, `Reprogramar` y ruta/progreso visible.

## 5. Alcance y anti-bucle

- No modifica producto.
- No modifica Auth, HR, Firestore, Storage, runtime ni Hosting.
- No crea otra candidata, rama, workflow, overlay, materializador o metodología.
- No consume `VRM-260`.
- No reabre findings cerrados.
- No aplica automáticamente a B2–B8.
- Producción `https://tya-plataforma.web.app/` permanece `DO_NOT_TOUCH`.

## 6. Autoridad temporal

Toda fecha/hora operativa reportada a Paula se expresa en `America/Guatemala (UTC-06:00)`. Timestamps crudos de GitHub/TinyFish pueden conservarse en UTC como evidencia técnica, pero no se reinterpretan como fecha local.

## 7. Siguiente acción exacta

`PAULA_REVIEW_B1_EXACT_DEV_AND_RETURN_PASS_OR_FAIL`

Si Paula da PASS, crear receipt inmutable B1 y estado `BLOCK_LOCKED`. Si da FAIL, clasificar exclusivamente con la taxonomía Recovery y corregir B1 sobre la misma candidata.
