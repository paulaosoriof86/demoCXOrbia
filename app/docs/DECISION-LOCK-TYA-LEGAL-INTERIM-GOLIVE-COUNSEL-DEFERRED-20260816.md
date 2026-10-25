# DECISION LOCK — TyA LEGAL INTERIM GO-LIVE · COUNSEL DEFERRED · 2026-08-16

**Estado:** `PAULA_DECISION__COUNSEL_DEFERRED__INTERIM_LEGAL_BASELINE_ALLOWED__NO_FALSE_COUNSEL_CLAIM__NO_AUTOMATIC_ACCEPTANCE`

## 1. Decisión humana vigente

Paula decidió continuar hacia producción sin detener el go-live por disponibilidad inmediata de abogado. La revisión profesional GT/HN queda **diferida**, no eliminada.

Esta decisión sustituye exclusivamente el carácter **bloqueante pre-go-live** del gate anterior `HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

No significa ni permite afirmar que:
- el texto fue revisado/aprobado por abogado;
- existe opinión jurídica profesional;
- todos los puntos GT/HN/X están jurídicamente cerrados;
- cualquier clic equivale a firma electrónica avanzada;
- cualquier captura, transferencia o cláusula arbitral es válida para todos los casos;
- una automatización puede aceptar por una persona.

## 2. Regla de continuidad

La candidata V0.3 y la matriz primaria se usan para generar una **V0.4 interina de go-live**, con lenguaje conservador y sin marcadores internos `LEGAL_REVIEW_REQUIRED` visibles al usuario.

Los asuntos de counsel se trasladan a un registro post-go-live separado y permanecen vivos hasta revisión profesional.

La V0.4 puede servir como base de publicación interina solo si:
1. no contiene placeholders públicos sin resolver;
2. los valores específicos TyA se resuelven desde autoridad provider/no-code, no desde constantes runtime;
3. la versión publicada queda inmutable;
4. se calcula `contentDigest` SHA-256 después del render final;
5. la aceptación es exclusivamente humana y autenticada;
6. no se automatiza firma/consentimiento;
7. cambios jurídicos materiales posteriores crean nueva versión y, cuando corresponda, reaceptación.

## 3. Decisiones interinas conservadoras

Mientras counsel está diferido:
- **Operador:** usar estructura factual de comerciante/empresa mercantil individual sin atribuir personalidad jurídica separada no verificada.
- **Honduras:** describir operación administrada desde Guatemala sin afirmar que no existan obligaciones locales.
- **Aceptación electrónica:** conservar evidencia robusta de acción afirmativa/identidad/versión/digest/timestamp, sin llamarla firma avanzada ni afirmar suficiencia universal.
- **Privacidad:** reconocer y habilitar los derechos/canales que sean aplicables sin prometer derechos/plazos no verificados.
- **Evidencias:** foto/video/audio/geolocalización se habilitan por proyecto; audio, biometría, reconocimiento facial y tratamientos de alto impacto no se activan globalmente y requieren gate específico.
- **Retención:** evidencia cruda default 90 días con piso de configuración 60; documentación financiera/mercantil/auditoría conserva plazos mayores cuando corresponda; legal hold suspende borrado relacionado.
- **B2B:** preferencia de negociación y arbitraje institucional cuando sea válido; usuarios individuales no reciben arbitraje universal por defecto.
- **IP/rebranding:** nombre visible, estado marcario y titular/licenciante siguen separados; no afirmar marca registrada sin referencia.
- **Domicilio:** domicilio residencial registrado permanece restringido; publicación usa únicamente nivel público aprobado/configurado.
- **Proveedores:** solo proveedores realmente activos y documentados pueden figurar como receptores actuales.

## 4. No-code / rebranding

Todo dato mutable del tenant —operador, NIT/identificación, contactos, dirección pública, países, retención, controversias, proveedores, branding/licenciante y reglas de evidencia— pertenece a configuración viva provider-authoritative.

No debe quedar fijado como constante de producto. Una edición no-code posterior no reescribe una versión legal histórica ya aceptada.

## 5. Riesgo residual aceptado como decisión operativa

La ausencia temporal de counsel se trata como **riesgo residual documentado**, no como P0 técnico que detenga Phase A.

La revisión profesional posterior deberá usar el paquete V0.3 + matriz primaria y producir una versión jurídica posterior si requiere cambios. Si el cambio es material, la Plataforma deberá evaluar reaceptación.

## 6. Seguridad preservada

Esta decisión por sí sola autoriza **continuar preparación source-only y remover el bloqueo de counsel como dependencia previa**. No ejecuta por sí misma aceptación humana, no suplanta identidad de usuario y no convierte una automatización en firmante.

Provider/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge/producción siguen sujetos a sus gates técnicos exactos.

## 7. Gate siguiente

El siguiente gate ya no es `COUNSEL_REQUIRED_BEFORE_PROVIDER`.

Pasa a:
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

La aceptación legal final dentro de la aplicación sigue siendo humana e indelegable.
