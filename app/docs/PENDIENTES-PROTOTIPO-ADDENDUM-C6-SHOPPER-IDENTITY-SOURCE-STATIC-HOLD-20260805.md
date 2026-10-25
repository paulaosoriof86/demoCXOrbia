# PENDIENTES PROTOTIPO — C6 Shopper Identity Source/Static HOLD

**Fecha:** 2026-08-05

## P0 contractual bloqueante

### Reconciliar pin activo del auditor canónico

```text
Archivo fuente:
tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs

Blob esperado por manifiesto:
8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535

Blob vigente:
80622606ce3635f0d53997a41932b6ced5dc25d4
```

El manifiesto/build-lock activo debe reconciliar exclusivamente ese pin. No tocar runtime, módulos, diseño ni otros blobs.

## Bloques no ejecutados por STOP_RETRY

1. censo read-only de los 340 perfiles;
2. clasificación activo/histórico/elegible/hold;
3. validación de cero colisiones;
4. repair idempotente de Auth DEV;
5. creación de Auth faltantes;
6. normalización de las 30 excepciones de login;
7. normalización de las 28 contraseñas fuera de contrato;
8. claims exactos y readback N/N;
9. login real Staff y Shopper, tres recargas y nueva pestaña;
10. Hosting DEV y gates remotos acumulativos.

## Reglas ya resueltas y no reabrir

- `nombre.apellido / Nombre123*` es el contrato universal de acceso Shopper TyA;
- Shopper no requiere membership en `tenants/tya/users`;
- Paula Staff y Paula Shopper son principals válidos separados;
- cero writes hasta que censo y colisiones den PASS;
- no crear candidata, rama, PR, workflow transportador ni acciones manuales para Paula.

## P1/P2 preservados

- overlay A+B supersedido aún cargado;
- exportación PDF con deuda de gráficas;
- formato XLSX básico.

Estos hallazgos no causaron el HOLD actual.
