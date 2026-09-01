# Clarificación de carriles — Claude frontend vs runtime R5 backend

Fecha: 2026-07-11

## Corrección metodológica

La entrega `ENTREGA-CLAUDE-CXORBIA-R5-COMPLETAMENTE-EMPALMADA-20260711.zip` no debe usarse como baseline de edición de Claude. Mezcló en un mismo paquete la candidata frontend genérica y archivos backend-only del runtime Phase A R5, lo que contradice la separación de responsabilidades del proyecto.

R5 pertenece al mismo proyecto CXOrbia TyA, pero es la baseline operativa de ChatGPT/Codex/backend. No es otro producto ni otro repo. Sus archivos `tya-phase-a-*`, snapshot HR, adapters, contratos, validadores, importadores y entry point source-safe no deben ser importados ni modificados por Claude.

## Baselines correctas

### Claude / prototipo

Claude trabaja exclusivamente sobre la última candidata frontend genérica que ya tiene abierta: V103 incremental en `app/`.

Debe continuar únicamente cambios frontend/prototipo y devolver una candidata completa incremental. No debe importar R5, crear archivos `tya-phase-a-*`, copiar datos TyA, tocar backend/contracts/tools/workflows ni inventar conteos de 14 periodos/616 visitas/213 shoppers.

### ChatGPT/Codex / backend

La baseline operativa sigue siendo R5 empalmada. ChatGPT/Codex preservan y continúan:

- snapshot y adapters TyA;
- periodos e histórico source-safe;
- liquidación/pago/carryover;
- importadores, reviewQueue y auditEvents;
- validadores, workflows y source lock;
- empalme posterior de la candidata de Claude.

Cuando Claude entregue la siguiente candidata frontend, ChatGPT/Codex harán auditoría forense, empalme de tres vías contra R5 y nuevo smoke. Claude no realiza ese empalme.

## Instrucción vigente para Claude

Claude debe responder que entendió la separación y continuar sobre V103 con los bloques frontend ya iniciados. Los cuatro hallazgos del smoke se traducen de forma genérica:

1. Portal Cliente null-safe con empty states honestos, sin scores/NPS/rankings inventados.
2. Fixtures de usuarios/notificaciones/reservas solo en modo demo.
3. Histórico excluye por defecto periodos con estado activo, sin hardcodear TyA ni cantidades.
4. Portal Shopper responsive en 360/390/412 px, corrigiendo la causa del overflow.

Puede continuar los demás Bloques 1–10 de V103 únicamente cuando sean cambios dentro del prototipo genérico `app/`. No debe tocar ni simular backend real.

## Uso de Codex

Codex se usa solo cuando sea necesario para integración local, cambios grandes/atómicos, validaciones de navegador o tareas que el conector GitHub no pueda realizar de forma segura. Paula no debe ejecutar pasos manuales salvo que sean indispensables y se entreguen como un bloque único controlado.

## Estado seguro

Sin deploy, merge, import real, Firebase/HR writes, Make/Gemini, pagos ni producción.
