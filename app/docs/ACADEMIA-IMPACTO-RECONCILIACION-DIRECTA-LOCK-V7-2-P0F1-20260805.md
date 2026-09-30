# Academia — impacto de reconciliación directa del lock V7.2-P0F1

## Patrón reusable confirmado

Una autoridad canónica se actualiza únicamente por delta auditado:

- baseline histórico preservado;
- parent, commit, candidata y hashes trazables;
- sustitución limitada a rutas autorizadas;
- igualdad exacta obligatoria para el resto;
- gate fail-closed;
- separación entre PASS técnico, validación visual y producción.

## Lección de control plane

Codex no debe ser una dependencia del producto. El patrón operativo reusable es:

`ChatGPT audita y prepara → runner atómico aplica → runner read-only valida → humano aprueba visualmente`.

El primer intento se detuvo por evidencia `.tmp/` no ignorada. El correctivo fue excluir transitorios en `.gitignore`, no relajar allowlists ni omitir controles. El segundo intento obtuvo aplicación atómica PASS y los gates posteriores confirmaron `53/53` blobs base, `4/4` adicionales y contrato Lab PASS.

## Rutas y contenidos

No cambian rutas, roles, cursos, manuales operativos, notificaciones ni permisos. Debe agregarse al manual técnico:

- recuperación de carril directo;
- requests de una sola ejecución;
- manejo de transitorios;
- evidencia de artifacts y estados observables;
- prohibición de afirmar PASS sin gate ejecutado.

## Estado

`TECHNICAL_PASS_PENDING_DEV_VISUAL`. Sin deploy ni producción.
