# Claude - patrones reutilizables backend/producto CXOrbia

Fecha: 2026-07-07

## Objetivo

Separar lo reutilizable para el prototipo comercializable CXOrbia de lo exclusivo de TyA.

Este documento debe incorporarse en el proximo paquete para Claude cuando retome capacidad, porque resume arquitectura, contratos, patrones de producto y reglas reutilizables que no deben quedarse solo como decisiones backend.

## Principio general

El backend se construye para TyA como primer cliente operativo, pero el prototipo debe quedar preparado para futuros clientes multi-tenant.

Por eso, toda regla backend reutilizable debe convertirse en patron de producto visible o configurable cuando aplique, sin contaminar el frontend con logica backend ni con reglas exclusivas de TyA.

## Reutilizable para todos los clientes

### 1. Multi-tenant y multi-proyecto

Todo modelo debe poder operar con:

- `tenantId`
- `projectId`
- configuracion por proyecto
- pais
- moneda
- origen de datos
- cuestionario/origen
- documentos requeridos
- reglas de agendamiento
- reglas de cancelacion/reprogramacion
- reglas de certificacion
- reglas de pagos
- integraciones configurables

Claude debe evitar hardcodear Cinépolis o TyA como unica logica de producto.

### 2. Contrato CX.data estable

La interfaz `CX.data` manda.

El prototipo debe seguir funcionando aunque el origen cambie de localStorage a backend real.

Claude no debe reescribir modulos para llamar proveedores directamente.

Cuando algo requiera backend, debe exponerse mediante adaptadores/contratos, no mediante parches dentro de UI.

### 3. Estados honestos de backend

La UI debe distinguir claramente:

- preview
- simulado
- bloqueado
- pendiente backend
- pendiente autorizacion
- listo para gate
- ejecutado real
- error/revision

No debe prometer que algo fue enviado, sincronizado, importado o pagado si el backend real no esta activo.

### 4. Gates por fase

Los flujos deben respetar gates:

- DEV preview
- DEV import controlado
- staging/preview
- produccion controlada
- produccion real

No se deben activar integraciones reales sin gate explicito.

### 5. Configuracion sensible fuera del repo

No dejar en repo:

- API keys reales
- service accounts
- webhooks Make reales
- tokens
- credenciales
- datos sensibles

El prototipo debe poder mostrar estado de configuracion sin exponer secretos.

### 6. Smoke visual y tecnico como producto reusable

Los checks creados no son solo TyA.

Deben considerarse patron general para cada cliente:

- smoke tecnico de scripts/rutas
- smoke visual/consola por roles
- predeploy gate
- drift gate
- staging gate
- checklist post-staging

Claude debe mantener pantallas y rutas testeables por rol.

### 7. Outbox para integraciones

Las integraciones no deben dispararse directo desde modulos UI.

Debe existir un contrato outbox con:

- `eventId`
- `tenantId`
- `projectId`
- `visitId` o identificador externo equivalente
- `direction`
- `assignmentSource`
- `assignmentSyncStatus`
- `correlationId`
- `createdAt`
- `shopperId` cuando aplique

El outbox permite auditoria, reintentos, revision humana y trazabilidad.

### 8. Sincronizacion plataforma ↔ fuente externa

El patron reutilizable aplica a HR, Google Sheets, CRM externo u otra fuente del cliente.

Reglas:

- no deduplicar por coincidencia visual simple;
- usar llaves estables;
- no sobrescribir silenciosamente;
- conflicto a revision humana;
- trazabilidad de origen;
- idempotencia pendiente antes de produccion real.

### 9. Review humana como patron

Cuando hay conflicto, dato incompleto, llave faltante, certificacion dudosa, pago incierto o integracion inconsistente, el estado correcto es revision humana.

Claude debe poder representar estados de revision sin asumir que todo se resuelve automaticamente.

### 10. Academia como modulo transversal

Cada cambio backend que afecte flujo operativo debe considerar Academia:

- manuales
- cursos
- rutas por rol
- certificaciones
- notificaciones
- estados pendientes
- cambios de reglas por proyecto

Claude debe evitar que Academia quede como contenido estatico desconectado de reglas configurables.

### 11. Copy de integraciones reales

El prototipo debe usar copy honesto:

- pendiente de envio
- envio simulado
- listo para gate
- bloqueado por configuracion
- requiere revision
- enviado real solo si existe evidencia backend

Este patron es reusable para WhatsApp, email, Make, HR, pagos, cuestionarios e imports.

### 12. Staging controlado antes de produccion

Todo cliente futuro debe poder pasar por:

- preview/staging controlado
- integraciones apagadas
- validacion visual por roles
- validacion de consola
- post-staging checklist
- decision explicita antes de produccion real

## Exclusivo TyA, no generalizar

No convertir en patron universal:

- Cinépolis como proyecto unico;
- reglas Q1/Q2 especificas;
- liquidaciones TyA;
- HR TyA como unica fuente posible;
- certificaciones especificas de Cinépolis;
- shopper historico TyA;
- reglas de pagos TyA;
- textos operativos exclusivos TyA.

Estos elementos deben vivir como configuracion de cliente/proyecto, no como logica base del producto.

## Pendientes para Claude en proximo paquete

Claude debe revisar e incorporar en prototipo comercializable:

1. Componentes/estados visuales para backend gates reutilizables.
2. Estados honestos de integracion sin promesas reales.
3. Vistas o badges de configuracion por tenant/proyecto.
4. Representacion visual de conflictos/revision humana cuando el backend exponga esos estados.
5. Academia conectada a reglas configurables por proyecto/rol.
6. Mensajes genericos para integraciones: listo, bloqueado, pendiente, simulado, real.
7. Evitar hardcodes TyA/Cinépolis en modulos reutilizables.
8. Mantener `CX.data` como contrato estable.

## Estado actual

Este documento no ejecuta backend, no cambia UI y no activa integraciones.

Sirve para paquete Claude y para continuidad de producto CXOrbia multi-cliente.
