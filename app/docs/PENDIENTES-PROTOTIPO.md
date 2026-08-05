# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_ONLY_PREPARED__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Cloud V7.1 — P0 vivo

La entrega ya es estrecha, pero el responsive continúa roto.

Causa:

- la primera regla de `#login` conserva `display:flex`, centrado y `padding:24px`;
- la regla V7 posterior no los anula;
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

Debe comprobar `scrollHeight >= goReg.bottom` y cero coordenadas negativas.

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

## 4. Carril de empalme

```text
V7_1_GO = false
SEND_TO_EMPALME = false
EXECUTION_LANE_READY_FOR_APPLY = false
```

No enviar a Codex.

## 5. Laboratorio — preparación cerrada

Ya existen:

- contrato del runner;
- schema de evidencia;
- gate source-only;
- matriz Admin/Operaciones + Shopper;
- política `AUDIT-*`;
- fingerprints;
- cleanup exacto.

Pendiente:

- candidata visual GO;
- empalme aprobado/completado;
- source/static final + gate del laboratorio;
- único Hosting DEV;
- autorización aplicable para escrituras temporales;
- ejecución real y cleanup.

## 6. Primer release slice

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente continúa en carril paralelo.

## 7. Deuda no bloqueante por sí sola

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel básico.

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
