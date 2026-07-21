# IMPORTACION-TYA-PILOTO.md

## Objetivo

Preparar la primera carga controlada de T&A Consultores como tenant real de CXOrbia, sin contaminar el prototipo comercializable y sin conectar la base anterior como backend vivo.

## Alcance del piloto

El piloto debe ser pequeño y verificable:

- 1 tenant: `tya`
- 1 proyecto operativo de prueba
- 8 a 10 visitas
- 3 a 5 evaluadores ficticios o anonimizados
- 2 a 4 postulaciones
- 1 cuestionario base
- 0 evidencias reales
- 0 datos bancarios reales
- 0 documentos privados

## Estructura esperada en Firestore

```text
/tenants/tya
/tenants/tya/users/{uid}
/tenants/tya/shoppers/{shopperId}
/tenants/tya/projects/{projectId}
/tenants/tya/projects/{projectId}/visits/{visitId}
/tenants/tya/projects/{projectId}/postulations/{postulationId}
/tenants/tya/projects/{projectId}/questionnaires/{questionnaireId}
/tenants/tya/projects/{projectId}/responses/{responseId}
/tenants/tya/projects/{projectId}/liquidations/{liquidationId}
/tenants/tya/projects/{projectId}/lots/{lotId}
/tenants/tya/projects/{projectId}/finance/{movementId}
/tenants/tya/projects/{projectId}/documents/{documentId}
/tenants/tya/projects/{projectId}/certifications/{certificationId}
/tenants/tya/notifications/{notificationId}
/tenants/tya/automations/{automationId}
/tenants/tya/auditLogs/{logId}
```

## Convenciones del piloto

### Tenant

```json
{
  "id": "tya",
  "name": "T&A Consultores",
  "type": "clientTenant",
  "status": "dev",
  "countryBase": "GT",
  "createdFrom": "cxorbia-prototype"
}
```

### Project

Campos mínimos:

```json
{
  "id": "tya-piloto",
  "tenantId": "tya",
  "name": "Piloto T&A",
  "client": "Cliente Demo T&A",
  "industry": "Mystery shopping",
  "countries": ["GT", "HN"],
  "currency": {"GT": "Q", "HN": "L"},
  "accent": "#2196d3",
  "quincenas": ["Quincena 1", "Quincena 2"],
  "scenarios": ["Escenario demo"],
  "status": "dev"
}
```

### Shopper

No incluir datos reales en piloto. Usar:

```json
{
  "id": "eval-01",
  "code": "EVL-01",
  "nombre": "Evaluador 01",
  "pais": "GT",
  "ciudad": "Guatemala",
  "estado": "Activo",
  "rating": 4.5,
  "perfilCompleto": true
}
```

### Visit

Campos mínimos compatibles con `CX.data`:

```json
{
  "id": "tya-piloto-v01",
  "projectId": "tya-piloto",
  "sucursal": "Sucursal 01 · Guatemala",
  "ciudad": "Guatemala",
  "pais": "GT",
  "currency": "Q",
  "quincena": "Quincena 1",
  "escenario": "Escenario demo",
  "franja": "Semana",
  "franjaCode": "WK",
  "honorario": 60,
  "boleto": 0,
  "combo": "Reembolso demo",
  "comboAmt": 0,
  "estado": "disponible",
  "shopperId": null,
  "shopper": null,
  "rango": "Piloto",
  "disponibleDesde": "2026-06-27"
}
```

## Validaciones antes de activar adapter

1. Firestore Rules publicadas solo en DEV.
2. Auth Email/Password activo.
3. Usuario admin DEV creado y con claims/perfil compatible.
4. Tenant `tya` creado.
5. Proyecto piloto creado.
6. Visitas piloto cargadas.
7. `CX.BACKEND.enabled` sigue en `false` hasta validar estructura.
8. No hay deploy a `tya-plataforma.web.app`.
9. No hay datos reales ni evidencias reales.

## Orden de activación segura

1. Validar reglas en Firebase Console o emulador.
2. Cargar piloto mínimo.
3. Probar adapter en preview o entorno local.
4. Revisar consola y eventos `backend-ready` / `backend-error`.
5. Confirmar que KPIs, visitas, shoppers y postulaciones renderizan.
6. Documentar hallazgos en `PENDIENTES-PROTOTIPO.md`.
7. Solo después decidir si se amplía la importación.

## Regla de no contaminación

T&A se modela como tenant `tya`. El prototipo CXOrbia debe seguir siendo genérico, comercializable y preparado para futuros tenants.
