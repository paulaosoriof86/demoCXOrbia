# PENDIENTES-PROTOTIPO-ADDENDUM-20260629-CONFIGURACION-SYNC-PROYECTOS

## Contexto

Durante la validacion de backend/migracion se confirmo que el modulo de Configuracion no esta funcionando correctamente en el prototipo actual. Ademas, Paula indico que al crear nuevos proyectos desde la plataforma seguramente apareceran nuevas fallas operativas que deben documentarse y corregirse con Claude cuando este disponible.

## Pendientes para prototipo comercializable

### Configuracion

- Revisar modulo Configuracion: actualmente no funciona de forma confiable.
- Evitar que la configuracion dependa de scripts o PowerShell en el uso normal.
- Permitir configurar fuentes externas desde UI administrativa.
- Permitir probar preview antes de escribir datos reales.
- Mostrar conteos, advertencias y conflictos antes de confirmar una sincronizacion.

### Creacion de proyectos desde plataforma

Al crear un nuevo proyecto desde la plataforma, debe existir un flujo inteligente para:

- Seleccionar si tendra fuente externa o no.
- Definir tipo de fuente: hoja de ruta, Google Sheet, Excel/OneDrive, CSV o manual.
- Mapear columnas.
- Definir paises.
- Definir periodos.
- Activar creacion mensual automatica de nuevos periodos.
- Activar o desactivar creacion automatica de shoppers/evaluadores desde fuente externa.
- Activar o desactivar asignacion automatica desde fuente externa.
- Definir reglas de deduplicacion.
- Definir reglas de conflicto.
- Ejecutar dry-run/preview antes de escribir.

### Periodos y filtros

Cada modulo operativo debe poder filtrar por:

- Tenant.
- Cliente/cuenta.
- Proyecto.
- Pais.
- Periodo mensual.
- Estado operativo.

### Sincronizacion HR/fuente externa

- La HR puede ser fuente historica y viva.
- La carga historica inicial no reemplaza la sincronizacion incremental futura.
- Al detectar hoja/periodo nuevo, debe crearse el periodo/proyecto sin duplicar.
- Al detectar shopper/evaluador nuevo asignado desde HR, debe crearse perfil operativo minimo.
- Si luego el shopper se registra o postula, debe unificarse con deduplicacion.

### Dedupe y conflictos

- No duplicar shoppers, visitas, asignaciones, cuestionarios, certificaciones ni liquidaciones.
- Si fuente externa y plataforma difieren en campos criticos, registrar conflicto y no sobrescribir silenciosamente.
- Mantener trazabilidad por fuente, periodo, hoja, fila, clave externa y fecha de sincronizacion.

## Pendientes conocidos adicionales

- Storage/evidencias sigue pendiente por Blaze.
- Certificaciones no vienen de HR y deben migrarse desde BD actual u otra fuente confiable.
- CRM y Academia quedan pendientes de completar/profundizar en prototipo.
- Nuevas fallas detectadas durante uso real deben registrarse aqui o en addendum posterior antes de enviarlas a Claude.

## Restricciones

- No modificar /app/modules desde backend.
- No parchar UI desde esta fase.
- Si el frontend necesita ajuste, documentarlo para Claude.
