# Readiness Dashboard Source-Safe Contract CXOrbia

Fecha: 2026-07-08  
Bloque: readiness dashboard agregado source-safe  
Archivo tecnico: `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs`  
Estado: preview-only, sin runtime real.

## 1. Objetivo

Este contrato prepara un modelo source-safe para representar resultados de contratos, runners y readiness como estados honestos de dashboard.

No ejecuta proveedores reales. No lee fuentes reales. No importa datos. No escribe en Firestore, HR o Storage. No envia correos/WhatsApp. No procesa pagos. No autoriza deploy ni produccion.

## 2. Problema que resuelve

A medida que crecen los contratos backend, Claude/prototipo necesita una forma clara de mostrar avances sin prometer produccion real.

Este contrato define una salida agregada para estados como:

- preview listo;
- diagnostico ejecutado;
- fixture sintetico;
- input sanitizado;
- warning;
- fail;
- pendiente fuente real;
- pendiente gate real;
- pendiente revision humana;
- produccion no autorizada;
- proveedor no activo;
- bloqueado por datos sensibles;
- bloqueado por conflicto;
- solo documental.

## 3. Areas soportadas

El contrato soporta areas de Phase A y patrones reutilizables:

- admin configurability;
- conflict review/import readiness;
- synthetic input pack runner;
- synthetic expanded coverage;
- questionnaire routing;
- visit lifecycle;
- settlement eligibility;
- evidence storage;
- historical import clean;
- assignment sync conflict;
- notification outbox;
- project/tenant rule versioning;
- rule change changelog notification;
- release readiness snapshot;
- Academia;
- sensitive data policy.

## 4. Reglas de seguridad

El manifest debe cumplir:

- `mode = preview_only`;
- `sourceSafe = true`;
- `isSyntheticOrSanitized = true`;
- `containsRawSensitiveData = false`;
- sourceRefs opacas tipo `ref://...`;
- gates reales apagados;
- production/deploy/merge/import/provider writes en falso;
- sin claims prohibidos como production ready, import real, sync real, envio real, pago real, provider activo, deploy realizado, Firestore conectado o HR sincronizada.

## 5. Datos sensibles bloqueados

El contrato detecta campos/claims relacionados con:

- DPI;
- pasaporte;
- banco/cuenta/IBAN/SWIFT;
- NDA firmado;
- firma;
- telefono/WhatsApp/email crudo;
- token/secret/credential/webhook;
- payload/document/file/body/attachment/contact/url raw;
- base64;
- adjuntos;
- privateUrl/signedUrl.

## 6. Impacto Phase A

El contrato ayuda a avanzar Phase A porque permite mostrar readiness agregado sin activar operacion real.

Areas Phase A que se pueden representar:

- HR/plataforma sync;
- import historico limpio;
- shoppers historicos;
- certificaciones ya presentadas;
- liquidaciones/pagos;
- cuestionario configurable;
- evidencias;
- Make/Gemini futuros con gate;
- conflict review;
- admin configurability.

## 7. Impacto Claude/prototipo

Claude debe usar este patron si implementa un dashboard de readiness:

- mostrar area;
- mostrar estado preview;
- mostrar sourceRef opaca;
- mostrar gate apagado;
- mostrar revision humana cuando aplique;
- mostrar motivo de bloqueo o warning;
- no mostrar produccion lista ni integraciones reales activas.

## 8. Impacto Academia

Academia debe explicar:

- que es un readiness dashboard;
- diferencia entre preview y ejecucion real;
- diferencia entre fixture sintetico, input sanitizado y fuente real;
- que significa gate apagado;
- cuando aplica revision humana;
- por que no se debe mostrar import/sync/pago/envio real si solo existe preview;
- como leer errores, warnings y blockers.

## 9. Clasificacion obligatoria

- Reusable CXOrbia: si. Modelo reusable de dashboard source-safe para cualquier tenant/proyecto.
- Exclusivo cliente: no. TyA/Phase A puede usar items especificos, pero el contrato no hardcodea cliente.
- Claude/prototipo: si. Debe reflejarse como UX honesta de readiness/gates.
- Academia: si. Requiere manuales/cursos/checklists por rol.
- Sin impacto Claude: no toca UI directamente, pero si genera pendiente de prototipo.

## 10. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles.
