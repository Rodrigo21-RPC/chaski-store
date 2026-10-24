# Chaski Store

Tienda virtual de electrónicos: catálogo de productos y pedidos por WhatsApp.
El administrador agrega y quita productos; los clientes envían su pedido por WhatsApp.

## Stack

- Cliente: React + Vite + Tailwind CSS
- Servidor: Express (Node) con SQLite mediante `node:sqlite`
- Validación: Zod
- Pruebas: Vitest + supertest
- Todo en JavaScript. Requiere Node 22.13 o superior (por `node:sqlite`).

## Comandos (local)

- `npm install`: instala dependencias
- `npm run dev`: arranca cliente y servidor en desarrollo
- `npm test`: corre las pruebas (debe pasar antes de cerrar una feature)
- `npm start`: arranca la app en modo producción

## Convenciones

- Todo el producto en español de Perú; precios en soles con dos decimales (S/ 25.00).
- La solución más simple gana; nada de complejidad anticipada (es una versión 1).
- No se construye nada que no esté en la spec; las ideas nuevas se proponen.
- Pruebas primero: la prueba de cada regla de negocio falla antes de implementarla.
- Sin claves ni secretos en el código: clave del administrador y número de WhatsApp
  van en variables de entorno; `.env.example` lista sus nombres sin valores reales.
- Pedir al usuario solo los datos imprescindibles.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md
