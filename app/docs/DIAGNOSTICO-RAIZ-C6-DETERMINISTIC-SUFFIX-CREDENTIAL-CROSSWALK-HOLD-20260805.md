# DIAGNÓSTICO DE CAUSA RAÍZ — C6 Deterministic Suffix Credential Crosswalk HOLD

**Fecha:** 2026-08-05  
**Estado:** SOURCE ROOT CAUSE PROVEN · STOP_RETRY · SIN SEGUNDA LECTURA PROVIDER

## Síntoma observable

La ejecución determinística leyó los mismos 109 registros de credencial, pero produjo:

```text
clasificador anterior: mapped=101 / unmapped=8
planner determinístico: mapped=88 / unmapped=21
delta no explicado por datos: -13 mapped / +13 unmapped
```

No hubo provider write ni cambio de datos entre ambas lecturas dentro de este bloque.

## Causa raíz de source

El clasificador anterior amplía `relationIndex` cada vez que enlaza una fuente HR, visita, certificación o liquidación con un perfil. Para cada objeto enlazado incorpora sus llaves técnicas al crosswalk.

El planner determinístico nuevo solo agrega la fuente a `linkedByProfile`; no incorpora sus llaves técnicas a `relationIndex`.

Después, el mapeo de credenciales consulta `relationIndex`. Por esa omisión, 13 credenciales que dependían del linaje técnico de una fuente enlazada dejaron de mapearse.

## Impacto

Los siguientes resultados del run `31064458045` son diagnósticos provisionales y no baseline final:

- 12 apellidos activos todavía incompletos;
- 65 grupos de colisión;
- 142 identidades activas en colisiones;
- un empate multi-Auth;
- distribución CREATE/UPDATE/NO_OP/HOLD/PRESERVE del plan de 340 filas.

La regla de sufijo 4/6/8 sí pasó pruebas estáticas y no produjo colisiones dentro del conjunto que el planner alcanzó a mapear, pero el plan provider no puede autorizar Auth repair hasta restaurar la paridad del crosswalk.

## Correctivo de causa raíz requerido

Bloque source-only, sin provider reads:

1. hacer que `link()` del planner replique la propagación de `TECH_KEYS` del clasificador estable;
2. preservar el `basis` de cada fuente enlazada;
3. agregar gate estático de paridad de crosswalk;
4. congelar como precondición esperada `credentialsMapped=101` y `credentialsUnmapped=8`, salvo evidencia provider futura que demuestre un cambio real;
5. impedir que el plan sea `readyForAuthRepair` cuando exista drift de credenciales;
6. recalcular apellidos, colisiones y multi-Auth solo en una futura ejecución provider expresamente autorizada;
7. mantener un plan de exactamente 340 filas y una operación primaria por perfil.

## STOP_RETRY

La autorización fue consumida. No se ejecuta una segunda lectura provider para comprobar el fix. El siguiente bloque termina en source/static y requiere una nueva autorización puntual antes de revalidar datos.

## Estado seguro

Auth, contraseñas, memberships, Firestore, Rules, Storage, HR, Hosting, Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.
