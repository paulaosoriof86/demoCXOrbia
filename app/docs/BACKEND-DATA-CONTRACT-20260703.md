# Backend data contract

Fecha: 2026-07-03

## Objetivo

Preparar el contrato tecnico para conectar CX.data a backend real sin cambiar la interfaz que consumen los modulos.

## Archivo agregado

- app/core/backend-data-contract.js

## Estado

- No se carga automaticamente.
- No activa backend.
- No escribe datos.
- No importa datos.
- No hace deploy.

## Contenido

Define:

- metodos esperados de CX.data,
- colecciones logicas,
- generador de rutas multi-tenant,
- validador de forma de CX.data.

## Seguridad

El contrato reporta safety active=false y contadores en 0.

## Uso futuro

Servira como base para el adaptador Firestore/Supabase cuando se autorice avanzar a conexion real.
