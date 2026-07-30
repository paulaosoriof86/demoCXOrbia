# ARQUITECTURA-JERARQUIA-TENANT-CUENTA-PROYECTO.md

## Objetivo

Aclarar la lógica comercial y técnica de CXOrbia antes de seguir con seed, adapter y migración real.

## Regla corregida

En CXOrbia, un tenant no equivale a un proyecto de la plataforma.

La jerarquía correcta es:

```text
CXOrbia
└── Tenant / consultora cliente
    └── Cuenta / cliente final / marca administrada por la consultora
        └── Proyecto operativo configurado en la plataforma
            └── Visitas, postulaciones, cuestionarios, evidencias, pagos y reportes
```

## Definiciones

### Tenant

Es la consultora que contrata o usa CXOrbia.

Ejemplos:

- T&A Consultores
- otra consultora futura de mystery shopping
- una firma de field operations

En Firestore:

```text
/tenants/{tenantId}
```

### Cuenta / cliente final

Es la cuenta comercial, marca o cliente final que la consultora administra dentro de CXOrbia.

Ejemplos dentro de T&A:

- Cinépolis
- RIMET
- PUIG
- otra marca o cliente de T&A

En Firestore se usará la colección compatible ya existente:

```text
/tenants/{tenantId}/clients/{accountId}
```

Aunque técnicamente se llame `clients`, en el negocio puede mostrarse como "Cuenta".

### Proyecto operativo

Es el proyecto, campaña, ronda, periodo o programa configurado dentro de la plataforma.

Ejemplos:

- Cinépolis Guatemala Junio 2026 Q1
- Cinépolis Honduras Junio 2026 Q2
- RIMET Adidas Agosto 2026
- PUIG Beauty Advisor Ronda 1

En Firestore:

```text
/tenants/{tenantId}/projects/{projectId}
```

Cada proyecto debe llevar `accountId` o `clientId` para saber a qué cuenta pertenece.

### Visita

Es la unidad operativa ejecutable por shopper/evaluador.

En Firestore:

```text
/tenants/{tenantId}/projects/{projectId}/visits/{visitId}
```

## Ejemplo aplicado a T&A

```text
Tenant: tya
Nombre tenant: T&A Consultores

Cuenta: cinepolis
Nombre cuenta: Cinépolis

Proyecto: cinepolis-gt-junio-2026-q1
Nombre proyecto: Cinépolis Guatemala Junio 2026 Q1

Visitas:
- Sucursal 01 · Guatemala
- Sucursal 02 · Mixco
- Sucursal 03 · Tegucigalpa
```

## Por qué no cambiar `/projects` ahora

El prototipo aprobado ya trabaja alrededor de `CX.data.projects` y `currentProjectId`.

Para no romper módulos ni UI:

- se conserva `/tenants/{tenantId}/projects/{projectId}`;
- cada proyecto incluye `accountId`/`clientId`;
- si luego se necesita vista por cuentas, el adapter puede agrupar proyectos por ese campo;
- no se modifica `/app/modules` desde backend.

## Compatibilidad multi-cliente

Sí, la arquitectura queda lista para migrar más consultoras después de T&A.

Cada consultora debe vivir como tenant separado:

```text
/tenants/tya
/tenants/consultora-demo-2
/tenants/consultora-demo-3
```

Cada tenant tendrá sus propias cuentas, proyectos, shoppers, visitas, documentos y reglas de acceso.

## Reglas de seguridad

Los claims actuales siguen siendo válidos:

```text
role
tenantId
projectIds
shopperId cuando aplica
```

Para una fase posterior se podrá agregar `accountIds` si se requiere permisos por cuenta completa. Por ahora se mantiene `projectIds` porque es más seguro y granular.

## Decisión

La migración inicial de T&A sigue adelante como primer tenant real, pero la estructura no queda amarrada solo a T&A.

La plataforma queda preparada para:

- múltiples tenants/consultoras;
- múltiples cuentas por tenant;
- múltiples proyectos por cuenta;
- permisos por proyecto;
- futura agrupación por cuenta sin romper `CX.data`.
