# CAMBIOS BACKEND — Portal Shopper canónico Corte 6

**Fecha:** 2026-07-31  
**Estado:** CODE PASS / CONTRACT GATE PENDIENTE DE EVIDENCIA REMOTA / PENDIENTE HOSTING DEV

## 1. Hallazgo raíz
La pantalla `Mi Perfil` y el portal Shopper continuaban consumiendo estados literales antiguos y un universo parcial:
- los drills de realizada/liquidada/en curso usaban listas fijas de `estado`;
- `Mis Visitas` elegía como máximo una visita por estado;
- la sesión conservaba el ID vivo aunque el perfil protegido exacto estuviera bajo el ID canónico;
- usuario, contraseña, WhatsApp, certificación e histórico podían quedar repartidos entre identidades distintas;
- el perfil podía figurar completo por un flag heredado sin contener los campos mínimos.

La evidencia visual fue `Activas 1 / Historial 0 / Beneficios vacío` para una persona que en Admin mostraba seis visitas.

## 2. Solución aplicada en rama viva
Nuevo `app/adapters/tya-canonical-shopper-portal-v2.js`:
- resuelve la sesión por `CX.data.__identityMap` exacto;
- usa todas las visitas de `visitsForShopper(id,false)`, sin reducir a una por estado;
- muestra histórico completo con estados derivados de `canonicalFacets`;
- separa vistas Todas, Activas, Realizadas, Submitidas y Pagadas;
- presenta usuario, contraseña, WhatsApp, correo y certificación del perfil exacto;
- calcula completitud con el contrato real vigente;
- no inventa contacto ni credenciales faltantes;
- no ejecuta `updateShopper`, Firebase, Auth, fetch ni provider writes;
- sustituye el copy genérico de “evaluador” por el contexto Shopper donde corresponde al portal.

`app/index-backend-dev.html` quedó conectado para cargar este adapter después del bridge de dominio y antes del arranque.

## 3. Gate reusable
Nuevo `tools/qa/tya-c6-shopper-portal-contract-gate.mjs` verifica:
- sintaxis;
- identidad exacta;
- histórico completo sin `.find()` por estado;
- facetas canónicas;
- credenciales/contacto/certificación visibles desde el perfil exacto;
- categorías activas/submitidas/pagadas;
- ausencia de profile/Auth/HR writes;
- ausencia de dedupe por nombre/teléfono/email.

El workflow read-only de Corte6 fue ampliado para exigir este gate junto con dominio, finanzas y auditoría HR viva.

## 4. Límites honestos
El adapter hace visible lo que ya existe en la fuente protegida exacta. Si WhatsApp o cualquier dato no está en HR/perfil protegido, muestra `— sin dato`; no lo fabrica.

Crear o complementar datos persistentes, credenciales Auth o perfiles Firestore requerirá un inventario, write plan, dry-run y autorización específica posterior.

## 5. Impacto Phase A
Recupera el contrato ya aprobado de una sola identidad con:
- perfil;
- acceso;
- certificación;
- histórico;
- visitas activas;
- liquidaciones y beneficios.

Aún no se declara PASS visual porque el nuevo adapter no está publicado en Hosting DEV.

## 6. Claude/prototipo
Claude debe implementar nativamente:
- sesión→identidad canónica;
- histórico completo, no una visita por estado;
- facetas compartidas con Admin;
- certificación visible según rol;
- completitud calculada por campos;
- datos faltantes honestos y review queue separada.

No debe copiarse como parche de módulo; el contrato debe formar parte del prototipo comercializable y autoadministrable.

## 7. Estado seguro
Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; merge=false; producción=false.
