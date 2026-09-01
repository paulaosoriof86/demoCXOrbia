# Tracker Phase A — Firebase DEV clean-state read-only gate

Fecha: 2026-07-10

## Bloque

`Firebase DEV clean-state + Auth configuration read-only gate`.

## Estado

**Preparado en modo manual/provider-read bloqueado.**

La consulta al proveedor no se ejecutó. No equivale a clean-state verificado, conexión Auth/Firestore, usuarios, claims, reglas, import, deploy o producción.

## Ya completado y no reabierto

- source lock post-V96 empalmado y validado;
- runtime 67/67;
- smoke, predeploy, visual y drift verdes;
- Auth preactivación por ruta/acción validada;
- coordinador, aliado, custom, cliente y shopper reconciliados;
- contratos de HR, shoppers, certificaciones, liquidaciones, reviewQueue y `CX.data` preservados;
- Level 0/1 no reiniciados.

## Hecho en este bloque

- contrato read-only con decisiones fail-closed;
- configuración source-safe del target DEV;
- runner manual sanitizado;
- verificador estático sin proveedor;
- workflow manual-only con confirmación exacta;
- workflow CI estático sin secret;
- cleanup de credencial temporal;
- artifact limitado a conteos/booleanos;
- política de no borrado/no overwrite;
- documentación Claude, pendientes, Academia, cambios y tracker.

## Verificaciones preparadas

- identidad de proyecto/service account;
- usuarios Auth por conteo;
- configuración Auth por booleanos;
- Firestore sin leer campos ni IDs;
- Storage sin mostrar objetos;
- Functions sin mostrar nombres/configuración;
- releases de reglas por conteo.

## Decisiones preparadas

- `CLEAN_STATE_VERIFIED_READ_ONLY`;
- `NONEMPTY_REVIEW_REQUIRED`;
- `INCONCLUSIVE_PERMISSION_OR_API`;
- `TARGET_MISMATCH_HARD_STOP`.

## Conectado

- nada nuevo al proveedor;
- únicamente contratos, runner, workflows y documentación en repo.

## Preparado/no ejecutado

- consulta read-only Auth/Firestore/Storage/Functions/rules;
- reporte sanitizado;
- decisión de clean-state;
- dry-run posterior de identidades opacas.

## Bloqueado

- ejecución del provider-read sin autorización explícita;
- creación/actualización/borrado de usuarios;
- claims;
- lectura de PII o datos de negocio;
- escrituras/borrados Firestore y Storage;
- rules deploy;
- Functions write/invoke;
- Hosting deploy;
- imports;
- producción.

## Parte Phase A protegida

La verificación evita empalmar la operación real TyA sobre un entorno con residuos desconocidos antes de conectar:

- HR operacional;
- shoppers históricos;
- certificaciones carryover;
- visitas y conflictos;
- liquidaciones/pagos de junio;
- cliente multi-proyecto;
- Cinépolis configurable;
- reviewQueue/auditEvents;
- `CX.data`.

## Datos/fuentes TyA

No se consultan ni solicitan HR, shoppers, certificaciones, liquidaciones, evidencias o datos reales. El gate revisa infraestructura y conteos sanitizados únicamente.

## Clasificación

- **Reusable CXOrbia:** verificación manual read-only, inconcluso no es limpio y no-deletion.
- **Exclusivo cliente:** ninguno; no se leen datos TyA.
- **Claude/prototipo:** estados honestos y fail-closed.
- **Academia:** interpretación, autorización y escalamiento.
- **Sin impacto Claude:** API, secret temporal y artifact interno.

## Siguiente bloque exacto

Tras autorización explícita:

1. ejecutar el workflow manual read-only;
2. revisar reporte sanitizado;
3. documentar clean/nonempty/inconclusive/target mismatch;
4. no modificar recursos;
5. si limpio, preparar dry-run de identidades opacas;
6. si no, detener y abrir revisión humana.

## Necesidad de Paula

Solo se requiere autorización explícita separada para realizar llamadas read-only a Firebase DEV. No se requieren pasos manuales, HR ni datos adicionales.
