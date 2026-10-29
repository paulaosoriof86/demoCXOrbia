# CXOrbia I3 — decisiones de identidad de shoppers (28-oct-2026)

**Estado:** decisiones de Paula congeladas para la recuperación de Fase A. Este documento no altera el plan rector de 82 tareas, el ledger ni las puertas I3/I4. El registro humano original, con sus tres hojas y sus anotaciones, conserva la autoridad sobre las parejas de identidad.

## Fuente humana y punto de control

- Archivo entregado: `CXORBIA_I3_SHOPPERS_CONFIRMAR_IDENTIDADES_2026-10-28(1).xlsx`.
- `Confirmar 66`: 66 casos, 66 decisiones **SÍ**.
- `Revisar nombre`: 73 casos, 73 decisiones **SÍ**.
- `Trazabilidad`: 139 claves técnicas para conciliar con HR, Auth, perfiles y los dominios operativos.
- Los 139 pares forman **83 grupos** técnicos; no se deben confundir pares confirmados con 83 fusiones ejecutables.
- Última reconciliación independiente: [GitHub Action #40820123220](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40820123220), **31 grupos consolidados y verificados**, 4 con keeper acreditado aún pendientes de elección del contacto principal, 36 bloqueados por visitas de alias, 11 por múltiples canónicos HR y 1 por keeper no acreditado. No recontar un caso hasta el readback independiente.
- Caso complejo `R-020`: [GitHub Action #40818810388](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40818810388), PASS en **DEV** con 1 certificación reasignada, 2 visitas HR preservadas, ingreso Shopper y readback PASS; cero escrituras en visitas, HR o LIVE.
- Caso focal `F-057 HN`: [GitHub Action #40819941606](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40819941606), **canaria DEV PASS** con 2/2 certificaciones vinculadas, UID/credenciales preservados, 1/1 visita HR intacta, Shopper UI e idempotencia PASS; sin escrituras sobre visitas, HR, finanzas o LIVE. Incluido en el postflight de 31 grupos.

## Normalización permanente

1. Comparar cadenas de nombres con una **clave interna** Unicode normalizada, en minúsculas, sin tildes diacríticas, espacios sobrantes ni diferencias de mayúsculas. No sobrescribir el nombre original legible de exhibición; los cambios de presentación requieren campo de preferencia auditado.
2. Normalizar teléfonos a dígitos y comparar por país, tratando como equivalentes un número local de 8 dígitos y el mismo número con su prefijo propio cuando corresponda (GT `502`, HN `504`, NI `505`, SV `503`). No quitar arbitrariamente prefijos ni igualar números de países diferentes. Si los números sustantivos divergen, **no resolver ni sobrescribir el contacto automáticamente**.
3. Nombre equivalente, incluso con teléfono equivalente, es una señal de candidato, no prueba suficiente de titularidad Auth. Las claves durables ya verificadas (crosswalk HR/Auth/UID/tenant/proyecto y resolución humana) gobiernan la vinculación automática a un expediente canónico inequívoco. Si falta una de estas pruebas, bloquear la creación de un duplicado y abrir revisión; **nunca autofusionar por parecido nominal**.
4. Toda alta manual, importación HR, alta desde Shopper o sincronización debe consultar la resolución canónica antes de crear otra ficha y conservar trazabilidad de alias y fuente. La regla debe aplicarse en el proveedor, no solo en la interfaz.
5. Una decisión humana `SÍ` acredita que los dos registros pertenecen a la misma persona; **no decide por sí sola** cuál teléfono, correo, credencial o dato bancario será principal. Los datos discordantes se elevan a Paula y se preservan con procedencia; los valores secundarios no desaparecen en una fusión.

## Reglas de ejecución de fusiones

1. Ejecutar exclusivamente en `cxorbia-backend-dev` mientras I3 siga HOLD. No escribir a HR, LIVE, Auth/IAM o reglas. Sin autorización de publicación I4.
2. Preflight **READ-ONLY** por caso: decisión SÍ + keeper autorizado explícito, país/tenant/proyecto, normalización de contacto, UID/Auth, membresías, visitas por dueño, certificaciones, beneficios, liquidaciones y pagos, con revisión de versiones y digest de fuente.
3. Si alias conserva visitas, hay múltiples canónicos HR, keeper no está probado, contacto sustantivamente incompatible sin elección humana, o hay versiones ambiguas, clasificar **HOLD** y no escribir. No reintentar ante un nuevo conflicto.
4. Una canaria aislada por ejecución, transacción acotada y repetible/idempotente. Preservar expediente canónico, acceso y credenciales; mover únicamente relaciones explícitamente probadas y aprobadas. Nunca borrar evidencia, históricos, identificadores de certificación ni referencias financieras. Sin afirmación de pago externo por una reconciliación interna.
5. Exigir ACK del proveedor, lectura independiente post-escritura, verificación de sesión Shopper y segundo conteo global READ-ONLY. Solo entonces actualizar el número de consolidados.
6. Administración/Operaciones debe ver un aviso no bloqueante cuando existan identidades pendientes en la **cola real**, con enlace a Shoppers si el rol tiene permiso. Mostrar la información necesaria para la decisión dentro del módulo protegido, no PII en una alerta general. Posponer no resuelve ni fusiona.

## Decisiones de contacto pendientes (sin autorizar sobrescritura)

| Caso | Teléfono HR (últimos 4) | Teléfono cuenta (últimos 4) | Estado |
| --- | --- | --- | --- |
| R-026 GT | 9051 | 8455 | HOLD — decidir contacto principal |
| R-050 GT | 9705 | 6180 | HOLD — decidir contacto principal |
| R-053 GT | 2267 | 7080 | HOLD — decidir contacto principal; keeper HR |
| R-057 HN | 9460 | Sin dato | HOLD — confirmar contacto principal |

`F-057 HN` es un caso diferente: coincidencia de nombre, país y teléfono (terminación 1018), con canaria aislada acreditada. No confundir `F-057` con `R-057`, que permanece en HOLD de contacto.

## Comprobaciones de plataforma que deben conservarse

- Fuente de verdad HR multihoja por país y período. Distinguir *disponibles en HR* de *postulables para ese shopper, país y período*; nunca ofrecer una visita histórica vencida por un KPI global.
- La corrección de Dashboard, Visitas, Postulaciones y tabla Shoppers está versionada en `b6a1b923cac28163eadfb4f76e81f225d1995c4f`; permanece pendiente de materialización y UAT autenticada DEV.
- Los nombres de estado de Certificaciones fueron humanizados **sin cambiar sus enums** en `b868940c0f379840895c7591cb092032cccd9db1`; pendiente despliegue/UAT DEV.
- El aviso Admin/Operaciones y el guard de alta preventiva de teléfonos deben comprobarse en el proveedor y en la interfaz. No contar código local como cambio disponible para los usuarios.
- Cobertura preventiva del parche SOURCE-ONLY: el comando de alta `shopper.create` por Admin, Visitas y Postulaciones pasa por el proveedor, pero **no** cubre `hr.snapshot.reconcile`, que llama directamente a `durableUpsert`. La función exige rol real `super` o `admin`; Operaciones sin ese claim no tiene permiso de alta aunque reciba aviso de revisión. El bloqueo manual actual devuelve ACK negativo sin persistir una nueva entrada en `shopperIdentityReviews`, por lo que el aviso detecta la cola existente pero todavía no todos los intentos nuevos.
- El autorregistro Shopper carece de contrato válido para `shopper.create` (permiso staff). Una corrección SOURCE-ONLY evita su falso mensaje de éxito y exige ACK real, pero **no habilita altas autónomas**. El importador HR tampoco acredita persistencia final. Son brechas P0/P1 por corregir y probar antes de declarar prevención transversal. Sin autoaplicar la decisión del Excel a los datos HR vivos.
- I3, Gate20 y Gate21 permanecen **HOLD**; no representar Fase A como completa hasta el cierre de los bloqueos y la prueba transversal real. LIVE sin modificar por estas operaciones.
