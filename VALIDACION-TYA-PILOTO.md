# VALIDACION-TYA-PILOTO.md

## Objetivo

Validar el dataset piloto de T&A antes de cualquier carga a Firestore y antes de activar el adapter.

## Estado actual

- Backend DEV: `cxorbia-backend-dev`.
- Tenant piloto: `tya`.
- Proyecto piloto: `tya-piloto`.
- Archivo de seed: `firebase/seed-tya-piloto.json`.
- Adapter: creado pero desactivado con `CX.BACKEND.enabled = false`.
- Deploy: no autorizado.
- Producción: `tya-plataforma.web.app` intacta.

## Validaciones mínimas del seed

### 1. Tenant

Debe existir:

```text
tenant.id = tya
tenant.name = T&A Consultores
tenant.status = dev
```

### 2. Proyecto

Debe existir un proyecto con:

```text
id = tya-piloto
tenantId = tya
countries incluye GT y HN
currency.GT = Q
currency.HN = L
status = dev
```

### 3. Evaluadores

Cada evaluador debe tener:

```text
id
code
nombre
pais
ciudad
estado
```

No debe incluir datos reales, documentos reales, datos bancarios ni teléfonos reales.

### 4. Visitas

Cada visita debe tener:

```text
id
projectId
sucursal
ciudad
pais
currency
quincena
escenario
franja
franjaCode
honorario
estado
```

Estados permitidos:

```text
disponible
postulada
asignada
agendada
realizada
cuestionario
liquidada
fuera_rango
```

Reglas de país/moneda:

```text
GT usa Q
HN usa L
```

### 5. Postulaciones

Cada postulación debe tener:

```text
id
visitaId
projectId
shopperId
estado
```

Además:

- `visitaId` debe existir en visitas.
- `projectId` debe existir en proyectos.
- `shopperId` debe existir en evaluadores.

### 6. Cuestionario

Debe existir al menos un cuestionario demo con:

```text
id
projectId
version
escenario
preguntas
```

## Validaciones de reglas Firestore antes de carga

No cargar el seed hasta probar escenarios de reglas:

| Escenario | Resultado esperado |
|---|---|
| Usuario sin auth lee `/tenants/tya` | Denegado |
| Admin tenant `tya` lee proyecto `tya-piloto` | Permitido |
| Ops tenant `tya` lee visitas | Permitido |
| Shopper sin `projectIds` lee visitas | Denegado o limitado |
| Usuario tenant distinto lee `tya` | Denegado |
| Cliente sin permiso financiero lee finance | Denegado |

## Orden seguro de prueba

1. Revisar seed manualmente.
2. Validar reglas Firestore en DEV.
3. Crear usuario admin DEV.
4. Crear tenant `tya` y proyecto `tya-piloto`.
5. Cargar pocas visitas primero.
6. Confirmar lectura con reglas.
7. Solo después evaluar activar adapter en DEV.

## Prohibiciones

- No cargar datos reales todavía.
- No usar Storage viejo como backend vivo.
- No activar `CX.BACKEND.enabled` en producción.
- No desplegar a `tya-plataforma.web.app`.
- No modificar módulos UI para acomodar el piloto.
