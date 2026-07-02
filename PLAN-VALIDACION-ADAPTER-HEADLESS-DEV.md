# PLAN-VALIDACION-ADAPTER-HEADLESS-DEV.md

## Autorizacion recibida

Paula autorizo validar el adapter Firebase en modo headless contra Firestore DEV, sin activar `CX.BACKEND.enabled`, sin escribir datos, sin deploy de Hosting, sin merge y sin tocar produccion.

## Objetivo

Validar que los datos cargados en Firestore DEV pueden tomar la forma esperada por `CX.data` antes de activar el adapter visible en la aplicacion.

## Alcance permitido

- Leer Firestore DEV con usuario DEV ficticio.
- Simular en memoria la carga equivalente del adapter.
- Verificar estructura compatible con `CX.data`.
- Confirmar que `CX.BACKEND.enabled` sigue en `false`.

## Alcance bloqueado

- No activar `CX.BACKEND.enabled`.
- No escribir datos.
- No hacer deploy de Hosting.
- No hacer merge.
- No tocar produccion.
- No modificar `/app/modules`.

## Script preparado

```text
firebase/client-write-tools/validate-adapter-headless-dev-sdk.mjs
```

## Validaciones esperadas

- `CX.BACKEND.enabled` observado en `false`.
- Login DEV ficticio OK.
- Proyecto actual: `tya-piloto`.
- Proyectos: 1.
- Shoppers: 4.
- Visitas filtradas: 8.
- Postulaciones filtradas: 3.
- Shoppers filtrados: 4.
- `CX.data.project()` equivalente funciona.
- `CX.data.visitas()` equivalente funciona.
- `CX.data.posts()` equivalente funciona.
- `CX.data.shoppersFor()` equivalente funciona.

## Criterio de cierre

```text
Validaciones adapter headless: OK
== Adapter headless Firestore DEV finalizado ==
```

## Siguiente gate posible

Si esta validacion queda correcta, preparar preview controlado del adapter. Ese siguiente gate requiere autorizacion separada y no debe tocar produccion.
