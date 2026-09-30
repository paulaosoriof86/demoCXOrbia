# PENDIENTES PROTOTIPO — C6 Shopper Login Collision Classification HOLD

**Fecha:** 2026-08-05

## P0/P1 antes de Auth repair

1. Definir la regla mínima de desambiguación para 64 grupos donde existen personas activas técnicamente distintas con el mismo `nombre.apellido`.
2. Completar mediante fuente técnica verificable los apellidos de 83 perfiles activos.
3. Resolver el único perfil con dos candidatos Auth, actualmente empatados en señales técnicas.
4. Revisar seis grupos cuya pertenencia cambia o no puede confirmarse al prohibir la inferencia posicional del apellido.
5. Regenerar un plan idempotente de 340 filas y gatearlo antes de cualquier write.

## Alternativas mínimas identificadas, no aplicadas

- segundo apellido verificado;
- sufijo técnico determinístico;
- alias excepcional administrado por el tenant.

Cualquiera requiere decisión expresa. No se modifica todavía el contrato `nombre.apellido`.

## Reglas cerradas

- contraseña `Nombre123*`;
- membership no requerido;
- no fusionar por nombre visual;
- perfiles históricos se preservan;
- cero Auth/password/Firestore/deploy hasta nuevo gate.
