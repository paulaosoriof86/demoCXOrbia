# Phase A — Operational Readiness R9 sobre baseline V105 / build interno V106

Fecha: 2026-07-11

## Decisión de continuidad

No se repite el empalme. El paquete recibido como `Prototype development request CXOrbia V105.zip`, con identidad interna V106, ya está empalmado como **baseline auditada de continuidad** sobre runtime R5, plan Firestore R6 y executor R8. No es source lock final ni GO de producción.

## Qué agrega R9

R9 convierte el siguiente tramo del plan en un gate ejecutable de cuatro carriles:

1. baseline V106/R8 y plan source-safe;
2. evidencia read-only de que Firebase DEV es realmente nueva y vacía;
3. dry-run limpio de pagos históricos/junio y certificaciones carryover;
4. smoke source-safe posterior al empalme.

El resultado solo puede ser:

- `HOLD_REQUIRED_INPUTS_OR_EVIDENCE`; o
- `READY_FOR_HUMAN_AUTHORIZATION_REVIEW`.

El segundo estado **no autoriza escrituras**. `materializationAuthorized` permanece siempre en `false` dentro de R9.

## Estado operativo actual

### Carril 1 — baseline y datos TyA: READY

Se valida contra la configuración viva:

- tenant `tya`;
- proyecto `cinepolis` como proyecto configurable;
- 14 periodos;
- 616 visitas;
- 213 shoppers;
- 572 liquidaciones;
- plan de 1,418 operaciones create-only;
- 0 pagos ejecutados;
- 0 writes/import/producción.

### Carril 2 — Firebase DEV nueva/vacía: PENDING EVIDENCE

Existe el verificador read-only, pero no se ejecutó porque requiere autorización explícita separada. R9 consume únicamente su reporte sanitizado; no hace llamadas a Firebase.

### Carril 3 — pagos y certificaciones: PENDING SOURCES

Se revisaron repo y File Library. Continúan faltando únicamente:

- export sanitizado de pagos/movimientos con llave estable `visitId`, `hrRowId` o `paymentItemId`;
- export sanitizado de certificaciones con `shopperId` o `shopperCode`.

Las reglas, shoppers, HR, Q1/Q2, corte de junio y carryover no se vuelven a pedir.

### Carril 4 — smoke post-empalme: PENDING SMOKE

R9 exige un artefacto reproducible source-safe que conserve 14/616/213 y confirme `imported=false`, `production=false`.

## Archivos operativos

- `backend/contracts/phase-a-operational-readiness-r9-v1.json`;
- `backend/config/phase-a-operational-readiness-r9.source-safe.json`;
- `tools/release/tya-phase-a-operational-readiness-r9.mjs`;
- `tools/release/tya-phase-a-operational-readiness-r9-validate.mjs`;
- `.github/workflows/cxorbia-phase-a-operational-readiness-r9.yml`.

## Validación

El validador cubre tres escenarios:

1. evidencia faltante mantiene HOLD y 0 autorización;
2. evidencia completa llega solo a revisión humana, nunca a permiso de escritura;
3. un reporte de importación que afirme writes queda bloqueado.

Resultado local reproducible: 3/3 PASS, 0 writes, 0 import, 0 producción.

## Impacto Phase A real

R9 evita continuar con materialización por inercia documental. Cada insumo real pendiente queda vinculado a un carril y a una validación concreta. Cuando lleguen los exports limpios, se reutiliza el importador existente y el mismo gate cambia de estado sin rehacer contratos ni lógica.

## Legacy útil recuperado y descartado

Se conserva la regla operativa comprobada: hasta mayo pagado; junio pendiente de control de pago, no de repetir visitas; certificaciones presentadas deben preservarse. Se descarta usar HTML/base legacy como export financiero o de certificaciones y se mantiene prohibida la conexión a la base vieja.

## Estado seguro

Sin cambios de frontend, sin Firebase provider calls, sin Auth, sin Firestore/Storage writes, sin import real, sin pagos, sin Make/Gemini, sin deploy y sin producción.

## Siguiente bloque exacto

1. obtener autorización separada para ejecutar el gate Firebase DEV read-only;
2. recuperar los dos exports sanitizados puntuales;
3. ejecutar dry-run existente y alimentar R9;
4. generar smoke source-safe post-empalme;
5. solo con cuatro carriles READY, preparar revisión humana de autorización; R8 dev-clean continúa bloqueado.
