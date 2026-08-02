# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_UNIFIED_CUMULATIVE_RUNTIME_AND_PROJECT_FINANCE_GUARD_APPLIED_PENDING_READONLY_RUNTIME_GATES`

## 1. Baseline única

Claude debe continuar sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No puede crear una versión paralela, un shell reducido ni escoger módulos aislados.

La HR viva contiene todos los periodos detectados desde junio 2025 hasta julio 2026 en la revisión actual. Agosto todavía no existe. Ninguna UI puede usar el reloj del sistema para inventar un periodo.

Los conteos actuales 14 periodos / 616 visitas / 208 shoppers son una fotografía de la revisión vigente, no un contrato permanente.

## 2. Regresiones que no se pueden repetir

- entrada humana sin Auth real;
- Shopper sin identidad;
- KPI/fases divergentes;
- histórico/comparativo incompleto;
- perfiles/certificaciones ausentes;
- Cliente y Finanzas degradados;
- regalías tratadas como regla global;
- clasificación de proyecto por nombre;
- honorario del shopper usado como fallback de ingreso delegado.

## 3. Contrato recuperado

La URL humana normal debe contener una sola experiencia:

- selección de perfil + Usuario/Contraseña en el mismo login;
- Firebase Auth/claims;
- HR viva para todos los periodos, visitas y estados;
- Firestore exacto para perfil/PII/certificación;
- read model canónico;
- comparativo de todos los periodos detectados;
- Portal Shopper exacto;
- Portal Cliente completo;
- Finanzas canónicas.

Cinépolis conserva:

- honorario Shopper Q60 GT / L200 HN;
- modelo delegado desde su `projectConfig`;
- facturación local: no;
- regalías: 0;
- comisión de coordinación compartida;
- monto, participantes, reparto y tratamiento tributario solo desde configuración real.

## 4. Modelo financiero por proyecto

Backend soporta:

- `directo/local_invoicing`;
- `delegado/delegated_coordination`;
- `regional/regional_coordination`.

Reglas:

- directo puede tener regalías si se configuran;
- delegado/regional siempre normalizan regalías locales a 0;
- la clasificación sale de los campos del proyecto, nunca del nombre;
- el honorario del shopper no es ingreso delegado;
- el ingreso delegado/regional sale de comisión explícita;
- el margen solo se calcula con comisión y distribución exactas;
- si falta fuente, pasa a revisión; no se inventan valores.

Contratos protegidos:

- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-delegated-coordination-finance-guard-v1.js`.

## 5. Archivos backend protegidos

- `app/index-backend-dev.html`;
- `app/core/tya-phase-a-source-safe-preview.js`;
- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-delegated-coordination-finance-guard-v1.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`;
- `app/adapters/tya-cumulative-read-model-v2.js`;
- `app/adapters/tya-c6-domain-consistency-bridge.js`;
- `app/adapters/tya-canonical-shopper-portal-v2.js`;
- `app/adapters/tya-canonical-finance-read-model-v2.js`.

Claude no debe mover estas reglas a los módulos UI ni reintroducir carriles alternos.

## 6. Contrato dinámico de HR

`tya-protected-auth-hr-authority-bridge-v2.js` exige:

- fuente source-safe y no vacía;
- periodos detectados con llave única;
- cada visita con llave técnica única;
- cada visita vinculada a un periodo existente;
- salida con la misma cantidad de periodos y visitas que la revisión HR;
- cero append de visitas protegidas;
- cero duplicados técnicos;
- identidad Shopper únicamente por crosswalk exacto.

## 7. Ajustes frontend exactos para Claude

### `app/modules/proyecto-wizard.js`

El wizard ya tiene `Facturado directamente` y `Delegado (franquicia)`. Debe:

- conservar esas opciones;
- agregar `Regional` como tercera opción aprobada;
- enviar `modelo:'regional'` al mismo `CX.data.addProject`;
- mostrar regalías solo para directo;
- no pedir regalías a delegado/regional;
- no duplicar el cálculo del adapter.

### `app/modules/finanzas.js`

Reemplazar el copy delegado:

- incorrecto: “honorario recibido menos lo pagado al shopper”;
- correcto: comisión de coordinación recibida y distribución configurada; honorarios/reembolsos del shopper son obligaciones separadas.

La UI debe mostrar `pending_or_review` cuando falten comisión o distribución exactas, no presentar margen inventado.

## 8. Otros ajustes frontend solo si runtime los demuestra

- visualización de comisión y reparto cuando exista fuente real;
- copy de estados financieros;
- presentation de review queue de identidades;
- detalle administrativo de certificación;
- formato final de PDF/Excel/exportaciones.

## 9. Gate antes de otra candidata o deploy

Debe probar en la misma URL y sesión:

- staff/cliente/shopper autenticados;
- todos los periodos HR;
- KPI = fase = detalle;
- comparativo completo;
- identidad única;
- perfil/certificación/histórico;
- Cliente;
- Finanzas con fuente canónica;
- Cinépolis delegado y regalías 0;
- honorario Shopper nunca usado como ingreso;
- margen solo con comisión/reparto exactos;
- selector directo/delegado y soporte regional;
- tres recargas;
- cero writes.

## 10. Academia

Actualizar manuales para enseñar fuente viva, baseline acumulativa y diferencia entre facturación local, coordinación delegada, distribución regional e importes del shopper.
