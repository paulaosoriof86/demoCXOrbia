# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `C6_RESIDUAL_IDENTITY_ROOT_CAUSE_SOURCE_ONLY_PASS__12_INSUFFICIENT__1_MULTI_AUTH_CONFIRMED__METRIC_GATE_DEFECTS_IDENTIFIED__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- HEAD de entrada del bloque: `018e35b56edaf205e46ca1e818634f78bb560528`;
- provider reads de este bloque: `0`;
- provider writes: `0`;
- producción: intacta.

## 2. Inputs source-safe

```text
current artifact sha256=ba9a559832ee2d8003ae798ae8a40cbe7e6b7582587d32053c55f16af50b134a
stable artifact sha256=4eaf9354e4ed15996237af74fcea05c5b99bc2ec97f1be063dc8d8e52f1dc95f
current report sha256=2f05b73a71c0f348ff4cdbfb4bc7391fb89011468564d8cce12973cea255cf45
current group matrix sha256=c39f53a1c40cb94d412e26c6e4933d171c488155613d2f9183e1d52445ff2f9f
current plan 340 sha256=89bdbacdf2dabbf981b4835057f0a34f3451b5fb9bf57cd1e77bf8dc57bcb749
```

## 3. Clasificación de los 12 HOLD

Los 12 fingerprints `technical_surname_unresolved` comparten en el plan:

```text
primary=HOLD
baseLoginFp=null
targetLoginFp=null
sourceSafeSurnameBasis=unresolved
resolutionBases=[]
```

Clasificación: `NO_C6_OR_INSUFFICIENT_EVIDENCE`.

El artifact no permite demostrar que la dimensión ausente sea específicamente el apellido: no exporta por separado `firstComplete`, `surnameComplete`, `passwordSeedComplete`, cantidades de candidatos ni estado de conflicto. Tampoco demuestra homonimia, alias o personas activas distintas. Los 12 permanecen HOLD y no se infiere ningún apellido.

## 4. Multi-Auth

Fingerprint `7cc28c78de9bfda01d14`: `C6_CONFIRMED`.

Tiene nombre source-safe por consenso y login objetivo único, pero al menos dos Auth continúan empatados bajo los discriminadores autorizados. No existe base técnica para escoger uno por antigüedad, orden o conveniencia. Se conserva `STOP_RETRY`.

## 5. Error de métrica 83/71/12

```text
stable incomplete active=83
completed by multi-source consensus=71
remaining incomplete active=12
83 = 71 + 12
```

No se perdieron perfiles. El planner calcula `initialIncompleteActiveProfiles` después de ejecutar el consenso, por lo que el nombre `initial` y el gate contra 83 son incorrectos.

Correctivo mínimo no aplicado:

- `preConsensusIncompleteActiveProfiles=83`;
- `completedByConsensus=71`;
- `remainingIncompleteActiveProfiles=12`;
- gate operativo únicamente sobre `remaining=0`.

## 6. Reconciliación 64/141 vs 65/142

La población provider es la misma y el crosswalk continúa `101/8`:

```text
profiles=340
authUsers=110
credentials=109
visits=616
certifications=77
liquidations=827
```

Distribuciones:

```text
stable 64/141: 55 grupos de 2, 6 de 3, 2 de 4, 1 de 5
current 65/142: 56 grupos de 2, 6 de 3, 3 de 4
```

Diagnóstico:

1. cambio legítimo de modelo: el planner nuevo acepta consenso de nombre completo para 71 perfiles;
2. defecto de gate: compara rígidamente `collisionGroups === 64` aunque cambió la regla;
3. brecha de observabilidad: los fingerprints de grupo usan namespaces distintos y no permiten unir source-safe ambos resultados.

No se demuestra qué perfil o grupo migró entre las distribuciones, ni que exista data drift. No se congela 64/141 ni 65/142 como baseline final.

## 7. Plan y bloqueo

El plan 340 anterior continúa:

```text
CREATE_AUTH=81
UPDATE_AUTH=47
NO_OP=72
HOLD=13
PRESERVE_NO_AUTH=127
readyForAuthRepair=false
executable=false
partialExecutionAllowed=false
```

## 8. Phase A preservada

Frontend canónico, módulos, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, multi-tenant, multi-proyecto, sincronización HR/plataforma, Finanzas, Portal Cliente, Portal Shopper, Reservas y Academia permanecen intactos.

## 9. Estado seguro

```text
PROVIDER_READS_THIS_BLOCK=0
PROVIDER_WRITES=0
AUTH_WRITES=0
PASSWORD_CHANGES/RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 10. Documentación vigente

- evidencia JSON de clasificación source-only;
- diagnóstico y matriz de 12 fingerprints;
- source lock;
- CAMBIOS-BACKEND;
- RESUMEN-PARA-CLAUDE;
- PENDIENTES-PROTOTIPO;
- impacto Academia;
- tracker Phase A;
- índice y PR #7.

## 11. Siguiente bloque exacto

```text
SOURCE-ONLY DIAGNOSTIC-CONTRACT ROOT FIX
→ separar métricas antes/después del consenso
→ exportar booleanos y conteos source-safe por HOLD
→ exportar vector source-safe y margen del multi-Auth
→ sustituir gate rígido 64 por reconciliación de sets con fingerprint estable
→ ejecutar source/static
→ STOP antes de provider read, repair o deploy
```
