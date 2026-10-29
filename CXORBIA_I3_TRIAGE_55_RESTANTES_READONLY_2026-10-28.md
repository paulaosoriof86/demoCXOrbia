# CXOrbia I3 · Triage READ-ONLY de 55 grupos pendientes (28-oct-2026)

**Fuente única de clasificación:** [preflight 40814816315](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40814816315), 139 parejas confirmadas, 83 grupos, revisión HR exacta `4fc8def718fd1504f5d76a1fbc80b6901cbf711ec2b89f4dfc3a81ecbbca517a`. Lectura de log con códigos de caso no personales, sin mutar Auth, Firestore, HR, reglas ni producción.

## Disposición completa

| Estado | Grupos | Intervención requerida |
|---|---:|---|
| Ya consolidados y verificados | 28 | NO tocar/repetir |
| Alias con visitas propias | 37 | Migración transaccional multicolección; no usar flujo de alias sin referencias |
| Varias identidades canónicas en HR | 11 | Determinar titular + conservar múltiples filas HR sin alterarlas |
| Titular de acceso no verificado | 1 | Confirmación Auth/membresía + acceso antes de cualquier escritura |
| Titular verificado pero no consolidado | 6 | Probar ruta de keeper y contacto específica, sin asimilar al caso fuerte |
| **Total** | **83** | **55 pendientes** |

## Hallazgo de mayor impacto

**Los 37 grupos clasificados `HOLD_ALIAS_OWNED_VISITS` también tienen al menos una referencia del alias en otro dominio operativo.** Por tanto ningún grupo de esa categoría cumple el contrato de cero referencias usado con éxito en los 21 casos fuertes: se requiere migrar visitas y las demás colecciones relacionadas preservando su propiedad, conciliación y permisos. El máximo observado por alias es 24 visitas y 23 referencias de otros dominios; no interpretar como 24 registros únicos sin inspección de colección.

Hay **11** grupos con no más de tres referencias en otros dominios, útiles como candidatos a canario de migración transaccional, **después** de validar origen y destinos de cada referencia. Ejemplos, solo códigos de caso:

- `F-005 / R-006` · GT · HR canónico 1 · visitas del alias 3 · referencias de otros dominios 3.
- `F-014 / R-013` · GT · HR canónico 1 · visitas del alias 1 · referencias de otros dominios 1.
- `F-029 / R-021 / R-022` · GT · HR canónico 1 · visitas del alias 2 · referencias de otros dominios 2.
- `F-041 / R-036` · GT · HR canónico 1 · visitas del alias 3 · referencias de otros dominios 2.
- `F-043 / R-037` · GT · HR canónico 1 · visitas del alias 2 · referencias de otros dominios 3.
- `F-045 / R-049` · GT · HR canónico 1 · visitas del alias 2 · referencias de otros dominios 3.
- `F-046` · GT · HR canónico 1 · visitas del alias 1 · referencias de otros dominios 1.
- `F-053 / R-061` · HN · HR canónico 1 · visitas del alias 2 · referencias de otros dominios 2.
- `F-060 / R-068` · HN · HR canónico 1 · visitas del alias 3 · referencias de otros dominios 3.
- `F-064 / R-070` · HN · HR canónico 1 · visitas del alias 1 · referencias de otros dominios 1.
- `R-031 / R-032` · GT · HR canónico 1 · visitas del alias 2 · referencias de otros dominios 3.

## Seis casos de titular verificado que no son idénticos a los 21 canarios

| Código principal | País | Visitas del alias | Otras referencias | Control pendiente |
|---|---|---:|---:|---|
| F-057 | HN | 0 | 2 | Remapeo otro dominio |
| R-020 | GT | 0 | 1 | Remapeo otro dominio |
| R-026 | GT | 0 | 0 | Coincidencia humana SÍ, acceso preferente `Técnica`; contacto no idéntico |
| R-050 | GT | 0 | 1 | Remapeo otro dominio |
| R-053 | GT | 0 | 0 | Coincidencia humana SÍ, acceso preferente `HR`; contacto no idéntico |
| R-057 | HN | 0 | 14 | Remapeo múltiple dominios |

Los dos R sin referencias se pueden priorizar para un preflight específico de credenciales y titular, pero **no** para la misma rutina automática: el lote fuerte exige teléfono coincidente y `keeper` técnico en su ejecución; estas condiciones no están verificadas para R-026/R-053. La anotación humana SÍ se respeta, así como la preferencia de acceso que Paula escribió.

## Próxima operación autorizable con mínima dependencia de Paula

1. Seleccionar un canario multicolección con pocos registros, comprobar todas las rutas `shopperId` y referencias indirectas, elaborar readback BEFORE/AFTER y procedimiento de recuperación; no reemplazar solo el nombre visible.
2. Ejecutar primero simulación sin escritura, luego un único comando protegido en DEV tras pasar guardias de proyecto/HR/revisión/keeper y comprobar Shopper/Admin/Operaciones. Si cualquiera de los dominios no puede reconciliarse, HOLD sin escrituras.
3. Repetir por clases homogéneas tras PASS del primer canario. Para múltiples canónicos HR, establecer explícitamente los alias de origen y acceso elegido sin tocar Google Sheets.
4. Materializar en una candidata DEV acumulada la prevención de altas, aviso administrativo y explicación de disponibilidad. Pasar E2E transversal sobre el mismo artefacto y cerrar matriz I3/20/21 antes de I4.

**No hay aprobación LIVE ni transformación de estas 55 cuentas en este documento.**
