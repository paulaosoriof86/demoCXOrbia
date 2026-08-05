# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_CONTRACT_PASS__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Cloud V7.1 — P0 vivo

La entrega ya es estrecha, pero el responsive continúa roto.

Causa:

- `#login` conserva `display:flex`, centrado y `padding:24px`;
- bajo 900 px `.lg2` queda centrado como flex item más ancho que el viewport.

Efectos:

- clipping lateral en 412×915 y 390×844;
- franja superior fuera de pantalla;
- formulario con coordenadas negativas;
- botón/registro fuera del scrollHeight real.

Correctivo V7.2:

```css
@media(max-width:900px){
  #login{display:block;padding:0;align-items:initial;justify-content:initial;overflow:auto}
  .lg2,.lg2-body,.lg2-aside,.lg2-main{width:100%}
  .lg2-card{width:100%;max-width:520px}
}
```

## 2. Evidencia V7.1 pendiente

La única captura llamada 1440×900 mide realmente 924×540 y es JPEG.

Faltan:

- 1920×1080;
- 768×1024;
- 412×915;
- 390×844;
- comparación antes/después;
- capturas 1/2/8/12 países.

## 3. PASS preservables

- paquete estrecho;
- app.js/layout.css únicamente;
- sintaxis, UTF-8 y secretos PASS;
- desktop correcto;
- países 1/2/8/12 en orden;
- 12 países accesibles en 1440×900;
- copy demo/técnico ausente.

## 4. Laboratorio — source contract cerrado PASS

Run comprobado:

- `30971991900`;
- artifact `8916850770`;
- digest `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Cerrado:

- cinco perfiles;
- estados Auth→cleanup;
- política `AUDIT-*`;
- fingerprints;
- cleanup exacto;
- schema de evidencia;
- prohibición de falsos PASS.

Pendiente no bloqueante:

- corregir el mapa source path esperado de `miperfil`, `misvisitas`, `aprendizaje` y `cert` antes del runtime final.

## 5. Carril de empalme

```text
V7_1_GO = false
SEND_TO_EMPALME = false
EXECUTION_LANE_READY_FOR_APPLY = false
```

No enviar a Codex.

## 6. Primer release slice

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente continúa en carril paralelo.

## 7. Deuda no bloqueante por sí sola

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel básico;
- cuatro warnings de mapa source path del Laboratorio.

## 8. Secuencia exacta

```text
CLOUD V7.2
→ AUDITORÍA FINAL
→ GO SIN P0
→ CODEX SOLO EMPALME
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ CHECKPOINT HUMANO
→ CUTOVER AUTORIZADO
```

## 9. Estado seguro

- V7.1 aplicada: no;
- empalme: 0;
- laboratorio runtime: 0;
- datos `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- provider writes: 0;
- merge/producción: 0.
