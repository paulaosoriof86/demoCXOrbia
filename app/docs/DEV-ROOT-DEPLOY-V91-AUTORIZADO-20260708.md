# DEV root V91 autorizado

Fecha: 2026-07-08

## URL de validacion

Validar V91 en:

`https://cxorbia-backend-dev.web.app`

No validar V91 todavia en:

`https://tya-plataforma.web.app`

Ese dominio queda para el reemplazo final cuando Paula de GO de produccion.

## Cambio aplicado

Se actualizo `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml` para publicar Hosting DEV root:

- projectId: `cxorbia-backend-dev`
- target: `cxorbia-dev`
- channelId: `live`

## Alcance

Solo Hosting DEV. Sin base real, sin imports, sin pagos, sin HR writes, sin Make/Gemini reales y sin produccion final.

## Checklist minimo

En DEV root revisar:

1. Login/admin.
2. Dashboard.
3. Postulaciones.
4. Reservas.
5. Automatizaciones.
6. Cuestionario shopper.
7. Finanzas.
8. Academia.
9. Diagnostico & Readiness.
10. Administrabilidad.
11. Acciones admin visibles en Academia.
12. Crear con IA en preview sin Gemini real.
13. Sin copy de envio/sync/pago real.
14. Sin errores JS criticos.

## Si falla

Reportar modulo y error exacto. Solo se corrige causa raiz.
