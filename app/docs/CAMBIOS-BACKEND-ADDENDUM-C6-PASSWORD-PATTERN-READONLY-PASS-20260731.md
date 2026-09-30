# CAMBIOS-BACKEND — Corte 6 · verificación source-safe de patrón de contraseña inicial

**Fecha:** 2026-07-31  
**Estado:** `C6_PASSWORD_PATTERN_READONLY_PASS__68_VERIFIED__20_NONPATTERN__NO_WRITE__NO_PRODUCTION`

## Objetivo
Comprobar, sin exportar passwords ni hashes, cuántas credenciales exactas del handoff cifrado siguen el patrón histórico TyA `Nombre123*`.

## Método
- descifrado del handoff solo en memoria;
- match exclusivamente por `legacyShopperId` exacto;
- primer nombre tomado del perfil canónico correspondiente;
- candidato `CapitalizedFirstName + 123*`;
- comparación SHA256/1 round contra el hash legado ya usado para continuidad Auth;
- evidencia final solo con conteos.

## Resultado
- shopper records en bundle:109;
- exact legacy match:88;
- nombre disponible:88;
- patrón inicial verificado criptográficamente: **68**;
- exactos que NO siguen ese patrón: **20**;
- legacy missing:21;
- ambiguos0;
- hashes inválidos0.

## Consecuencia de producto
No es correcto mostrar `Nombre123*` como contraseña universal: sería falso para 20 de los 88 perfiles exactos.

Para Superadmin:
- username exacto: sí, una vez materializado desde el delta88;
- estado de credencial: sí;
- para 68 puede mostrarse `Patrón inicial verificado` sin persistir plaintext;
- para 20 debe preservarse la credencial histórica existente o realizar reset controlado, nunca inventar el patrón.

Si se necesita revelar la contraseña actual, debe recuperarse desde la fuente segura original y protegerse como secreto; Firebase Auth no permite leerla. Un reset masivo tampoco se ejecuta sin autorización Auth específica.

## Seguridad
Provider reads sí. Firestore/Auth/HR/legacy writes0; password changes0; password plaintext/hashes exportados0; deploys0; merge=false; producción=false.

Evidencia: `app/docs/evidence/CORTE6-INITIAL-PASSWORD-PATTERN-READONLY-LATEST.json`.
