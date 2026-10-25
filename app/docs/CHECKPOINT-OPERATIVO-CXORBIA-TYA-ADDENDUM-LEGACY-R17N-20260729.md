# CHECKPOINT OPERATIVO — LEGACY SHOPPERS/CERTIFICACIONES + R17N

Fecha: 2026-07-29

## Estado
`LEGACY_REFRESH_READONLY_PASS__R17N_IDEMPOTENCE_PASS__HR_SHOPPER_CROSSWALK_UNRESOLVED__NO_WRITES__NO_PRODUCTION`

## Hecho
- Se ejecutó la autorización read-only sobre Firebase legacy `tya-plataforma`, exclusivamente nodo shopper/certificaciones.
- Fuente legacy: `tya_shoppers_extra`; no se leyeron visitas/finanzas/notificaciones legacy.
- Se comparó read-only contra `cxorbia-backend-dev`.
- Se colapsaron representaciones duplicadas del mismo shopper y espejos de certificación recuperados sin duplicar historial.
- Se reconstruyó R17N offline y pasó idempotencia.
- Se probó un crosswalk adicional por stable HR ID/code: 0/210 matches; nombre no se usó.

## Conteos fuente legacy
- 281 representaciones crudas.
- 149 shoppers únicos.
- 128 representaciones duplicadas colapsadas.
- 1 conflicto de fuente en mismo stable ID.
- 78 certificaciones útiles = 76 intentos + 2 markers; 30 recovery mirrors colapsados.
- 22 perfiles existentes enlazados por normalización determinística del mismo ID técnico.
- 120 create candidates; 7 HOLD (6 name-only review + 1 source conflict).

## R17N
- Foundation 16.
- HR protected refs 210 HOLD crosswalk.
- Legacy profiles: 120 create + 22 existing diff + 7 HOLD.
- Certificaciones: 77 candidatas + 1 HOLD.
- Visitas 616 HR-first.
- Liquidation controls 572; pagos 0.
- Potencial 1,401 antes de resolver los 22 existing profiles; máximo 1,423 incluyendo hasta 22 updates.
- Idempotence hash: `979d45fa174b8d7aac9810a4a56fb234fffeaedac1442fc811bee55ea41e2e8e` PASS.

## Existing profile diff
En los 22 stable-linked:
- teléfono faltante en 22;
- email faltante en 8;
- code no vacío distinto en 22;
- name no vacío distinto en 2;
- city no vacío distinto en 1.
Regla: fill-missing puede planificarse; jamás sobrescribir campos canónicos no vacíos por rutina.

## Bloqueo real actual
Las 210 referencias protegidas HR no hacen match por stable ID/code con los 215 shoppers existentes. Crear 210 perfiles adicionales arriesga duplicados; no crearlos deja referencias de visita sin perfil canónico.

La resolución correcta siguiente es un crosswalk read-only por identidad de visita exacta entre HR source-safe y visitas ya materializadas en `cxorbia-backend-dev` usando `hrRowId`, `sourceSheet/sourceRow` o `visitId`, sin usar nombre y sin leer visitas legacy.

## Estado seguro
Firestore/Auth/Storage/HR writes=0. Legacy writes=0. Deploy=0. Merge=false. Producción=false. Make/Gemini/pagos=0.

## Siguiente bloque exacto
`READONLY VISIT-IDENTITY CROSSWALK → R17N FINAL → IDEMPOTENCE → EXACT WRITE AUTHORIZATION → CX.data SMOKE → CORTES 6–8 → CUTOVER tya-plataforma`.
