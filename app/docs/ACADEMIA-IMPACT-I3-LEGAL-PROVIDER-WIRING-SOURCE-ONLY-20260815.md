# ACADEMIA — IMPACTO I3 LEGAL PROVIDER / V0.4 · 2026-08-16

## Estado

La V0.4 ya fue **materializada realmente en Firebase DEV** bajo gate humano controlado; esto ya no es solo source-only. La aceptación humana todavía no ocurrió y el runtime DEV todavía no fue desplegado. Counsel GT/HN continúa diferido post-go-live y no debe presentarse como completado.

Vigentes:
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `backend/runtime/hr-live-service/legal-runtime.mjs`;
- `app/adapters/cxorbia-legal-runtime-http-v1.js`;
- `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`;
- `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

Materialización DEV: run `31961266066`, `PASS_COMMITTED_READBACK`, cuatro writes create-only y legalAcceptance `0`.

## Conceptos que Academia debe separar

1. **Configuración legal editable no-code:** operador, contactos, dirección pública, nombre visible, retención, providers, políticas y proyecto.
2. **Publicación materializada:** snapshot provider-authoritative inmutable de una versión concreta.
3. **Runtime desplegado:** capacidad real de leer/mostrar esa versión al actor autenticado.
4. **Aceptación humana:** receipt ligado a identidad autenticada exacta + versión + digest + timestamp servidor.
5. **Revisión profesional:** estado independiente (`pendiente/completada`) que nunca se infiere de CI, publicación o aceptación.

La materialización técnica de cuatro documentos **no equivale a aceptación**. En el bootstrap legalAcceptance/Auth/password reset/historical fueron `0`.

## Aceptación

QA, GitHub Actions, Make, Gemini, IA, scripts o administradores técnicos no aceptan por el usuario. `#bnOk`, navegación y localStorage no son autoridad de consentimiento.

El runtime source exige contenido completo, dos casillas no premarcadas y clic humano. `legal.acceptance.record` es self-scoped/human-confirmed; el provider deriva identidad desde ID token verificado.

## No-code y rebranding

Perfil mutable y versión publicada son distintos. Rebranding, correo o configuración posterior no reescriben una versión histórica. Marca visible, registro marcario y titular/licenciante son objetos separados.

Los valores iniciales TyA ya quedaron en provider DEV; posteriores cambios deberán gestionarse como configuración viva/autorizada y, cuando afecten contenido legal material, producir una nueva versión en lugar de reescribir la histórica.

## Por rol

**Shopper:** versión que acepta; confidencialidad; autenticidad de visita; evidencias según proyecto; seguridad de datos; incidentes.

**Admin/Operaciones:** mínimo privilegio; distinguir perfil editable, versión publicada, runtime y receipt; no sobrescribir historia; no fuzzy matching; no exponer domicilio/banco/documentos restringidos.

**Cliente:** confidencialidad recíproca; protección de identidad Shopper; uso limitado de resultados; obligaciones de datos/evidencias.

**Superadmin/tenant admin:** gestionar perfil no-code, Provider Registry, retención/evidencias y rebranding sin volver global una regla de tenant/proyecto.

## Evidencias y retención

Foto/video/audio/geolocalización/comprobantes pertenecen al proyecto. Audio/biometría/reconocimiento facial u otros tratamientos de alto impacto requieren controles adicionales cuando corresponda.

Para TyA: piso 60/default 90 días para evidencia cruda como regla operativa. Documentación empresarial, pagos, auditoría y receipts pueden tener plazos mayores o legal hold.

## Qué NO debe enseñar o simular

- que V0.4 fue revisada por abogado;
- que counsel post-go-live está cerrado;
- que materialización técnica significa aceptación;
- que runtime source significa runtime desplegado;
- aceptación automatizada;
- `#bnOk`/localStorage como consentimiento;
- domicilio restringido como público automático;
- marca no registrada como registrada;
- Cinépolis u otro proyecto como regla global;
- cualquier clic como firma avanzada;
- arbitraje universal para todo usuario.

## Próximo impacto editorial

Cuando runtime DEV esté desplegado y la aceptación humana se valide, actualizar:
- ruta por rol de aceptación legal;
- manual `Legal y cumplimiento`;
- checklist `editar perfil → publicar versión → mostrar → aceptar → verificar receipt`;
- Provider Registry;
- errores frecuentes: versión pendiente, provider/readback fallido, aceptación faltante, cambio material;
- notificación de nueva versión/reaceptación;
- estado visible de counsel sin implicar aprobación falsa.

No incluir hashes, IDs de runs, credenciales, rutas privadas ni detalles del runner en Academia visible al usuario final.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.
