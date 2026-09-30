# CAMBIOS BACKEND — C6 canonical HEAD, Shopper PASS y Finanzas STOP_RETRY

**Fecha:** 2026-08-02  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Claude/prototipo · Academia · Sin impacto proveedor adicional

## 1. Macro-bloque autorizado

Se ejecutó el macro-bloque C6 sobre el source lock `69afc8227762cbb16ac5a3af87072c2f1cc88198`:

1. source lock exacto de `app` y `tools/qa`;
2. gate estático acumulativo;
3. gate estático del root fix Shopper nueva pestaña;
4. un único deploy Hosting DEV;
5. paridad remota y HR viva;
6. Staff;
7. Shopper con tres recargas, nueva pestaña, identidad exacta y visitas propias;
8. Cliente;
9. gate combinado de dominio, Finanzas, portales y Reservas;
10. evidencia y STOP_RETRY ante fallo.

## 2. Archivos tocados

- `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`: runner de un solo deploy y gates acumulativos con STOP_RETRY.
- `backend/config/corte6-live-domain-readonly-audit-request.json`: autorización consumida y resultado exacto.
- `app/docs/evidence/CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`: source lock.
- `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`: evidencia integral del corte.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`: checkpoint actualizado.
- Este addendum.

## 3. Resultado aprobado

- source lock exacto: PASS;
- runtime acumulativo estático: PASS;
- root fix Shopper nueva pestaña estático: PASS;
- Hosting DEV: un deploy exitoso;
- paridad remota: PASS;
- HR viva: PASS, 14 periodos y 616 visitas;
- Staff: PASS;
- Shopper: PASS, tres recargas, nueva pestaña, `ownVisits=1`;
- Cliente: PASS.

El P0 de recuperación de autoridad protegida en nueva pestaña queda demostrado como corregido remotamente.

## 4. Resultado bloqueante

El gate combinado se detuvo en la primera aserción financiera:

- objetos canónicos: directo / facturación local / regalía 10;
- configuración de proyecto: delegado / coordinación / regalía 0.

Clasificación de causa raíz:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`

No se ejecutó un segundo deploy. El gate no alcanzó una validación final de Portal Cliente, Portal Shopper y Reservas dentro de esa ejecución porque se detuvo antes por Finanzas.

## 5. Reusable CXOrbia

- Toda configuración financiera debe materializarse en los objetos canónicos antes de normalizar.
- Un marcador global no puede contradecir el proyecto/periodo que consumen módulos y reportes.
- Debe existir un gate predeploy de consistencia entre configuración, objeto canónico y salida financiera.

## 6. Exclusivo TyA

- Cinépolis opera como proyecto delegado.
- Honorarios: Q60 GT y L200 HN.
- Regalías: 0.
- Comisión y reparto: configurables y no inventados.

## 7. Claude/prototipo

No cambiar UI. El hallazgo es de precedencia/materialización en adapters. Claude no debe hardcodear Cinépolis ni resolverlo con copy o parche visual.

## 8. Academia

Actualizar el contenido para explicar:

- diferencia entre marcador de configuración y objeto canónico;
- orden correcto: configuración → materialización → normalización → consumo;
- por qué dos verdades financieras simultáneas son un bloqueo;
- por qué un PASS de Auth/HR no implica PASS financiero.

## 9. Estado seguro

Hosting DEV del macro-bloque: 1. Segundo deploy: 0. Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0. Merge=false. Producción=false. STOP_RETRY activo.
