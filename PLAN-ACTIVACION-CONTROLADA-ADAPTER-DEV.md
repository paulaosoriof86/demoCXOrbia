# PLAN-ACTIVACION-CONTROLADA-ADAPTER-DEV.md

## Objetivo

Preparar el siguiente gate de CXOrbia Backend: activar el adapter Firebase solo en DEV/preview, de forma controlada, sin tocar produccion ni Hosting productivo.

## Estado previo confirmado

- Reglas Firestore DEV publicadas.
- Usuarios DEV ficticios importados.
- Claims/customAttributes DEV validados.
- Seed ficticio TYA cargado en Firestore DEV.
- Lectura del seed ficticio validada con Firebase Web SDK.
- `CX.BACKEND.enabled` sigue en `false`.
- Adapter sigue desactivado.
- Hosting no fue desplegado.
- No hay merge.
- Produccion no fue tocada.

## Lectura del codigo actual

`app/core/backend-config.js` mantiene:

```text
CX.BACKEND.enabled = false
```

`app/core/backend-firebase.js` ya contiene un adapter que:

- no inicia si `CX.BACKEND.enabled !== true`;
- carga proyectos, shoppers, visitas y postulaciones;
- aplica datos sobre `CX.data` sin cambiar la interfaz publica;
- envuelve algunos metodos de `CX.data` para persistir cambios;
- no toca `/app/modules`.

## Riesgo principal antes de activar

El adapter actual carga datos pero no realiza login de usuario. Para que Firestore permita lectura real bajo reglas, debe existir una sesion Firebase Auth activa en la app o debe agregarse un login DEV controlado antes de leer datos.

No se debe activar `CX.BACKEND.enabled=true` directamente en `app/core/backend-config.js` sin resolver este punto, porque podria dejar la UI usando mock/localStorage o emitir errores de permisos.

## Enfoque seguro recomendado

Antes de activar el adapter dentro de la app visible, preparar una variante controlada de validacion:

1. No modificar `/app/modules`.
2. No activar adapter global en produccion.
3. Mantener `CX.BACKEND.enabled=false` en la rama principal de PR #1 hasta gate especifico.
4. Crear un mecanismo DEV/preview que permita probar lectura autenticada sin afectar produccion.
5. Validar que `CX.data.project()`, `CX.data.visitas()`, `CX.data.posts()` y `CX.data.shoppersFor()` sigan funcionando con datos Firestore.
6. Documentar cualquier fallo en `PENDIENTES-PROTOTIPO.md` o `RESUMEN-PARA-CLAUDE.md`, sin parchar modulos UI.

## Alternativas posibles

### Alternativa A — Validacion headless del adapter

Crear un script de prueba que simule `CX.data`, lea Firestore con Firebase Web SDK y verifique que el mapeo esperado del adapter produce la misma forma de datos.

Ventaja: no toca UI ni Hosting.

### Alternativa B — Preview DEV temporal

Crear archivo de configuracion DEV temporal o bandera de querystring para activar backend solo en preview autorizado.

Ventaja: permite ver la app con datos Firestore.

Riesgo: requiere extremo cuidado para no dejar activacion permanente ni tocar produccion.

### Alternativa C — Rama separada de prueba visual

Crear una rama de prueba del adapter donde `enabled=true` solo para preview DEV, nunca para main ni produccion.

Ventaja: separacion clara.

Riesgo: requiere mas coordinacion con preview/Hosting o entorno local.

## Recomendacion

Siguiente gate seguro: validacion headless del adapter contra el seed Firestore DEV, sin activar `CX.BACKEND.enabled`, sin Hosting y sin UI.

Despues de eso, si los datos calzan, preparar preview controlado.

## Autorizacion requerida para siguiente gate

```text
Autorizo validar el adapter Firebase en modo headless contra Firestore DEV, sin activar CX.BACKEND.enabled, sin escribir datos, sin deploy de Hosting, sin merge y sin tocar produccion.
```

## Bloqueos vigentes

- No activar adapter visible.
- No cambiar `CX.BACKEND.enabled` a `true` sin autorizacion especifica.
- No deploy de Hosting.
- No merge.
- No datos reales.
- No produccion.
- No modificar `/app/modules`.
