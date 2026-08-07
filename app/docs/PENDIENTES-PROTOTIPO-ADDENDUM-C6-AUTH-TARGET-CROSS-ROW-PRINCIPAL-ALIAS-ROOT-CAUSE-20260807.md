# PENDIENTES PROTOTIPO — C6 AUTH TARGET CROSS-ROW PRINCIPAL ALIAS ROOT CAUSE

Fecha: 2026-08-07

## P0/P1 frontend

Ninguno generado por este bloque. No tocar UI.

## Pendiente backend que protege el prototipo

- Agregar invariant global de que un principal Auth existente no pueda representar simultáneamente dos profile rows.
- No usar login base compartido como ancla suficiente de identidad.
- Recalcular plan Auth 340 antes de ejecutar.
- Mantener el login suffixado determinístico para colisiones reales.
- Corregir el gate rollback para distinguir salt vacío legítimo de material no disponible.

## Validación futura

Después de Auth Activation corregido, el smoke debe confirmar acceso por rol y shopper exacto sin cruces entre identidades con login base coincidente.
