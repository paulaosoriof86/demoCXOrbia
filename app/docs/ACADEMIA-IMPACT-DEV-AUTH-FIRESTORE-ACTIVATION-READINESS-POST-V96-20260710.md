# Impacto Academia — DEV Auth/Firestore activation readiness post-V96

Fecha: 2026-07-10

## Módulos y rutas afectadas

- Usuarios y roles.
- Proyectos y alcance multi-proyecto.
- Portal cliente.
- Shoppers y perfil protegido.
- Certificaciones y carryover.
- Finanzas, liquidaciones y pagos.
- Diagnóstico/Readiness.
- Administrabilidad.

## Contenido que Academia debe incorporar

### Conceptos

- Diferencia entre persona operativa, rol técnico y scope.
- Scopes: tenant, país, proyecto, país/proyecto y ámbito propio.
- Mínimo privilegio y fail-closed.
- Diferencia entre configuración source-safe y datos protegidos.
- Base Firebase DEV nueva y limpia; nunca base legacy.
- Auth/Firestore preparado, configurado, activo y producción como estados distintos.

### Rutas por rol

- Tenant owner/franquiciado: configuración permitida según scope.
- Representante/coordinador: operación de países/proyectos asignados, no tenant global.
- Finanzas: liquidaciones y lotes sin datos bancarios crudos.
- Certificación: intentos, carryover y borradores IA con revisión humana.
- Cliente: reportes aprobados y proyectos autorizados.
- Shopper: perfil, visitas, certificaciones y beneficios propios.

### Lecciones paso a paso

1. Interpretar una ficha de usuario: persona, rol, scope, países y proyectos.
2. Detectar acceso denegado por falta de scope.
3. Entender `gate apagado`, `readiness preparado`, `Auth pendiente` y `Firestore no conectado`.
4. Revisar un conflicto en reviewQueue sin sobrescribir por nombre.
5. Confirmar una certificación carryover sin pedir repetición.
6. Interpretar junio como liquidación/pago, no visita pendiente.

### Checklists

- Usuario con tenant y scope correctos.
- Rol cliente sin acceso operativo protegido.
- Shopper limitado a sus propios datos.
- Country representative limitado a país/proyecto.
- Claims sin email, teléfono, DPI, banco, contraseña o tokens.
- No activar servicios por un simple resultado `GO_SAFE` de validator.

### Errores frecuentes

- Dar `tenantAdmin` a quien solo opera un país/proyecto.
- Confundir rol visible con custom claim.
- Publicar datos de shopper en preview público.
- Interpretar dry-run como claims escritos.
- Tratar proyecto y periodo/quincena como la misma entidad.
- Marcar pagos ejecutados cuando solo están preparados.

## Notificaciones relacionadas

Cuando se active en una fase futura, Academia deberá poder notificar:

- cambio de rol/scope;
- acceso revocado o ampliado con auditoría;
- manual actualizado por cambio de permisos;
- nueva ruta de aprendizaje por persona;
- contenido de certificación actualizado;
- cambio de flujo de liquidaciones/pagos.

## Estado

Impacto documentado. No se crea contenido runtime, no se publica curso y no se activa Gemini.
