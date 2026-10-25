# CAMBIOS BACKEND — ADDENDUM CORTE 4 PROTECTED SMOKE PASS

**Fecha:** 2026-07-29

## Bloque ejecutado

Paula autorizó expresamente: `Autorizo operador DEV temporal para smoke protegido de Corte 4`.

Se ejecutó el gate reversible contra el Firebase nuevo `cxorbia-tya-dev-260729-c4`:

1. Email/Password se habilitó únicamente durante el smoke DEV;
2. se creó un único operador temporal sin exponer su credencial;
3. se aplicaron claims `role=admin` y `tenantId=tya`;
4. el navegador cargó `CX.data` contra Firestore vacío bajo las Rules read-only desplegadas;
5. el principal temporal fue eliminado;
6. Email/Password volvió a quedar deshabilitado;
7. Auth users volvió a `0`.

## Evidencia del intento válido

Commit de ejecución: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Statuses sanitizados observados:

- `cxorbia/c4smoke-error-NONE`;
- `cxorbia/c4smoke-srcfirestore-etrue-fbfalse-rotrue`;
- `cxorbia/c4cleanup-u0-emailfalse`.

Esto demuestra en el intento válido:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true`;
- Auth users después del cleanup=`0`;
- Email/Password después del cleanup=`false`;
- Firestore document writes=`0`.

El executor solo termina sin `errorCategory` cuando también pasan la preservación de la interfaz pública `CX.data`, los claims `admin/tya`, los arrays vacíos, el bloqueo de escritura directa y el browser smoke. No hubo materialización de datos TyA.

## Falso negativo del publicador y corrección de raíz

El status agregado quedó `error` aunque el executor terminó sin error y con cleanup final seguro. La causa no fue Firebase ni la aplicación: el publicador exigía un segundo archivo `cleanup.source-safe.json`, pero el executor principal ya había limpiado el directorio privado después de verificar el cleanup, por lo que el paso redundante de cleanup no generaba ese segundo archivo.

Corrección aplicada en commit `9967146e112322efcd043155ae05351bbbbd4e8a`:

- el publicador acepta como evidencia de cleanup tanto `CLEANUP_VERIFIED_C4` como `main.cleanup.complete=true`;
- el workflow ya no se dispara por una modificación de su propio archivo, evitando crear otro principal temporal solo para corregir reporting;
- no se repitió el smoke ni se añadieron Auth writes por esta corrección documental/metodológica.

## Seguridad final comprobada

- Firestore document writes: `0`;
- Auth users permanentes: `0`;
- Email/Password: deshabilitado;
- Storage writes: `0`;
- Hosting deploy nuevo: `0`;
- Functions/imports/HR/Make/Gemini/pagos/lotes/merge/producción: `0`.

## Impacto Phase A

Gate 4 de Corte 4 queda técnicamente cerrado PASS. El siguiente gate real es autorización separada de Hosting DEV para el mismo build read-only, seguida de validación visual y freeze de Corte 4.

## Clasificación

- **Reusable CXOrbia:** principal Auth temporal reversible, smoke protegido sobre backend vacío y cleanup verificable; corrección de falso negativo del publicador.
- **Exclusivo cliente:** projectId DEV TyA, tenant `tya` y claims del operador temporal.
- **Claude/prototipo:** sin cambio frontend ni nueva candidata; no hay P0 de prototipo demostrado.
- **Academia:** separar ejecución real del gate, cleanup y resultado del publicador; un status agregado puede ser falso negativo si su criterio de evidencia secundaria está mal modelado.
- **Sin impacto Claude:** Auth temporal, runner, reporting y cleanup.
