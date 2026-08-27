# VALIDACION-ESTATICA-REGLAS-ADAPTER.md

## Objetivo

Revisar de forma estática la compatibilidad entre:

```text
firestore.rules
firebase/seed-tya-piloto.json
app/core/backend-firebase.js
```

Esta revisión no publica reglas, no conecta Firebase, no ejecuta seed y no toca producción.

## Resultado general

Validación estática: parcialmente aprobada, con un ajuste aplicado en reglas.

## Hallazgo 1 — Shopper y visitas disponibles

Antes del ajuste, el shopper solo podía leer visitas propias por `shopperId`. Eso podía bloquear el módulo de visitas disponibles, porque una visita disponible normalmente todavía no tiene shopper asignado.

## Ajuste aplicado

Se agregó una función en `firestore.rules`:

```text
isAvailableVisitForShopper(projectId)
```

Y se permitió lectura de visitas disponibles al shopper cuando:

```text
role == shopper
projectId está en projectIds
estado == disponible
```

Esto conserva aislamiento por tenant/proyecto y habilita el flujo de postulación.

## Hallazgo 2 — Rutas del seed

El seed ficticio usa rutas compatibles con el modelo previsto:

```text
/tenants/tya
/tenants/tya/shoppers/{id}
/tenants/tya/projects/tya-piloto
/tenants/tya/projects/tya-piloto/visits/{id}
/tenants/tya/projects/tya-piloto/postulations/{id}
/tenants/tya/projects/tya-piloto/questionnaires/{id}
```

## Hallazgo 3 — Adapter desactivado

El adapter sigue seguro porque:

```text
CX.BACKEND.enabled = false
```

Aunque el archivo exista, no inicializa Firebase ni reemplaza datos mientras esté desactivado.

## Hallazgo 4 — SDK Firebase

Cuando se active el adapter, todavía faltará cargar Firebase SDK compat en un entorno controlado.

Esto no debe hacerse en producción ni mezclarse con datos reales.

## Pendiente de validación real

Las reglas aún deben probarse en DEV o Rules Playground con:

```text
CASOS-PRUEBA-FIRESTORE.md
```

## Estado posterior

```text
Reglas publicadas: no
Seed escrito: no
Firebase conectado por app: no
Producción tocada: no
Adapter activo: no
```
