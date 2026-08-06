# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_RUN_REGISTRATION_PROVEN__V2_V3_CANCELLED_BEFORE_STEPS__PROVIDER_READS_0_PROVEN__DIAGNOSTIC_LOOP_CLOSED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V2-V3-RUNNER-CANCELLATION-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- universo Shopper 65/65;
- SKIP13: `HOLD=0`, historia preservada;
- Login, Auth/RBAC source-only, Finanzas, Portales y Reservas;
- root fixes de HR viva;
- registro, sintaxis, trigger `push`, rama y path del workflow;
- consumo provider v2/v3: cero probado;
- bucle de diagnóstico de “run no observable” cerrado.

## 3. Causa raíz cerrada

```text
v2 run=31117638647 job=92671263961 cancelled steps=0
v3 run=31123402722 job=92688738677 cancelled steps=0
provider boundary reached=false
provider reads total=0 PROVEN
```

Los runs existieron. Los jobs fueron cancelados antes del runner. Por eso no pudieron publicar el checkpoint inicial ni ejecutar acceso provider.

## 4. P0 único actual

Una nueva lectura HR viva, únicamente con autorización fresca, para confirmar:

- `2026-08`;
- tabs GT/HN;
- conteos vivos;
- mutación histórica;
- `sourceRevision` transversal.

No corresponde otra ronda de diagnóstico del reconocimiento de GitHub Actions.

## 5. Orden inmediato hacia producción

1. Una lectura HR viva controlada.
2. Con PASS, preparar y ejecutar Auth SKIP13 con gate separado.
3. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
4. Validación humana sobre una sola URL/build.
5. Source lock, rollback y autorización específica de producción.
6. Único cutover.

## 6. No hacer

- No volver a inferir ausencia de run desde ausencia de status.
- No hardcodear periodos o conteos.
- No reabrir SKIP13 ni 65/65.
- No pedir nueva candidata, rama o PR.
- No ejecutar Auth, deploy, merge o producción sin gate separado.

## 7. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes permanecen documentadas, pero no sustituyen el P0 operativo de HR viva.

## 8. Seguridad

```text
request modificado=false
workflow modificado=false
nuevo trigger=0
provider reads del bloque=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
