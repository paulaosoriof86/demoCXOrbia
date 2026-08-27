# ARQUITECTURA-TENANTS-TYA.md

## Decisión de arquitectura

`paulaosoriof86/demoCXOrbia` es el repo del prototipo modular aprobado y seguirá siendo la base de la plataforma comercializable CXOrbia.

T&A Consultores no debe convertirse en lógica fija del prototipo. T&A será el primer cliente/tenant real que usa la plataforma, con sus datos, reglas, configuración, usuarios y migración dentro de la base nueva.

## Separación obligatoria

| Capa | Qué representa | Qué NO debe pasar |
|---|---|---|
| Prototipo / producto CXOrbia | Core comercializable, módulos genéricos, navegación, UX, modelo SaaS multi-tenant | No hardcodear T&A, Cinépolis, shoppers reales, URLs de producción ni datos privados en módulos |
| Tenant T&A | Primer cliente real sobre CXOrbia | No mezclar datos de T&A con datos demo/comerciales |
| Proyecto dentro de T&A | Campañas o clientes finales de T&A, por ejemplo retail, cine, indumentaria, PUIG, RIMET | No mezclar países, monedas ni reglas entre proyectos |
| Backend DEV `cxorbia-backend-dev` | Base nueva para construir y probar adapter, reglas, auth, importación | No usarlo como producción sin autorización |
| Hosting producción `tya-plataforma.web.app` | URL actual usada por shoppers de T&A | No tocar ni desplegar sin autorización expresa |

## Modelo recomendado en Firestore

```text
/tenants/tya
/tenants/tya/users/{uid}
/tenants/tya/projects/{projectId}
/tenants/tya/projects/{projectId}/visits/{visitId}
/tenants/tya/projects/{projectId}/postulations/{postulationId}
/tenants/tya/projects/{projectId}/questionnaires/{questionnaireId}
/tenants/tya/projects/{projectId}/responses/{responseId}
/tenants/tya/projects/{projectId}/liquidations/{liquidationId}
/tenants/tya/projects/{projectId}/documents/{documentId}
/tenants/tya/projects/{projectId}/certifications/{certificationId}
```

Futuros clientes usarán otros tenants:

```text
/tenants/cliente-demo
/tenants/cliente-2
/tenants/cliente-3
```

## Reglas para el adapter backend

1. Mantener `CX.data` como interfaz estable.
2. No modificar `/app/modules`.
3. No hardcodear T&A dentro de `core/data.js` ni módulos.
4. Crear archivos nuevos de backend, por ejemplo `app/core/backend-config.js` y `app/core/backend-firebase.js`.
5. El tenant activo debe venir de configuración o sesión, no de lógica dispersa.
6. El `projectId` seguirá siendo el filtro principal de operación.
7. Los datos reales de T&A entran por importación limpia, nunca conectando la base vieja como backend vivo.

## Configuración esperada para T&A

```text
tenantId: tya
cliente/plataforma: T&A Consultores
hosting actual: https://tya-plataforma.web.app/
backend DEV nuevo: cxorbia-backend-dev
storage: pendiente por Blaze
estado deploy: no autorizado
```

## Principio operativo

El prototipo sigue evolucionando como producto comercializable. T&A es el primer caso real que valida el modelo SaaS multi-tenant, pero no debe contaminar la arquitectura genérica ni limitar futuros clientes.
