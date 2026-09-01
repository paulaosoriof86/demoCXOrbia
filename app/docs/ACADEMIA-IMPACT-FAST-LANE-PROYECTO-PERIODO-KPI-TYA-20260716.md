# ACADEMIA — IMPACTO FAST-LANE, PROYECTO, PERIODO Y KPI

Fecha: 2026-07-16

## Contenido obligatorio

Academia debe explicar por rol:

### Proyecto vs periodo

- Proyecto: configuración operativa padre, cliente, países, monedas, HR, cuestionario, certificación, pagos e integraciones.
- Periodo: mes/ronda dentro del proyecto, con sus visitas, postulaciones, ejecución, cuestionarios, liquidaciones y KPI.
- Seleccionar otro periodo no crea otro proyecto y no cambia la configuración padre.

### Cambio de contexto

- Qué controles cambian el proyecto.
- Qué controles cambian el periodo.
- Qué módulos deben actualizarse después del cambio.
- Cómo verificar proyecto y periodo activos antes de operar.
- Qué hacer si Dashboard, Histórico o Hoja de ruta no reflejan el periodo seleccionado.

### KPI e histórico

- Los KPI se calculan solo con el periodo activo salvo reporte acumulado explícito.
- Un acumulado debe identificarse como acumulado y nunca confundirse con el periodo.
- MAY/JUN/JUL deben producir vistas diferentes cuando sus datos difieren.
- Junio TyA/Cinépolis tiene ejecución cerrada; lo pendiente corresponde a liquidaciones/pagos.

### Fast-lane y versiones

- Una nueva candidata no es baseline hasta quedar materializada, empalmada, validada y registrada en el mismo bloque.
- Solo existe una baseline activa y una referencia de rollback.
- Un PASS visual no activa Firestore, HR writes, Make, Gemini, pagos ni producción.

## Formato requerido

- Ruta Superadmin/Admin: validar contexto y gates antes de deploy.
- Ruta Operativo: cambiar periodo y comprobar visitas/estados.
- Ruta Shopper: reconocer periodo, visitas y beneficios propios.
- Ruta Cliente: consultar proyecto, periodo y KPI sin mezclar históricos.
- Checklist interactivo por rol.
- Errores frecuentes y acciones correctivas.
- Notificación cuando cambie la lógica de contexto o KPI.

## Estado

Impacto documentado. No modifica `app/modules/academia.js`, no publica contenido y no activa IA.