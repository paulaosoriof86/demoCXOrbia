# Impacto Academia — Firebase DEV clean-state read-only gate

Fecha: 2026-07-10

## Objetivo formativo

Academia debe explicar cómo comprobar un entorno DEV sin convertir una lectura técnica en autorización para escribir, importar, desplegar o pasar a producción.

La verificación usa resultados sanitizados y debe enseñar que:

- read-only no significa riesgo cero, por lo que requiere autorización;
- un entorno inconcluso no puede declararse limpio;
- detectar recursos no autoriza borrarlos;
- un entorno DEV limpio no equivale a backend conectado ni producción habilitada.

## Contenido obligatorio

### Estados del gate

1. `CLEAN_STATE_VERIFIED_READ_ONLY`:
   - todos los checks obligatorios disponibles;
   - Auth, Firestore, Storage y Functions sin recursos de negocio detectados;
   - siguiente paso permitido: preparar dry-run, no escribir.

2. `NONEMPTY_REVIEW_REQUIRED`:
   - existe al menos una señal de recursos;
   - detenerse y revisar propiedad/origen;
   - no borrar, sobrescribir ni migrar automáticamente.

3. `INCONCLUSIVE_PERMISSION_OR_API`:
   - falta visibilidad read-only;
   - corregir IAM/API;
   - no asumir limpieza por ausencia de evidencia.

4. `TARGET_MISMATCH_HARD_STOP`:
   - proyecto, bucket o credencial no coinciden;
   - detenerse antes de continuar.

### Diferencias que debe dominar cada administrador

- proveedor apagado vs lectura autorizada;
- lectura vs escritura;
- verificación DEV vs activación DEV;
- activación DEV vs deploy;
- deploy DEV vs producción;
- clean-state vs import readiness;
- conteos sanitizados vs PII/datos crudos.

## Datos que Academia debe prohibir

No incluir en manuales, capturas, videos, evaluaciones o logs:

- correos, UID, teléfonos o nombres;
- claims completos;
- colecciones, documentos o campos reales;
- nombres/metadatos de archivos y evidencias;
- funciones, variables de entorno o configuraciones privadas;
- reglas, tokens, credenciales o respuestas API crudas;
- URLs privadas de HR o proveedores.

## Ruta por rol

### Tenant owner / superadmin

- autorizar la lectura;
- verificar destino y evidencia del run;
- interpretar el resultado;
- decidir escalamiento;
- mantener separadas autorizaciones de lectura y escritura.

### Project admin / coordinador / aliado

- consultar el estado publicado;
- no ejecutar ni ampliar acceso al proveedor;
- reportar inconsistencias;
- no solicitar borrado automático.

### Finanzas, certificación, cliente y shopper

- no necesitan acceso al gate técnico;
- solo reciben estado operativo pertinente, sin infraestructura ni identificadores.

## Checklists

### Antes de ejecutar

- autorización explícita registrada;
- proyecto DEV esperado;
- workflow manual-only;
- confirmación exacta;
- credencial fuera del repo;
- reporte sanitizado;
- cleanup de credencial;
- writes/deploy/import bloqueados.

### Después de ejecutar

- revisar decisión y checks obligatorios;
- verificar que el artifact no contenga PII;
- registrar run y commit;
- si no vacío, abrir revisión humana;
- si inconcluso, corregir solo acceso read-only;
- si limpio, preparar dry-run opaco;
- no crear usuarios, claims o reglas sin un nuevo GO.

## Evaluación de aprendizaje

Academia debe comprobar que el usuario pueda:

- distinguir limpio de inconcluso;
- explicar por qué no se borra automáticamente;
- reconocer que DEV limpio no es producción;
- identificar datos que no deben salir en reportes;
- seleccionar la ruta correcta ante target mismatch;
- separar autorización read-only de write/deploy.

## Notificaciones futuras

Preparar, sin enviar todavía:

- verificación pendiente de autorización;
- verificación finalizada;
- recursos detectados y revisión requerida;
- resultado inconcluso;
- target mismatch;
- capacitación requerida antes de activar Auth/Firestore.

Todas permanecen provider-off hasta activar outbox y proveedor mediante gate independiente.

## Clasificación

- **Reusable CXOrbia:** formación sobre verificación read-only y no-deletion.
- **Exclusivo cliente:** ejemplos TyA solo como contexto, sin datos reales.
- **Claude/prototipo:** ayuda contextual y estados visibles.
- **Academia:** impacto directo y obligatorio.
- **Sin impacto Claude:** endpoints, librerías y manejo interno del secret.

## Estado seguro

Documento únicamente. No ejecuta proveedor, Auth, Firestore, Storage, Functions, reglas, import, deploy, producción ni pagos.
