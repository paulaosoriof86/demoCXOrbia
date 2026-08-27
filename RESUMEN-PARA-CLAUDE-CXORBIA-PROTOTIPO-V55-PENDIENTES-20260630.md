# RESUMEN-PARA-CLAUDE-CXORBIA-PROTOTIPO-V55-PENDIENTES-20260630

## Contexto

Paula compartió el ZIP `Prototype development request CXOrbia V55.zip` y la bitácora `CAMBIOS-PROTOTIPO.md` para continuar la migración backend sin perder las mejoras recientes del prototipo.

Este documento NO es para aplicar código backend. Es para que Claude/frontend continúe mejorando el prototipo sin tocar backend y para que mantenga sincronía con la migración Firebase DEV.

## Regla vigente

No tocar ni sobrescribir backend:

```text
firebase/**
firestore.rules
storage.rules
firebase.json
.firebaserc
app/core/backend-config.js
app/core/backend-config-preview-dev.js
app/core/backend-firebase.js
app/core/backend-finance-benefits.js
app/core/backend-operational-actions.js
app/core/backend-cxdata-finance-read.js
app/index-backend-dev.html
CAMBIOS-BACKEND.md
RUNBOOK-*.md
RESULTADO-*.md
firebase/schema/**
firebase/contracts/**
```

Claude puede trabajar en el prototipo/frontend, pero debe documentar cambios en:

```text
CAMBIOS-PROTOTIPO.md
PENDIENTES-PROTOTIPO.md
CHECKLIST-VALIDACION-PROTOTIPO.md
RESUMEN-PARA-CHATGPT-BACKEND.md
```

## Revisión del ZIP V55

El ZIP V55 contiene 85 archivos. Frente a V52:

### Archivos nuevos detectados

```text
app/core/manuales-data.js
app/docs/CAMBIOS-PROTOTIPO.md
app/docs/CHECKLIST-VALIDACION-PROTOTIPO.md
app/docs/PENDIENTES-PROTOTIPO.md
app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md
app/sw.js
```

### Archivos modificados detectados

```text
app/app.js
app/core/automations.js
app/core/config.js
app/core/finanzas-core.js
app/index.html
app/modules/academia.js
app/modules/automatizaciones.js
app/modules/beneficios.js
app/modules/cert.js
app/modules/clientes.js
app/modules/comercial.js
app/modules/crm.js
app/modules/documentos.js
app/modules/finanzas.js
app/modules/importador.js
app/modules/integraciones.js
app/modules/marketing.js
app/modules/midia.js
app/modules/misvisitas.js
app/modules/operacion-extra.js
app/modules/postulaciones.js
app/modules/proyectos.js
app/modules/soporte.js
app/styles/layout.css
```

## Mejoras V55 que ya deben considerarse base del prototipo

1. IA multi-proveedor sin proveedor preseleccionado.
2. `CX.ai.ask(prompt, opts)` usado por módulos con fallback si no hay key.
3. PWA con `sw.js`, favicon/logo de consultora y manifest.
4. Login white-label con logo del cliente, países configurados y "Desarrollado por CXOrbia".
5. Roles nuevos: `coordinador` y `aliado`, ambos con `scopeCountry:true`.
6. Mis Visitas y Mis Beneficios filtran por shopper autenticado usando `shopperId`.
7. Logo del cliente en topbar y propuestas.
8. CxC/CxP clickeables con detalle, edición, cambio de estado y eliminación.
9. CRM con Ficha 360 ampliada y trazabilidad de propuestas/proyectos/tareas.
10. Soporte y Mi Día con asignación de responsable.
11. Importador con lectura real XLSX por SheetJS.
12. Reportes con exportación CSV real.
13. Manuales completos en Academia, visor pantalla completa, creación/edición.
14. Documentos renombrado conceptualmente a Recursos del proyecto, visor pantalla completa y generación IA.
15. Marketing IA con criterios estratégicos.

## Pendientes P0 que siguen vivos para Claude/frontend

### 1. Acciones operativas persistibles

Centralizar acciones para no depender de toasts o cambios locales dispersos.

Acciones mínimas:

```text
aprobar/rechazar postulación
asignar visita
solicitar ajuste de agenda
aprobar reprogramación
marcar visita realizada
marcar cuestionario realizado
marcar submitido
crear lote de pago
marcar pago
asignar responsable
cerrar soporte
```

Punto futuro sugerido:

```text
CX.data.performOperationAction(actionType, entityType, entityId, payload)
```

Si todavía es demo/local, debe decirlo de forma honesta en pantallas administrativas.

### 2. IA real no hardcodeada

Eliminar resultados fijos tipo `simulateAnalysis`.

Todo análisis, set-up, HR, documentos, cursos, certificaciones y marketing debe usar:

```text
CX.ai.ask(prompt, opts)
```

Cuando no haya key o backend, mostrar estado honesto: pendiente de conexión o usando heurística local.

### 3. Clientes vs Cuentas CRM

Unificar o vincular sin duplicación:

```text
clientes
cuentas CRM
contactos
proyectos
propuestas
correos
documentos
timeline
```

Una misma entidad comercial no debe aparecer con fichas separadas incoherentes.

### 4. Academia profunda

Completar:

```text
categorías editables
manuales versionados
lecciones profundas
quiz por lección
archivos/video/imagen embebidos
progreso por usuario
certificación vinculada
vigencia
evidencia de lectura
búsqueda/filtros
```

### 5. Finanzas profundo

Mantener separación estricta:

```text
beneficio calculado shopper
lote de pago
movimiento financiero real
conciliación
reembolso cliente/franquicia hacia consultora
```

No presentar liquidación esperada como pago real.

### 6. Postulaciones

Completar flujo:

```text
aprobar
rechazar
standby
cancelar
reasignar con buscador
solicitar ajuste
gestionar aprobadas
sin duplicar visita/postulación/HR
notificación bidireccional
```

### 7. Reservas / asignación

Detectar visitas disponibles sin shopper, cargar escenarios por período y cruzar reserva con postulación.

## Pendientes P1 importantes

- Reportes con IA, columnas configurables, filtros y XLSX real.
- Certificación creada con IA desde instructivo y banco de preguntas real.
- Set-up inteligente con preview y decisiones del usuario antes de aplicar.
- Configuración con crear/importar/editar/eliminar por opción.
- Automatizaciones e integraciones autoadministrables, sin estados falsamente "activos".
- Dashboard operativo con KPIs verificables contra HR real y drilldown.
- Soporte con historial, vencimientos y persistencia al recargar.

## TyA específico que no debe hardcodearse

T&A es el primer tenant real, no una app exclusiva de Cinépolis.

Jerarquía:

```text
CXOrbia
→ tenant: tya
→ cuentas/clientes: Cinépolis, RIMET, PUIG, Indumentaria, futuros
→ proyectos/rondas/períodos
→ visitas
→ shoppers
→ beneficios/pagos/evidencias/reportes
```

Reglas TyA iniciales para backend/configuración:

```text
GT: GTQ, honorario base Q60
HN: HNL, honorario base L200
boleto + combo = reembolso operativo, separado de honorario
```

No hardcodear estos valores en módulos. Deben salir de configuración por país/proyecto/tenant.

## Notas para ChatGPT backend

Backend ya está trabajando en Firebase DEV `cxorbia-backend-dev`.

V55 exige que backend soporte como contrato:

```text
CX.data.visitsForShopper(shopperId)
CX.data.getMyBenefits({shopperId, projectId, periodId})
CX.data.getShopperBenefitsAdmin(...)
CX.data.performOperationAction(...)
CX.ai.ask(...)
CX.automations.fire(...)
```

Además requiere persistencia para:

```text
brand.logo y assets white-label
countries[] por tenant/usuario
roles coordinador/aliado con scopeCountry
shopperBenefits por shopperId
cxp/cxc editables
propuestas vinculadas a cuenta CRM
proyectos vinculados a cuenta CRM
tareas/asignaciones internas
manuales/cursos/progreso
documentos/recursos con Storage
```

## Entrega esperada de Claude en el próximo ZIP

Debe incluir:

```text
CAMBIOS-PROTOTIPO.md actualizado
PENDIENTES-PROTOTIPO.md actualizado
CHECKLIST-VALIDACION-PROTOTIPO.md actualizado
RESUMEN-PARA-CHATGPT-BACKEND.md actualizado
lista de archivos modificados
notas backend de nuevos campos/eventos requeridos
```

No entregar ZIP técnico de backend a Claude. Solo prototipo/frontend y documentación de pendientes.
