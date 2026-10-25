# Implementation Plan: Catálogo y pedidos por WhatsApp

**Branch**: `001-catalogo-pedidos-whatsapp` | **Date**: 2026-10-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-catalogo-pedidos-whatsapp/spec.md`

## Summary

Chaski Store es un catálogo de electrónicos sin pagos. Los clientes (celular) exploran, arman "Mi pedido" y lo envían por WhatsApp; el administrador (computadora) entra con una clave, agrega productos con foto y los quita con confirmación.

Enfoque técnico, el más simple que cumple la spec y respeta el stack de `AGENTS.md`:

- **Un solo paquete npm** con dos carpetas: `server/` (Express 5 + `node:sqlite`) y `client/` (React + Vite + Tailwind). En producción Express sirve el cliente compilado, las fotos y la API desde un solo proceso.
- **Catálogo compartido en el servidor** (SQLite + fotos en disco), porque el administrador publica desde una computadora y los clientes lo ven en sus celulares. Precios guardados como **céntimos enteros** para que los totales sean exactos (SC-003).
- **Pedido solo en el cliente** (`localStorage`), guardando únicamente `{ id de producto, cantidad }`. Precios y nombres salen siempre del catálogo, así que el total nunca se desfasa y los productos quitados se detectan solos (FR-024). No existe ningún endpoint de pedidos.
- **Sesión de administrador** con cookie de sesión (muere al cerrar el navegador), clave comparada en tiempo constante y bloqueo de 15 minutos tras 5 fallos (FR-016).
- **Reglas de negocio como funciones puras** (dinero, pedido, filtro, ficha técnica, mensaje de WhatsApp) y un servidor creado con una función `createApp(...)`, para probarlas con Vitest y supertest antes de implementarlas.

## Technical Context

**Language/Version**: JavaScript (ESM) en todo el proyecto. Node.js 22.13 o superior (requisito de `node:sqlite`; el equipo tiene Node 25).

**Primary Dependencies**: Servidor: Express 5, Zod, multer (carga de la foto). Cliente: React 19, React Router 7, Tailwind CSS 4 (plugin de Vite), fuente Inter autoalojada (`@fontsource-variable/inter`). Herramientas: Vite, Vitest, supertest, concurrently (solo para `npm run dev`). Las versiones exactas se fijan con `npm install`.

**Storage**: SQLite (`data/chaski.db`, módulo `node:sqlite`) para productos; fotos en `data/uploads/`. El pedido vive en `localStorage` del navegador del cliente. `data/` no se versiona.

**Testing**: Vitest (entorno Node) + supertest para la API; pruebas unitarias de las funciones puras del cliente. Sin jsdom ni librería de pruebas de componentes (ver research, decisión 12). `npm test` debe pasar antes de cerrar la feature.

**Target Platform**: Navegadores modernos. Clientes en celular (referencia 390 px), administrador en escritorio (referencia 1440 px); ambos funcionan en cualquier tamaño. Servidor Node en cualquier equipo con Node 22.13+.

**Project Type**: Aplicación web (cliente React + API Express) en un solo repositorio y un solo proceso en producción.

**Performance Goals**: Sin objetivos numéricos propios; la spec solo exige tiempos de tarea humanos (SC-001, SC-005). Filtro y búsqueda instantáneos porque se aplican en el navegador sobre la lista ya cargada.

**Constraints**: Español de Perú en toda la interfaz y todos los mensajes de error; precios `S/ 1,234.00` en el 100 % de las pantallas. Sin pagos y sin datos personales del cliente. Clave del administrador y número de WhatsApp solo por variables de entorno. Foto JPG, PNG o WebP de hasta 5 MB.

**Scale/Scope**: Una tienda pequeña: un administrador, catálogo de decenas de productos (se devuelve completo, sin paginación), 6 pantallas (3 de clientes, 3 de administración).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación inicial | Evaluación tras el diseño |
|-----------|--------------------|---------------------------|
| I. Simplicidad ante todo | Pasa. Un paquete, un proceso, sin ORM, sin librería de estado, sin dotenv, sin base de datos externa. | Pasa. Cada dependencia añadida (multer, React Router, concurrently) está justificada en research y es la opción más simple para su necesidad. |
| II. Idioma y mercado | Pasa. Interfaz y errores en español de Perú; formato `S/ 1,234.00` en una sola función de formato. | Pasa. Los mensajes de error de la API ya están redactados en español en el contrato. |
| III. Cero alcance fantasma | Pasa con atención: los documentos de diseño muestran elementos fuera de la spec. | Pasa. Se excluyen de forma explícita: dirección de entrega, compartir, perfil, favoritos, comparar, editar producto. Ver "Alcance excluido" abajo. |
| IV. Verificable por una persona no técnica | Pasa. Todos los criterios se comprueban en la app. | Pasa. `quickstart.md` traduce cada historia y criterio a pasos en la app, sin leer código. |
| V. Datos del usuario con respeto | Pasa. No se piden datos al cliente; clave y número por entorno. | Pasa. `.env.example` con `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`, `PORT` sin valores reales; el servidor se niega a arrancar si faltan las dos primeras. |
| VI. Pruebas primero | Pasa. Estructura pensada para probar reglas sin navegador. | Pasa. `createApp` inyectable y funciones puras; `tasks.md` debe ordenar cada prueba antes de su implementación. |
| Restricciones del producto | Pasa. Sin pagos; solo agregar y quitar productos, protegido con clave. | Pasa. No hay endpoint de edición ni de pedidos. |

**Resultado**: sin violaciones. No se requiere la tabla de Complexity Tracking.

### Alcance excluido (aunque aparezca en los diseños)

`DESIGN-comprador.md` describe un cajón con "dirección de entrega para Lima/provincias", y los diseños mencionan compartir, favoritos, comparar y filtros avanzados. La spec los deja fuera (Assumptions y FR-015), así que **no se construyen**. Los colores, tipografía, radios y espaciados de ambos documentos sí se usan como tokens de Tailwind.

## Project Structure

### Documentation (this feature)

```text
specs/001-catalogo-pedidos-whatsapp/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── research.md          # Fase 0: decisiones, motivos y alternativas
├── data-model.md        # Fase 1: tabla, DTO, pedido, sesión y bloqueo
├── quickstart.md        # Fase 1: cómo ejecutar y comprobar cada historia
├── contracts/
│   └── api.md           # Fase 1: contrato HTTP del servidor y mensaje de WhatsApp
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
└── tasks.md             # Fase 2 (lo crea /speckit-tasks, no este comando)
```

### Source Code (repository root)

```text
package.json             # un solo paquete; engines.node >= 22.13; scripts dev/test/build/start
vite.config.js           # raíz en client/, proxy de /api y /uploads al servidor en dev
vitest.config.js         # entorno Node; incluye tests/**
.env.example             # ADMIN_PASSWORD=, WHATSAPP_NUMBER=, PORT= (sin valores reales)
.gitignore               # node_modules, client/dist, data/, .env

server/
├── index.js             # lee el entorno (config.js), crea la app y escucha
├── config.js            # readConfig(env): valida ADMIN_PASSWORD, WHATSAPP_NUMBER y PORT con Zod
├── app.js               # createApp({ db, uploadsDir, adminPassword, whatsappNumber, now, secureCookies, clientDir })
├── db.js                # abre SQLite, crea la tabla, siembra una sola vez (user_version)
├── seed.js              # productos de ejemplo + copia de sus fotos
├── seed-images/         # 10 ilustraciones SVG propias de los productos de ejemplo
├── auth.js              # sesiones en memoria, comparación de clave, bloqueo por intentos
├── products.js          # rutas de productos (públicas y de administración)
├── validation.js        # esquemas Zod, conversión de precio a céntimos, mensajes en español
└── images.js            # detecta JPG/PNG/WebP por sus bytes iniciales; guarda y borra fotos

client/
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                  # rutas
    ├── index.css                # @import tailwind + tokens de diseño (@theme) + fuente Inter
    ├── lib/                     # funciones puras, con pruebas
    │   ├── money.js             # céntimos -> "S/ 4,299.00"
    │   ├── cart.js              # agregar, cambiar cantidad (1..99), quitar, vaciar, total, conciliar
    │   ├── catalog.js           # filtro por categoría + búsqueda por nombre
    │   ├── specs.js             # texto de especificaciones -> filas "Etiqueta: valor" / texto
    │   ├── whatsapp.js          # mensaje del pedido + enlace wa.me
    │   └── api.js               # fetch al servidor
    ├── state/
    │   ├── useCart.js           # hook: pedido en localStorage
    │   └── StoreContext.jsx     # catálogo cargado una vez, pedido, conciliación y aviso de productos quitados
    ├── components/              # ProductCard, CategoryChips, SearchBox, QuantityStepper,
    │                            # ConfirmDialog, CartBadge, ProductForm, ...
    └── pages/
        ├── Catalogo.jsx         # /
        ├── Detalle.jsx          # /producto/:id
        ├── MiPedido.jsx         # /pedido
        ├── AdminAcceso.jsx      # /admin
        ├── AdminPanel.jsx       # /admin/panel
        └── AdminNuevoProducto.jsx  # /admin/productos/nuevo

tests/
├── api/                 # supertest: catálogo, administración, sesión, bloqueo, validación, fotos
│                        # (helpers.js crea la app de prueba con base en memoria y reloj controlable)
└── lib/                 # unitarias: money, cart, catalog, specs, whatsapp

data/                    # (no versionado) chaski.db y uploads/
```

**Structure Decision**: aplicación web en un solo paquete, con `server/` y `client/` como carpetas hermanas (sin workspaces ni monorepo). Es la estructura mínima para el stack indicado en `AGENTS.md`. En desarrollo corren dos procesos (`vite` y `node --watch`); en producción, uno solo.

## Complexity Tracking

Sin violaciones de la constitución: no hay nada que justificar.
