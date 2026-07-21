# RESULTADO-INSPECCION-EXCEL-MOVIMIENTOS-TYA-20260629

## Archivo inspeccionado

```text
2026 Ingresos Egresos y Presupuesto Paula.xlsx
```

## Alcance

Se realizó inspección de estructura del workbook para identificar hojas relacionadas con T&A/TyA, Honduras y Liquidaciones.

No se importó información. No se escribió Firestore. No se modificó el archivo fuente.

## Resultado general

El workbook contiene 206 hojas.

El archivo mezcla información de varios años, negocios y posiblemente movimientos personales. Para CXOrbia/TyA solo deben considerarse las hojas vinculadas a TyA/TyA HN/Liquidación.

## Hojas relevantes detectadas

| Índice | Hoja | Rango |
|---:|---|---|
| 87 | Dic TyA | A1:J727 |
| 95 | May TyA | A1:K710 |
| 100 | Jun TyA | A1:K678 |
| 104 | Jul TyA | A1:K695 |
| 107 | Ago TyA | A1:K691 |
| 108 | Ago TyA HN | A1:K695 |
| 112 | Sep TyA | A1:L774 |
| 113 | Sep TyA HN | A1:L695 |
| 116 | Oct TyA | A1:L717 |
| 117 | Oct TyA HN | A1:L690 |
| 121 | Nov TyA | A1:L704 |
| 122 | Nov TyA HN | A1:L683 |
| 125 | Dic TyA 24 | A1:L728 |
| 126 | Dic TyA HN | A1:L684 |
| 128 | Ene TyA 25 | A1:L737 |
| 129 | Ene TyA HN | A1:K523 |
| 132 | Feb TyA 25 | A1:L713 |
| 133 | Feb TyA HN 25 | A1:K523 |
| 136 | Mar TyA 25 | A1:L664 |
| 137 | Mar TyA HN 25 | A1:K522 |
| 140 | Abr TyA 25 | A1:L606 |
| 141 | Abr TyA HN 25 | A1:K522 |
| 143 | May TyA 25 | A1:L591 |
| 144 | May TyA HN 25 | A1:K520 |
| 146 | Liquidación JN | A1:W51 |
| 147 | Jun TyA 25 | A1:L577 |
| 148 | Jun TyA HN 25 | A1:K507 |
| 150 | Jul TyA 25 | A1:P497 |
| 151 | Liquidación Jul | A1:AB34 |
| 152 | Jul TyA HN | A1:K498 |
| 154 | Ago TyA 25 | A1:P503 |
| 155 | Ago TyA HN 25 | A1:J497 |
| 156 | Liquidación Ago | A1:AB47 |
| 158 | Sept TyA 25 | A1:P506 |
| 159 | Sept TyA HN 25 | A1:J470 |
| 160 | Liquidación Sept | A1:AB49 |
| 162 | Oct TyA 25 | A1:P499 |
| 163 | Oct TyA HN 25 | A1:J470 |
| 164 | Liquidación Oct | A1:AB47 |
| 166 | Nov TyA 25 | A1:P517 |
| 167 | Nov TyA HN 25 | A1:J472 |
| 168 | Liquidación Nov | A1:AB45 |
| 171 | Dic TyA 25 | A1:P524 |
| 172 | Dic TyA HN 25 | A1:J472 |
| 173 | Liquidación Dic | A1:AB45 |
| 175 | Ene TyA 26 | A1:P518 |
| 176 | Ene TyA HN 26 | A1:J481 |
| 177 | Liquidación Ene 26 | A1:AB46 |
| 179 | Feb TyA 26 | A1:P518 |
| 180 | Feb TyA HN 26 | A1:J481 |
| 181 | Liquidación Feb 26 | A1:AB45 |
| 183 | Mar TyA 26 | A1:P519 |
| 184 | Mar TyA HN 26 | A1:J481 |
| 185 | Liquidación Mar 26 | A1:AB45 |
| 187 | Abr TyA 26 | A1:P515 |
| 188 | Abr TyA HN 26 | A1:J481 |
| 189 | Liquidación Abr 26 | A1:AB45 |
| 193 | May TyA 26 | A1:L523 |
| 194 | May HN 26 | A1:K489 |
| 195 | Liquidación May 26 | A1:AB43 |

## Observaciones importantes

- `May HN 26` debe tratarse como TyA Honduras aunque el nombre de hoja no incluya `TyA`.
- Las hojas `Liquidación...` están asociadas a TyA y deben entrar al diagnóstico financiero/pagos.
- Las hojas previas a 2025 pueden servir como referencia histórica si Paula lo autoriza, pero el alcance de migración confirmado es histórico desde 2025.
- El archivo contiene hojas no TyA que deben excluirse del importador.

## Uso recomendado

El importador financiero debe trabajar en dos etapas:

1. Inventario/dry-run de hojas permitidas.
2. Transformación controlada a movimientos, beneficios, pagos, lotes y conciliaciones.

## Restricciones conservadas

- No se escribió Firestore.
- No se importó el Excel.
- No se creó Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
