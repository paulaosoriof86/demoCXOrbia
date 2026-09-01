# RESUMEN PARA CLAUDE — ADDENDUM R17N FINAL / HR ACTUAL

Fecha: 2026-07-30

## Estado prevalente

- Baseline frontend: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- No V183/R33.
- `cxorbia-backend-dev` sigue siendo backend canónico.
- `tya-plataforma` sigue siendo legacy a retirar y Hosting/URL pública a conservar para cutover.
- No nueva base Firebase.

## Fuente operativa actual

El snapshot HR del 13-jul quedó superado para identidad shopper. La fuente actual source-safe hasta julio tiene 14 periodos, 616 visitas y 208 referencias shopper. Respecto del snapshot de 210: +2 nuevas, -4 retiradas, 206 en intersección.

## Identidad real

- 201/208 refs actuales enlazan con perfiles canónicos existentes por evidencia transaccional exacta.
- 7/208 requirieron reconciliación de identidad real.
- Las 7 tienen identidad real presente en HR viva.
- 2 enlazan con perfiles legacy create-candidate.
- 5 requieren perfil nuevo desde HR viva porque no existe perfil equivalente en legacy actual ni en canonical.
- 0 HOLD de identidad actual.

La UI final debe mostrar nombre/identidad real a roles autorizados. Hash/`Shopper protegido` es solo transporte/evidencia técnica. No usar nombre solo para automerge.

## R17N FINAL

NO EXECUTE. Writes ejecutados=0.

- foundation 16;
- perfiles legacy create 120;
- perfiles HR-current create 5;
- certificaciones create 77;
- visitas 616;
- controles liquidación 572;
- total exacto potencial listo 1,406;
- tenant update HOLD;
- 22 existing-profile updates HOLD;
- 7 legacy profile holds HOLD;
- 1 certificación HOLD;
- Agosto HN HOLD;
- pagos=0.

Idempotencia offline PASS.

## Claude NO debe

- crear candidata nueva;
- tocar identidad desde UI;
- volver a 210 refs como verdad actual;
- mostrar hashes como identidad permanente;
- deduplicar por nombre;
- reabrir Corte 3/Finanzas;
- modificar workflows/backend para este bloque;
- activar provider/pago/import desde módulos UI.

## Próxima intervención frontend

Ninguna por rutina antes de materialización/smoke. Solo si el smoke posterior demuestra P0 reproducible o cuando se atienda backlog P1/P2 (PDF gráfica, Excel formato, reportKit, copy de fuentes).

## Estado seguro

PR #7 draft/open/no merge. Firestore/Auth/Storage/HR/legacy writes=0; deploy=0; producción=false.
