# Addendum Claude/prototipo - CX.data DEV adapter TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Objetivo

Documentar para Claude/prototipo el impacto del contrato `CX.data` DEV adapter Phase A, sin pedir cambios UI inmediatos ni tocar modulos desde backend.

## Que debe entender Claude

El adapter DEV no esta activo. Es un contrato futuro para leer datos reales/sanitizados TyA sin romper la interfaz actual.

Claude no debe asumir:

- runtime conectado;
- Firestore conectado;
- HR sincronizada real;
- pagos ejecutados;
- Make/Gemini activos;
- import real ejecutado;
- certificaciones reiniciadas;
- visitas junio pendientes de ejecutar.

## Pendientes UI cuando corresponda

Prioridad 1:

1. Mostrar estado honesto de fuente: localStorage / source-safe preview / runtime DEV apagado.
2. Mostrar badges de no write/no sync/no pago/no import.
3. Evitar textos que prometan integraciones reales.

Prioridad 2:

4. Mostrar dominios Phase A: visitas, shoppers, certificaciones, liquidaciones, colas y auditoria.
5. Indicar que Cinépolis es proyecto configurable.
6. Indicar que `CX.data` mantiene la misma interfaz.

## Copy sugerido

- `Adapter DEV apagado`
- `Fuente source-safe pendiente de gate`
- `Lectura preparada · sin writes reales`
- `Pago en control · no ejecutado por CXOrbia`
- `Certificacion preservada · no pedir de nuevo sin revision`
- `Visitas junio ejecutadas · pendiente control de pago`

## No hacer

- No mostrar demo como fuente final.
- No mostrar fixture como dato real.
- No mostrar `.tmp` derivado como fuente original.
- No decir sincronizado si no hubo write HR/plataforma.
- No decir pagado si solo hay control.
- No forzar rediseño de modulos.

## Academia

Academia debe explicar `CX.data`, adapter, fallback localStorage, lectura source-safe, writes bloqueados, gates, no-reversion Level 0/1 y diferencia entre datos reales/sanitizados y demo.

## Estado

Pendiente para Claude/prototipo. Backend solo preparo contrato y validador, sin activar adapter ni runtime.
