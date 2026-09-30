# PENDIENTES PROTOTIPO — C6 DEV root funcional PASS y HOLD de higiene QA

**Fecha:** 2026-08-05

## Cerrado funcionalmente

- el dominio raíz DEV redirige a la entrada canónica;
- paridad raíz/canónica: PASS exacto;
- Staff: PASS;
- Shopper: PASS;
- Cliente y Portal Cliente: PASS;
- Portal Shopper: PASS;
- Finanzas: PASS;
- Reservas: PASS.

## Pendiente inmediato

Validación humana de la release DEV existente desde:

```text
https://cxorbia-backend-dev.web.app/
```

No requiere ni autoriza otro deploy.

## Pendiente técnico no funcional

El guard de limpieza del wrapper debe ignorar o excluir el archivo efímero `gha-creds-*.json` creado por `google-github-actions/auth`, o ejecutar la aserción después del cleanup de la acción.

```text
OWNER=BACKEND_QA_WORKFLOW
CLASSIFICATION=QA_WORKFLOW_HYGIENE_ONLY
PRODUCT_CHANGE_REQUIRED=false
DEPLOY_REQUIRED=false
```

Este ajuste necesita un bloque source-only separado. No debe reabrir el P0 del entrypoint ni repetir Hosting.

## STOP_RETRY vigente

- request consumido;
- reintentos: `0`;
- segundo deploy: `0`;
- deploy adicional autorizado: `0`.

## Deuda P1/P2 preservada

- PDF: algunas exportaciones todavía pueden omitir gráficas;
- Excel: presentación visual básica.

Estas deudas no invalidan el redirect raíz ni los gates funcionales obtenidos.
