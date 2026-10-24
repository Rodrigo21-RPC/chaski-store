<!--
Sync Impact Report
- Versión: plantilla sin llenar → 1.0.0 (primera ratificación)
- Principios añadidos: I. Simplicidad ante todo; II. Idioma y mercado; III. Cero alcance
  fantasma; IV. Verificable por una persona no técnica; V. Datos del usuario con respeto;
  VI. Pruebas primero
- Secciones añadidas: Restricciones del producto; Flujo de trabajo
- Secciones eliminadas: ninguna
- Pendientes: ninguno
-->
# Chaski Store Constitution

Chaski Store es una tienda virtual de productos electrónicos que funciona como catálogo:
el administrador agrega y quita productos, y los clientes envían su pedido por WhatsApp.

## Core Principles

### I. Simplicidad ante todo
Entre dos soluciones, se elige siempre la más simple. Esta es una versión 1: no se agrega
complejidad anticipada, ni abstracciones, ni opciones "por si acaso".

### II. Idioma y mercado
Todo el producto (textos, mensajes, errores) está en español de Perú. La moneda es el sol
peruano (S/) y todo precio se muestra con dos decimales (por ejemplo, S/ 25.00).

### III. Cero alcance fantasma
NO se implementa ninguna funcionalidad que no esté escrita en la spec. Si surge una idea
nueva, se propone para que se agregue a la spec; no se construye mientras tanto.

### IV. Verificable por una persona no técnica
Cada criterio de éxito debe poder comprobarse usando la app, sin leer código. Un criterio
que solo se pueda confirmar revisando el código no es válido.

### V. Datos del usuario con respeto
Se pide solo lo imprescindible a clientes y administrador. No se escriben claves ni secretos
en el código: la clave del administrador y el número de WhatsApp van en variables de entorno,
y el repositorio incluye un archivo `.env.example` con los nombres de esas variables y sin
valores reales.

### VI. Pruebas primero
Toda regla de negocio tiene una prueba automática que falla antes de implementarla. El
comando `npm test` MUST pasar antes de cerrar una feature.

## Restricciones del producto

- Chaski Store es un catálogo: no procesa pagos ni cobros en línea. El pedido se envía
  por WhatsApp.
- Las únicas acciones del administrador son agregar y quitar productos, protegidas con su clave.

## Flujo de trabajo

- Cada feature sigue el orden: spec, plan, tareas, implementación.
- Una feature se cierra solo si sus criterios de éxito se comprobaron en la app (Principio IV)
  y `npm test` pasa (Principio VI).

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Para enmendarla se
documenta el cambio y su motivo, y se actualiza la versión: MAJOR si se elimina o redefine un
principio, MINOR si se agrega un principio o sección, PATCH si solo se aclara la redacción.
Toda spec, plan y revisión MUST verificar el cumplimiento de estos principios; cualquier
excepción se justifica por escrito.

**Version**: 1.0.0 | **Ratified**: 2026-10-24 | **Last Amended**: 2026-10-24
