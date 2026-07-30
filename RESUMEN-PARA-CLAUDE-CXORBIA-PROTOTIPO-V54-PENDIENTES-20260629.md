# RESUMEN-PARA-CLAUDE-CXORBIA-PROTOTIPO-V54-PENDIENTES-20260629

## Contexto

CXOrbia es una plataforma SaaS multi-tenant de mystery shopping y field operations. El frontend aprobado vive en `/app` y debe seguir siendo vanilla HTML/JS modular, sin framework.

ChatGPT está construyendo backend Firebase DEV en rama separada. Claude debe enfocarse en mejorar el prototipo/frontend, sin tocar backend ni publicar nada.

## No tocar

No modificar ni sobrescribir:

```text
firebase/**
firestore.rules
storage.rules
firebase.json
.firebaserc
app/core/backend-firebase.js
app/core/backend-finance-benefits.js
app/core/backend-operational-actions.js
app/core/backend-config.js
app/core/backend-config-preview-dev.js
app/index-backend-dev.html
CAMBIOS-BACKEND*.md
PLAN-*.md
RESULTADO-*.md
AUDITORIA-*.md
MODELO-*.md
```

## Prioridad P0

### 1. Mis Beneficios: aislamiento shopper

Archivo principal a revisar:

```text
app/modules/beneficios.js
```

Problema detectado en V54: si no hay visitas propias o no se resuelve bien el shopper, el módulo puede caer en una lógica que muestra beneficios globales.

Debe quedar así:

- Si no hay shopper autenticado/resuelto: mostrar vacío con mensaje claro.
- Si el shopper no tiene beneficios: mostrar vacío.
- Nunca mostrar beneficios, liquidaciones o pagos de otros shoppers.
- No usar fallback global.
- Debe ser consistente con `data.visitsForShopper(sid)`.

### 2. Acciones operativas persistibles

Módulos afectados:

```text
app/modules/postulaciones.js
app/modules/misvisitas.js
app/modules/visitas.js
app/modules/soporte.js
app/modules/midia.js
app/modules/finanzas.js
```

El prototipo no debe depender de cambios aislados en memoria para acciones importantes. Las acciones deben centralizarse para que luego el backend las conecte.

Acciones a preparar:

- aprobar/rechazar postulación;
- asignar visita;
- solicitar ajuste de agenda;
- aprobar reprogramación;
- marcar visita realizada;
- marcar cuestionario realizado;
- marcar submitido;
- crear lote de pago;
- marcar pago;
- asignar responsable;
- cerrar soporte.

Debe existir un punto único futuro, por ejemplo:

```text
CX.data.performOperationAction(actionType, entityType, entityId, payload)
```

Si todavía no está conectado al backend, el UI debe decir pendiente/simulado de forma honesta.

### 3. Finanzas profundo / Mis Beneficios

Módulos afectados:

```text
app/modules/finanzas.js
app/modules/beneficios.js
app/modules/dashboard.js
app/modules/reportes.js
```

Separar claramente:

- beneficio calculado del shopper;
- lote de pago;
- movimiento financiero real;
- conciliación;
- reembolso del cliente/franquicia hacia la consultora.

No mezclar liquidación esperada con pago real.

Reglas TyA iniciales:

- GT: moneda GTQ, honorario base Q60.
- HN: moneda HNL, honorario base L200.

Mis Beneficios debe mostrar detalle útil:

- visita;
- proyecto/período;
- honorario;
- reembolso boleto;
- reembolso combo;
- otros reembolsos;
- total;
- estado;
- fecha estimada o pagada si existe.

### 4. Configuración / Integraciones / Automatizaciones

V54 mejoró el lenguaje para no prometer conexión real, pero aún hay persistencia local.

Debe quedar claro:

- configuración guardada localmente no equivale a backend real;
- integraciones no validadas no deben mostrarse como activas;
- automatizaciones no ejecutadas no deben mostrarse como reales;
- IA debe mostrar proveedor, estado y necesidad de revisión humana.

No guardar valores privados en frontend.

### 5. Importador Excel / HR

Archivo principal:

```text
app/modules/importador.js
```

V54 ya agregó lectura XLSX con SheetJS, pero debe evolucionar:

- soportar múltiples hojas;
- seleccionar hoja;
- mapear columnas;
- preview antes de importar;
- conteos por hoja;
- conflictos y duplicados;
- origen por archivo/hoja/fila;
- no importar directo sin confirmación.

### 6. Set-up inteligente

Debe ser un asistente de configuración, no una caja negra.

Mostrar:

- fuentes usadas;
- análisis;
- recomendaciones;
- nivel de confianza;
- decisiones del usuario;
- tareas pendientes;
- preview antes de aplicar;
- resultado final.

No decir “configurado” si solo generó sugerencias.

### 7. Academia profunda

Archivo principal:

```text
app/modules/academia.js
```

Pendiente:

- versiones de manuales;
- categorías editables reales;
- videos/documentos con metadatos;
- progreso por usuario;
- evaluación/certificación;
- vigencia;
- evidencia de lectura;
- búsqueda y filtros.

### 8. Reportes

V54 ya tiene CSV en algunos puntos. Pendiente:

- exportar XLSX real;
- filtros previos;
- plantillas por módulo;
- columnas configurables;
- reporte por país/proyecto/período;
- auditoría de exportación.

## Prioridad P1

### Dashboard y KPIs

Todos los KPIs deben tener drilldown útil. No basta número total.

Cada KPI debe abrir:

- detalle;
- filtros;
- país;
- proyecto;
- período;
- estado;
- acciones cuando aplique.

### Postulaciones

Debe mostrar todas las postulaciones relevantes, no solo pendientes.

Filtros mínimos:

- pendientes;
- aprobadas;
- rechazadas;
- canceladas;
- por país;
- por proyecto;
- por shopper.

### Shopper flow

Revisar de punta a punta:

```text
postulación/asignación
instructivo
agendar
reprogramar
confirmar fecha
marcar realizada
abrir cuestionario externo
marcar cuestionario realizado
revisión/submitido
```

Los botones solo deben activarse en la etapa correcta.

### CRM / Comercial / Cliente 360

V54 mejoró CRM y Ficha 360. Pendiente:

- persistencia real futura;
- relación cuenta/proyecto/propuesta/contactos;
- estados claros;
- no duplicar entidades;
- timeline consistente.

### Soporte / Mi Día

V54 mejoró asignaciones internas. Pendiente:

- estados claros;
- responsables;
- vencimientos;
- historial;
- no perder tareas al recargar.

### Marketing e IA

No presentar textos generados como campaña real si no se publicó.

Debe diferenciar:

- idea;
- borrador;
- aprobado;
- programado;
- publicado;
- medido.

### Legal / Cliente / IA responsable

Debe existir punto visual para que, más adelante, backend bloquee acceso si faltan aceptaciones.

No redactar documentos legales definitivos. Solo preparar UI para:

- ver documento;
- aceptar;
- descargar/imprimir;
- ver historial;
- bloqueo antes de entrar cuando aplique.

En IA, mostrar aviso de que la IA apoya, pero el usuario debe revisar y decidir.

## Pendientes técnicos generales

- Mantener UTF-8.
- No introducir frameworks.
- No romper navegación actual.
- No eliminar módulos aprobados.
- No cambiar IDs/contratos de datos sin documentar.
- No mostrar notas técnicas al usuario final.
- No usar datos reales en prototipo.
- No mezclar tenant, cuenta, proyecto y visita.

## Entrega esperada de Claude

Al entregar el ZIP, incluir:

```text
CAMBIOS-PROTOTIPO.md
PENDIENTES-PROTOTIPO.md
CHECKLIST-VALIDACION-PROTOTIPO.md
lista de archivos modificados
notas para ChatGPT backend si algo requiere conexión futura
```

El ZIP debe contener frontend/prototipo, no reemplazar backend.

## Regla final

El prototipo puede mejorar UX y flujo, pero no debe simular como real algo que todavía depende de backend. Si es demo, preview, local o pendiente de conexión, debe decirlo claramente en contexto de administración, sin mostrar notas técnicas al usuario final.