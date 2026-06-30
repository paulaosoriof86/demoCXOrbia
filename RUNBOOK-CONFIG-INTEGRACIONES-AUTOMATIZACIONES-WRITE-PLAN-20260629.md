# RUNBOOK-CONFIG-INTEGRACIONES-AUTOMATIZACIONES-WRITE-PLAN-20260629

## Objetivo

Cerrar el ciclo dry-run para Configuración, Integraciones & Add-ons y Automatizaciones antes de cualquier escritura Firestore DEV.

## Scripts del bloque

```text
firebase/client-write-tools/build-config-integrations-automation-write-plan-dry-run.mjs
firebase/client-write-tools/validate-config-integrations-automation-write-plan.mjs
```

## Flujo completo recomendado

```text
node firebase/client-write-tools/build-config-integrations-automation-dry-run.mjs
node firebase/client-write-tools/validate-config-integrations-automation-dry-run.mjs
node firebase/client-write-tools/build-config-integrations-automation-write-plan-dry-run.mjs
node firebase/client-write-tools/validate-config-integrations-automation-write-plan.mjs
```

## Salidas

```text
firebase/private-output/config-integrations-automation-dry-run.json
firebase/private-output/config-integrations-automation-validation.json
firebase/private-output/config-integrations-automation-write-plan-dry-run.json
firebase/private-output/config-integrations-automation-write-plan-validation.json
```

## Qué se prepara

- Catálogo global de integraciones.
- Configuración inicial de tenant.
- Configuración inicial de proyecto plantilla.
- Estado draft de integraciones por tenant.
- Automation rules inactivas.
- AI config inactiva sin proveedor.
- Audit logs sanitizados.

## Qué NO se prepara todavía

- Secretos reales.
- Tokens OAuth.
- API keys.
- Webhooks activos.
- Integraciones activas.
- Automatizaciones reales.
- Conexión Storage/evidencias/logo.

## Gates antes de carga Firestore DEV

1. Validación del dry-run en OK o REVIEW aceptado.
2. Validación del write-plan en OK o REVIEW aceptado.
3. Reglas Firestore DEV revisadas.
4. Confirmación de que no contiene secretos.
5. Confirmación de que las automatizaciones arrancan inactivas.
6. Autorización explícita de Paula para carga DEV.

## Restricciones

- Sin escritura Firestore.
- Sin publicar reglas.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin modificar frontend.
