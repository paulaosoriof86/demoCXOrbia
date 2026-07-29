# ACADEMIA — Impacto Corte 4 read-only — 2026-07-29

## Estado pedagógico

Corte 3 puede enseñarse como baseline aprobado. Corte 4 inicia con backend de lectura estricta y proveedor todavía no activado.

## Conceptos a incorporar

### Interfaz estable

La UI sigue consumiendo `CX.data`. El cambio de localStorage/mock a Firestore se realiza detrás de esa interfaz, sin trasladar lógica backend a módulos UI.

### Backend vacío real

Una base nueva y vacía debe mostrarse como vacía. No se rellena silenciosamente con datos demo para ocultar el estado real.

### Fail-closed

Si una lectura falla:

- no se usan datos mock como si fueran fuente real;
- no se habilitan escrituras;
- se conserva estado vacío/source-safe;
- se registra el error para diagnóstico.

### Guard cliente vs Firestore Rules

El guard de cliente evita llamadas accidentales, pero no sustituye Rules. La seguridad real requiere Rules que nieguen create/update/delete.

### Fases

- Corte 4: lectura admin DEV.
- Corte 5: materialización con dry-run/idempotencia.
- Corte 6: Auth/RBAC shopper/cliente.
- Corte 7: sincronización e integraciones.

## Caso vigente

Las Rules actuales permiten escrituras por rol; por eso no pueden desplegarse para Corte 4 read-only. Se preparó un candidato no desplegado de lectura para operadores autenticados.

## Estado seguro

No se activó proveedor, no se desplegaron Rules y no se escribieron datos.
