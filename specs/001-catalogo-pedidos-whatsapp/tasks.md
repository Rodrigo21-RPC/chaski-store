---

description: "Lista de tareas de Catálogo y pedidos por WhatsApp"
---

# Tasks: Catálogo y pedidos por WhatsApp

**Input**: Design documents from `/specs/001-catalogo-pedidos-whatsapp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: INCLUIDAS Y OBLIGATORIAS. El Principio VI de la constitución exige que toda regla de negocio tenga una prueba automática que **falle antes** de implementarla, y que `npm test` pase antes de cerrar la feature. En cada historia, las tareas de pruebas van primero y llevan una tarea de "confirmar que fallan".

**Organization**: Las tareas se agrupan por historia de usuario para poder implementar y comprobar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin depender de tareas incompletas)
- **[Story]**: historia a la que pertenece (US1 a US4)
- Todas las rutas son relativas a la raíz del repositorio `chaski-store/`

## Path Conventions

Aplicación web en un solo paquete (ver plan.md, "Project Structure"): `server/` (Express), `client/src/` (React), `tests/api/` y `tests/lib/` (Vitest). Datos en `data/` (no versionado).

Convenciones de código para todas las tareas: JavaScript ESM, español de Perú en todo texto visible, precios siempre con `formatPrice` (nunca `toFixed` ni formato a mano), sin claves ni secretos en el código. Las pantallas siguen las Vercel Web Interface Guidelines (foco visible, etiqueta en cada campo, objetivos táctiles de 44 px o más, error junto al campo) y los tokens de `docs/diseno/DESIGN-comprador.md` y `docs/diseno/DESIGN-administrador.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el proyecto y su estructura.

- [X] T001 Crear `package.json` con `"type": "module"`, `"engines": { "node": ">=22.13" }` y los scripts `dev` (`concurrently -n server,client "node --watch --env-file-if-exists=.env server/index.js" "vite"`), `build` (`vite build`), `prestart` (`npm run build`), `start` (`node --env-file-if-exists=.env server/index.js`) y `test` (`vitest run`). Dependencias: `express` (5), `multer`, `zod`, `react`, `react-dom`, `react-router-dom`, `@fontsource-variable/inter`. Dependencias de desarrollo: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `vitest`, `supertest`, `concurrently`. Ejecutar `npm install`.
- [X] T002 [P] Crear `vite.config.js` (raíz `client/`, plugins de React y Tailwind, `build.outDir` a `client/dist` con `emptyOutDir`, proxy de `/api` y `/uploads` a `http://localhost:3000`) y `vitest.config.js` (entorno `node`, `include: ['tests/**/*.test.js']`).
- [X] T003 [P] Crear `.gitignore` (`node_modules`, `client/dist`, `data/`, `.env`) y `.env.example` con exactamente los nombres `ADMIN_PASSWORD=`, `WHATSAPP_NUMBER=` y `PORT=` sin valores reales, más un comentario en español que explique cada uno (Principio V).
- [X] T004 [P] Crear `client/index.html` (`lang="es-PE"`, viewport, título "Chaski Store"), `client/src/main.jsx` y `client/src/index.css` con `@import "tailwindcss"`, `@import "@fontsource-variable/inter"` y los tokens en `@theme` (lienzo `#0F1115`, superficie `#181B22`, borde `#282D37`, texto `#F3F4F6`, texto secundario `#9CA3AF`, acento `#3B82F6`, WhatsApp `#25D366`, destructivo `#EF4444`, radios 16 y 8 px, fuente Inter).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura que TODAS las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

- [X] T005 [P] Escribir la prueba `tests/lib/money.test.js` (debe fallar): `formatPrice(429900)` da `"S/ 4,299.00"`, `formatPrice(2500)` da `"S/ 25.00"`, `formatPrice(5)` da `"S/ 0.05"`, `formatPrice(100000000)` da `"S/ 1,000,000.00"`; siempre símbolo `S/` y exactamente dos decimales (FR-005, SC-002).
- [X] T006 Implementar `client/src/lib/money.js` con `formatPrice(cents)` solo con aritmética entera (separador de miles `,` y punto decimal fijos, independientes del idioma del navegador). Debe pasar T005.
- [X] T007 [P] Escribir la prueba `tests/api/config.test.js` (debe fallar) para `readConfig(env)`: sin `ADMIN_PASSWORD` o con valor vacío lanza un error cuyo mensaje, en español, nombra la variable; sin `WHATSAPP_NUMBER` igual; `WHATSAPP_NUMBER` válido solo con dígitos, de 8 a 15, sin `+`, sin espacios (`"51999999999"` pasa; `"+51 999"` y `"abc"` fallan); `PORT` ausente da 3000; `PORT` válido se convierte a número.
- [X] T008 Implementar `server/config.js` con `readConfig(env)` usando Zod (devuelve `{ adminPassword, whatsappNumber, port }`). Debe pasar T007. (Archivo añadido a la estructura del plan para poder probar la lectura del entorno.)
- [X] T009 [P] Escribir la prueba `tests/api/db.test.js` (debe fallar) para `openDb(':memory:')`: crea la tabla `products`; rechaza una `category` fuera de `Celulares`, `Laptops`, `Accesorios`; rechaza `price_cents` igual a 0 o negativo; rechaza `name`, `description` o `image` nulos; `specs` por defecto `''`; `id` autoincremental creciente; `PRAGMA user_version` es 0 en una base nueva.
- [X] T010 Implementar `server/db.js` con `openDb(path)` sobre `DatabaseSync` de `node:sqlite` que crea la tabla `products` con estas columnas exactas: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `name TEXT NOT NULL`, `category TEXT NOT NULL CHECK (category IN ('Celulares','Laptops','Accesorios'))`, `price_cents INTEGER NOT NULL CHECK (price_cents > 0)`, `description TEXT NOT NULL`, `specs TEXT NOT NULL DEFAULT ''`, `image TEXT NOT NULL`. Debe pasar T009.
- [X] T011 Crear `tests/api/helpers.js` con `makeTestApp(options)`: base `:memory:`, carpeta temporal de fotos (`fs.mkdtempSync`), clave `clave-de-prueba`, número `51999999999`, reloj controlable (`clock.now()` y `clock.advance(ms)`), y devuelve `{ app, db, uploadsDir, clock, cleanup }`. Incluir `loginAgent(app)` que devuelve un `supertest.agent` con sesión iniciada (se completa en la fase de la Historia 3).
- [X] T012 Escribir la prueba `tests/api/app.test.js` (debe fallar): una ruta `/api/...` inexistente responde 404 JSON `{ "error": "No encontramos lo que buscas." }`; `/uploads/<archivo>` sirve el archivo con `X-Content-Type-Options: nosniff` y `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`; un nombre inexistente en `/uploads/` da 404 y no cae en `index.html`; con `clientDir` configurado, una ruta del cliente como `/pedido` devuelve `index.html`; sin `clientDir`, no.
- [X] T013 Implementar `server/app.js` con `createApp({ db, uploadsDir, adminPassword, whatsappNumber, now = Date.now, secureCookies = false, clientDir })`: `express.json()`, estáticos de `/uploads` con las dos cabeceras de T012, 404 JSON para `/api`, servir `clientDir` con respaldo a `index.html` para rutas que no empiecen por `/api` ni `/uploads`, y manejador de errores que responde JSON con mensaje en español. Debe pasar T012.
- [X] T014 Implementar `server/index.js`: lee el entorno con `readConfig(process.env)` (si falla, imprime el mensaje en español en la consola y sale con código 1), crea `data/` y `data/uploads/`, abre `data/chaski.db`, crea la app con `clientDir: 'client/dist'` y `secureCookies: process.env.NODE_ENV === 'production'`, y escucha en el puerto configurado.
- [X] T015 [P] Implementar `client/src/lib/api.js` con un envoltorio de `fetch` que devuelve el JSON o lanza `ApiError { status, body }`; se agregan las funciones de cada historia en sus fases.
- [X] T016 [P] Crear `client/src/App.jsx` con `BrowserRouter` y la estructura de rutas (sin pantallas todavía) y conectarlo en `client/src/main.jsx`.
- [X] T017 Ejecutar `npm test` y confirmar que T005 a T013 pasan, y `npm run dev` con un `.env` local de prueba para confirmar que el servidor arranca y el cliente carga una página en blanco sin errores.

**Checkpoint**: base lista; las historias pueden empezar.

---

## Phase 3: User Story 1 - Explorar el catálogo y ver un producto (Priority: P1) 🎯 MVP

**Goal**: el cliente ve los productos (más reciente primero) con foto, nombre y precio; filtra por categoría, busca por nombre y abre el detalle con su ficha técnica.

**Independent Test**: abrir la tienda en el celular, tocar "Laptops" y ver solo laptops; escribir "iphone" y ver solo ese producto; abrir un producto y volver con "Volver" (quickstart, Historia 1).

### Tests for User Story 1 (escribir PRIMERO; deben FALLAR) ⚠️

- [X] T018 [P] [US1] Escribir `tests/lib/catalog.test.js`: `filterProducts(products, { category, query })` devuelve todos con categoría `Todos` y consulta vacía; filtra por categoría exacta; busca por nombre sin distinguir mayúsculas ni minúsculas (`"IPHONE"` encuentra "iPhone 15 Pro"); combina categoría y búsqueda (`Laptops` + `mac` solo MacBook); conserva el orden recibido; devuelve `[]` si nada coincide; ignora espacios sobrantes de la consulta; la búsqueda solo mira el nombre, no la descripción (FR-002, FR-003).
- [X] T019 [P] [US1] Escribir `tests/lib/specs.test.js`: `parseSpecs(text)` convierte cada línea `Etiqueta: valor` en `{ type: 'row', label, value }` (divide en el primer `:`), las demás líneas no vacías en `{ type: 'text', text }`, ignora líneas vacías, recorta espacios, y devuelve `[]` para texto vacío; `"Garantía: 12 meses: nacional"` da etiqueta `Garantía` y valor `12 meses: nacional` (supuesto de ficha técnica de la spec).
- [X] T020 [P] [US1] Escribir `tests/api/seed.test.js`: `seedIfNew(db, uploadsDir)` inserta los 10 productos de ejemplo definidos en T026 en una base con `user_version` 0, deja `user_version` en 1, copia sus 10 fotos a `uploadsDir` y cada `image` insertada existe como archivo; una segunda llamada no inserta nada; tras borrar todos los productos directamente en la base y volver a llamar, el catálogo sigue vacío; al menos un producto de cada categoría y exactamente una laptop con "Mac" en el nombre y un solo celular con "iPhone" en el nombre.
- [X] T021 [P] [US1] Escribir `tests/api/products-read.test.js`: `GET /api/products` con la base vacía da `200 []`; con productos insertados devuelve el DTO exacto de data-model.md (`id`, `name`, `category`, `priceCents`, `description`, `specs`, `imageUrl` = `/uploads/` + archivo) ordenado por `id` descendente (el último insertado primero); `GET /api/products/:id` da 200 con el producto, 404 con `{ "error": "Este producto ya no está disponible." }` si no existe, y 404 para `abc`, `0`, `-1` y `1.5`; `GET /api/config` da `{ "whatsappNumber": "51999999999" }`.
- [X] T022 [US1] Ejecutar `npm test` y confirmar que T018 a T021 FALLAN por la razón esperada (módulos o rutas inexistentes), no por errores de sintaxis.

### Implementation for User Story 1

- [X] T023 [P] [US1] Implementar `client/src/lib/catalog.js` con `CATEGORIES = ['Todos','Celulares','Laptops','Accesorios']` y `filterProducts`. Debe pasar T018.
- [X] T024 [P] [US1] Implementar `client/src/lib/specs.js` con `parseSpecs`. Debe pasar T019.
- [X] T025 [P] [US1] Crear 10 ilustraciones sencillas y propias en `server/seed-images/` (SVG de 800×800, sin scripts ni referencias externas, fondo plano según la categoría y el nombre del producto como texto): `iphone-15-pro.svg`, `galaxy-s24.svg`, `redmi-note-13.svg`, `macbook-air-m2.svg`, `ideapad-3.svg`, `asus-tuf-f15.svg`, `ssd-kingston-1tb.svg`, `audifonos-bluetooth.svg`, `cargador-usb-c-65w.svg`, `mouse-inalambrico.svg`. Nunca usar imágenes de otras tiendas.
- [X] T026 [US1] Implementar `server/seed.js` con `seedIfNew(db, uploadsDir)`: si `PRAGMA user_version` es 0, copia las imágenes de T025 a `uploadsDir` con nombre aleatorio (`crypto.randomUUID()` + `.svg`), inserta en este orden (el último insertado queda primero en el catálogo) y sube `user_version` a 1 en una sola transacción. Productos (nombre, categoría, precio en céntimos): iPhone 15 Pro 256GB, Celulares, 429900; Samsung Galaxy S24 128GB, Celulares, 329900; Xiaomi Redmi Note 13, Celulares, 89900; MacBook Air M2 13", Laptops, 549900; Lenovo IdeaPad 3 15", Laptops, 259900; ASUS TUF Gaming F15, Laptops, 399900; SSD Kingston NV2 1TB, Accesorios, 30000; Audífonos Bluetooth Pro, Accesorios, 12900; Cargador USB-C 65W, Accesorios, 8900; Mouse inalámbrico Silent, Accesorios, 5900. Cada uno con `description` en español de Perú de una o dos frases y `specs` con líneas `Etiqueta: valor` (por ejemplo `Pantalla: 6.1 pulgadas`). Llamar a `seedIfNew` desde `server/index.js`. Debe pasar T020.
- [X] T027 [US1] Implementar en `server/products.js` las rutas públicas `GET /api/products`, `GET /api/products/:id` (id entero positivo) y en `server/app.js` `GET /api/config`, mapeando fila a DTO. Montarlas en `createApp`. Debe pasar T021.
- [X] T028 [P] [US1] Implementar `client/src/state/StoreContext.jsx`: carga `GET /api/products` al iniciar, expone `{ products, status: 'loading' | 'ready' | 'error', refresh }`; `refresh()` vuelve a pedir la lista. Mensaje de error genérico "No pudimos cargar los productos. Intenta de nuevo." con botón "Reintentar". Alcance: solo el catálogo; el detalle y el panel de administración no tienen pantalla de error de carga propia.
- [X] T029 [P] [US1] Crear los componentes `client/src/components/CategoryChips.jsx` (botones con `aria-pressed`; activo con fondo `rgba(59,130,246,0.15)` y borde `#3B82F6`), `SearchBox.jsx` (`<input type="search">` con etiqueta accesible, 48 px de alto) y `ProductCard.jsx` (foto 1:1 con `alt` = nombre, nombre recortado a dos líneas con `overflow-wrap: anywhere`, precio con `formatPrice` en negrita con `tabular-nums`; toda la tarjeta enlaza a `/producto/:id`; sin botón de pedido todavía).
- [X] T030 [P] [US1] Crear `client/src/components/CustomerLayout.jsx`: encabezado con "Chaski Store" (enlace a `/`) y `<Outlet />`; ancho fluido con márgenes de 16 px y base de 390 px. Sin ningún enlace hacia `/admin` (FR-025).
- [X] T031 [US1] Crear `client/src/pages/Catalogo.jsx`: título, `SearchBox`, `CategoryChips`, cuadrícula de dos columnas en celular (más columnas en pantallas anchas); usa `filterProducts`; llama a `refresh()` al montarse; muestra "No encontramos productos" cuando el filtro no encuentra nada y "Aún no hay productos disponibles" cuando el catálogo está vacío.
- [X] T032 [US1] Crear `client/src/pages/Detalle.jsx`: pide `GET /api/products/:id`; muestra foto, categoría, nombre, precio, descripción completa y ficha técnica (`parseSpecs`: filas con la etiqueta al 40 % y el valor al 60 % con rayado alterno, y el texto suelto como párrafo; todos los textos largos del producto usan `overflow-wrap: anywhere` para no desbordar el diseño) y un botón "Volver" (a la pantalla anterior, o a `/` si no hay historial). Si responde 404 muestra "Este producto ya no está disponible" con enlace al catálogo. Agregar la función `getProduct(id)` en `client/src/lib/api.js`.
- [X] T033 [US1] Conectar en `client/src/App.jsx` el `StoreProvider` y las rutas `/` (Catalogo) y `/producto/:id` (Detalle) dentro de `CustomerLayout`.
- [X] T034 [US1] Ejecutar `npm test` (T018 a T021 y todo lo anterior en verde) y recorrer a mano la Historia 1 del `quickstart.md` en una vista de 390 px y en una de escritorio, comprobando también el SC-002 (todo precio con `S/` y dos decimales).

**Checkpoint**: la Historia 1 funciona sola y ya es una tienda consultable.

---

## Phase 4: User Story 2 - Armar el pedido y enviarlo por WhatsApp (Priority: P1)

**Goal**: el cliente agrega productos a "Mi pedido", ajusta cantidades (1 a 99), quita líneas o vacía todo, ve el total y abre WhatsApp con el resumen ya escrito. Sin pagos ni datos personales.

**Independent Test**: agregar un iPhone y dos SSD, ver 3 unidades y el total correcto, tocar "Enviar pedido por WhatsApp" y comprobar que WhatsApp se abre con el resumen, y que el pedido sigue intacto (quickstart, Historia 2).

### Tests for User Story 2 (escribir PRIMERO; deben FALLAR) ⚠️

- [X] T035 [P] [US2] Escribir `tests/lib/cart.test.js` sobre funciones puras de `client/src/lib/cart.js`: `addItem` en pedido vacío crea la línea con cantidad 1; repetir el producto suma 1 sin crear otra línea (FR-008); `setQuantity` y `changeQuantity` respetan mínimo 1 (con 1, "−" no cambia nada) y máximo 99 (con 99, "+" y `addItem` no cambian nada); `canIncrease(quantity)` es `false` desde 99 y `true` por debajo; `showUnitPrice(quantity)` es `true` solo si la cantidad es mayor que 1; `canClear(lines)` es `false` con el pedido vacío y `true` con al menos una línea (FR-026); `removeItem` quita la línea; `clearCart` deja `[]`; `countUnits` suma todas las cantidades (FR-009); `lineSubtotal` y `cartTotal` en céntimos enteros, con **tres pedidos de ejemplo**, uno de ellos con un producto repetido, incluyendo `1299.90 × 3` (SC-003); `reconcile(lines, products)` elimina las líneas cuyo producto ya no existe y devuelve `{ lines, removedCount }` (FR-024); `parseStoredCart(json)` devuelve `[]` para JSON dañado, para algo que no es lista y para `null`, descarta líneas sin `productId` y `quantity` enteros, y ajusta cantidades fuera de 1 a 99 al rango.
- [X] T036 [P] [US2] Escribir `tests/lib/whatsapp.test.js` sobre `client/src/lib/whatsapp.js`: `buildOrderMessage(lines)` produce exactamente el formato de contracts/api.md (`Hola Chaski Store, quiero hacer este pedido:`, línea en blanco, `1. iPhone 15 Pro 256GB x1 = S/ 4,299.00`, `2. SSD Kingston NV2 1TB x2 = S/ 600.00`, línea en blanco, `Total: S/ 4,899.00`); incluye todos los productos con su cantidad y subtotal (SC-004); no contiene nombre, teléfono, dirección ni correo; `buildWhatsAppUrl(lines, number)` empieza con `https://wa.me/51999999999?text=` y su texto decodificado es igual al mensaje; los acentos, saltos de línea y `S/` quedan correctamente codificados; con un pedido vacío devuelve `null`.
- [X] T037 [US2] Ejecutar `npm test` y confirmar que T035 y T036 FALLAN por módulos inexistentes.

### Implementation for User Story 2

- [X] T038 [P] [US2] Implementar `client/src/lib/cart.js` con las funciones de T035, usando solo enteros, e incluyendo `canIncrease`, `showUnitPrice` y `canClear`. Debe pasar T035.
- [X] T039 [P] [US2] Implementar `client/src/lib/whatsapp.js` con `buildOrderMessage` y `buildWhatsAppUrl` (usa `formatPrice` de `money.js`). Debe pasar T036.
- [X] T040 [US2] Implementar `client/src/state/useCart.js`: lee y escribe `localStorage["chaski.pedido"]` con `parseStoredCart`, todo dentro de `try/catch` (si el almacenamiento no está disponible, el pedido funciona solo en memoria); expone `lines`, `add`, `changeQuantity`, `remove`, `clear`, `dropMissing` y escucha el evento `storage` para sincronizar pestañas.
- [X] T041 [US2] Integrar el pedido en `client/src/state/StoreContext.jsx`: exponer el estado de `useCart`, y cada vez que llegue la lista de productos aplicar `reconcile` y, si se quitó algo, guardar en memoria el aviso "Quitamos de tu pedido productos que ya no están disponibles." (visible en "Mi pedido" hasta cerrarlo; FR-024).
- [X] T042 [P] [US2] Crear `client/src/components/QuantityStepper.jsx` (botones "−" y "+" de 44 px o más, cantidad central; "+" con `disabled` cuando `canIncrease(quantity)` es `false`; `aria-label` "Disminuir cantidad" y "Aumentar cantidad") y `client/src/components/CartBadge.jsx` (enlace a `/pedido` con el contador de unidades, `aria-label` "Mi pedido, N unidades").
- [X] T043 [US2] Agregar `CartBadge` al encabezado de `client/src/components/CustomerLayout.jsx` (FR-009).
- [X] T044 [P] [US2] Agregar el botón "Agregar al pedido" (azul primario, 48 px) a `client/src/components/ProductCard.jsx` sin romper el enlace de la tarjeta (el botón es hermano del enlace, no hijo), con confirmación visible breve (por ejemplo, el contador sube) y respetando `prefers-reduced-motion` (FR-007).
- [X] T045 [P] [US2] Agregar el botón "Agregar al pedido" a `client/src/pages/Detalle.jsx` (FR-007).
- [X] T046 [US2] Crear `client/src/pages/MiPedido.jsx`: llama a `refresh()` al montarse; muestra el aviso de productos quitados si existe; lista las líneas con foto, nombre, `QuantityStepper`, subtotal, precio unitario "c/u" cuando `showUnitPrice(quantity)` es `true` y botón "Quitar" (texto, no solo ícono); total en negrita; botón "Vaciar pedido" (sin confirmación, FR-026); aviso fijo "Tu pedido se envía por WhatsApp. No se realiza ningún pago en esta página."; botón "Enviar pedido por WhatsApp" como enlace `<a href target="_blank" rel="noopener noreferrer">` verde `#25D366` con el glifo de WhatsApp, que **no** modifica el pedido. Pedido vacío: "Tu pedido está vacío" con enlace al catálogo, con "Vaciar pedido" deshabilitado (`canClear(lines)` es `false`) y con el botón de WhatsApp deshabilitado (no es un enlace). El número sale de `GET /api/config` (agregar `getConfig()` a `client/src/lib/api.js`). No pedir ningún dato personal (FR-015).
- [X] T047 [US2] Agregar la ruta `/pedido` (MiPedido) en `client/src/App.jsx`.
- [X] T048 [US2] Ejecutar `npm test` y recorrer a mano la Historia 2 del `quickstart.md`: cantidades, tope de 99 con "+" deshabilitado, Quitar, Vaciar pedido, envío por WhatsApp con el pedido intacto, recarga con el pedido conservado, pedido con un producto quitado desde la base (borrar la fila en `data/chaski.db`) y comprobar el aviso.

**Checkpoint**: Historias 1 y 2 completas: es el producto mínimo utilizable.

---

## Phase 5: User Story 3 - Acceso del administrador (Priority: P2)

**Goal**: el administrador entra con su clave, ve el panel y puede cerrar sesión; las acciones de administración son imposibles sin sesión; 5 claves incorrectas seguidas bloquean el acceso 15 minutos.

**Independent Test**: probar clave incorrecta, clave correcta, "Cerrar sesión" y el acceso directo a `/admin/panel` sin sesión (quickstart, Historia 3).

### Tests for User Story 3 (escribir PRIMERO; deben FALLAR) ⚠️

- [X] T049 [P] [US3] Escribir `tests/api/login-guard.test.js` para `createLoginGuard({ now, maxFails: 5, lockMs: 15 * 60 * 1000 })` de `server/auth.js`: con la misma clave de cliente, los fallos 1 a 5 devuelven `{ blocked: false }`; tras el 5.º fallo, `check(key)` devuelve `{ blocked: true, retryAfterSeconds }`; avanzar el reloj 15 minutos desbloquea y reinicia el conteo; un acierto (`success(key)`) antes del 5.º fallo reinicia el conteo; claves de cliente distintas (por ejemplo dos IP) no se afectan entre sí; las entradas vencidas se eliminan del mapa. Además, escribir `tests/lib/customer-screens.test.js`: revisa, de entre `Catalogo.jsx`, `Detalle.jsx`, `MiPedido.jsx`, `CustomerLayout.jsx`, `CartBadge.jsx` y `ProductCard.jsx` (rutas bajo `client/src/`), **solo los archivos que existan** (los que crean US1 y US2 pueden no existir todavía si US3 se hace antes) y verifica que ninguno contiene la cadena `/admin` (FR-025). Es una red de seguridad contra regresiones, no un RED previo: pasa mientras ningún archivo existente contenga `/admin`, y si ninguno existe aún, pasa sin comprobar nada.
- [X] T050 [P] [US3] Escribir `tests/api/admin-auth.test.js`: login correcto responde 204 con `Set-Cookie` `chaski_admin=` que incluye `HttpOnly`, `SameSite=Strict`, `Path=/`, **sin** `Max-Age` ni `Expires`, y sin `Secure` por defecto (con `secureCookies: true` sí incluye `Secure`); clave incorrecta responde `401 { "error": "Clave incorrecta." }`; cuerpo sin clave o clave vacía responde `400 { "error": "Escribe la clave." }` y no suma al conteo de intentos fallidos; `GET /api/admin/session` da 204 con la cookie y 401 `{ "error": "Inicia sesión para continuar." }` sin ella o con un token inventado; `POST /api/admin/logout` da 204 y deja la cookie inservible (la sesión anterior ya da 401); cualquier ruta bajo `/api/admin/*` distinta de login y logout, por ejemplo `POST /api/admin/products` y `DELETE /api/admin/products/1`, responde 401 sin sesión aunque la ruta todavía no exista (que además no cambian datos se comprueba en T062) (SC-007, FR-017); secuencia de bloqueo con el reloj inyectado: 5 claves incorrectas (la 5.ª aún responde 401), la 6.ª responde `429 { "error": "Demasiados intentos. Vuelve a intentarlo en 15 minutos." }` con cabecera `Retry-After`; durante el bloqueo la **clave correcta** también da 429; tras `clock.advance(15 * 60 * 1000)` la clave correcta da 204; 4 fallos seguidos y luego un acierto reinician el conteo.
- [X] T051 [US3] Ejecutar `npm test` y confirmar que T049 y T050 FALLAN.

### Implementation for User Story 3

- [X] T052 [US3] Implementar `server/auth.js`: `createLoginGuard` (mapa por clave de cliente, ver T049), sesiones en un `Set` de tokens de `crypto.randomBytes(32).toString('hex')`, comparación de la clave con SHA-256 de ambas partes y `crypto.timingSafeEqual`, lectura manual de la cookie `chaski_admin` del encabezado `Cookie` (sin dependencia), middleware `requireAdmin` que responde `401 { "error": "Inicia sesión para continuar." }`, y el router con las rutas públicas `POST /api/admin/login` y `POST /api/admin/logout`, seguidas de un guardia general `router.use(requireAdmin)` que protege todo lo demás bajo `/api/admin/*` (incluida `GET /api/admin/session`, que responde 204 si el guardia deja pasar, y las rutas de productos que se agregan en T066), de modo que cualquier ruta de administración, exista ya o no, responda 401 sin sesión. Este router se monta en `server/app.js` antes que el de productos. La cookie se emite como `chaski_admin=<token>; HttpOnly; SameSite=Strict; Path=/` más `; Secure` si `secureCookies`, y **sin** `Max-Age` ni `Expires`. El bloqueo usa `req.ip` como clave. Debe pasar T049 y T050.
- [X] T053 [US3] Montar el router de autenticación en `server/app.js` pasando `adminPassword`, `now` y `secureCookies`; completar `loginAgent` en `tests/api/helpers.js`.
- [X] T054 [P] [US3] Agregar `login(password)`, `logout()` y `getSession()` a `client/src/lib/api.js`.
- [X] T055 [P] [US3] Crear `client/src/components/AdminGuard.jsx`: al montarse llama a `getSession()`; mientras responde muestra un estado de carga; si recibe 401 redirige a `/admin`; si hay sesión muestra sus hijos. Se usa para `/admin/panel` y `/admin/productos/nuevo` (FR-017).
- [X] T056 [US3] Crear `client/src/pages/AdminAcceso.jsx` (diseño de escritorio de `04-acceso-administrador-escritorio.png`): campo de clave con etiqueta (`type="password"`, `autocomplete="current-password"`), botón de ingreso, mensaje de error junto al campo con `role="alert"` ("Clave incorrecta." / "Demasiados intentos. Vuelve a intentarlo en 15 minutos." / "Escribe la clave."), y redirección a `/admin/panel` al entrar.
- [X] T057 [US3] Crear `client/src/pages/AdminPanel.jsx` con el encabezado de administración, el botón "Cerrar sesión" (llama a `logout()` y vuelve a `/admin`) y un contenedor vacío donde la Historia 4 pondrá la tabla.
- [X] T058 [US3] Agregar en `client/src/App.jsx` las rutas `/admin` (AdminAcceso) y `/admin/panel` (AdminPanel dentro de `AdminGuard`), fuera de `CustomerLayout`.
- [X] T059 [US3] Ejecutar `npm test` y recorrer a mano la Historia 3 del `quickstart.md`; además confirmar que `tests/lib/customer-screens.test.js` pasa y que, a mano, ninguna pantalla de clientes enlaza a `/admin` (FR-025, escenario 7 de la Historia 3).

**Checkpoint**: acceso protegido y funcionando; la tienda de clientes sigue igual.

---

## Phase 6: User Story 4 - Agregar y quitar productos (Priority: P2)

**Goal**: con sesión iniciada, el administrador ve la tabla de productos, agrega uno con foto y lo quita con confirmación; los cambios se ven de inmediato en el catálogo de los clientes.

**Independent Test**: agregar un producto con foto, verlo primero en el catálogo, quitarlo con confirmación y comprobar que ya no aparece (quickstart, Historia 4).

### Tests for User Story 4 (escribir PRIMERO; deben FALLAR) ⚠️

- [X] T060 [P] [US4] Escribir `tests/api/validation.test.js` para `server/validation.js`: `parsePrice(text)` acepta `"4299"`, `"4299.00"`, `"25.5"` y `"0.99"` y devuelve céntimos enteros (`429900`, `429900`, `2550`, `99`); rechaza `""`, `"0"`, `"0.00"`, `"-5"`, `"12.345"`, `"abc"`, `"1,5"`, `"4,299.00"`, `" "` y `"1e3"` con el mensaje `Escribe un precio válido, mayor que cero y con hasta dos decimales.`; el esquema del producto exige `name` y `description` (tras quitar espacios) con `Escribe el nombre del producto.` y `Escribe una descripción.`, `category` en `Celulares`, `Laptops`, `Accesorios` con `Elige una categoría.`, y `specs` opcional.
- [X] T061 [P] [US4] Escribir `tests/api/images.test.js` para `server/images.js`: `detectImageType(buffer)` reconoce JPG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`) y WebP (`RIFF` + 4 bytes + `WEBP`) por sus bytes; devuelve `null` para HTML, GIF, SVG, un archivo vacío y un buffer corto; un HTML con nombre `foto.png` y tipo MIME `image/png` se rechaza.
- [X] T062 [P] [US4] Escribir `tests/api/admin-products.test.js` con sesión iniciada vía `loginAgent`: crear con todos los campos válidos y foto JPG, PNG o WebP (buffers mínimos con los bytes correctos) responde 201 con el DTO, el producto aparece **primero** en `GET /api/products`, `price` `"1299.9"` queda como `priceCents` 129990, el archivo existe en `uploadsDir` con extensión según el formato detectado y nombre aleatorio; `specs` es opcional; dos productos con el mismo nombre se permiten; cada campo faltante o inválido responde `400` con `errors` que contiene **solo** los campos con problema y el mensaje de data-model.md (`Elige una foto.`, `La foto debe ser JPG, PNG o WebP.`, `La foto no debe pesar más de 5 MB.` para un archivo de 5 MB + 1 byte, que responde 400 y no 413); con cualquier error no se crea fila ni archivo; un HTML renombrado `.png` se rechaza; `DELETE /api/admin/products/:id` responde 204, el producto desaparece de la lista y su archivo se borra; `DELETE` de un id inexistente o ya borrado responde `404 { "error": "Este producto ya no está disponible." }`; `DELETE` con id no entero responde 404; sin sesión ambas rutas dan 401.
- [X] T063 [US4] Ejecutar `npm test` y confirmar que T060 a T062 FALLAN.

### Implementation for User Story 4

- [X] T064 [P] [US4] Implementar `server/validation.js` con `parsePrice` (regex `^\d+(\.\d{1,2})?$` sobre el texto recortado, mayor que cero, conversión a céntimos separando parte entera y decimales, **sin multiplicar números de coma flotante**) y el esquema Zod del producto con los mensajes de T060. Debe pasar T060.
- [X] T065 [P] [US4] Implementar `server/images.js` con `detectImageType(buffer)` (JPG, PNG, WebP por bytes iniciales), `saveImage(buffer, type, uploadsDir)` (nombre `crypto.randomUUID()` + extensión) y `deleteImage(name, uploadsDir)` (ignora el error si el archivo ya no existe; valida que el nombre no contenga separadores de ruta). Debe pasar T061.
- [X] T066 [US4] Agregar a `server/products.js` las rutas de administración, ambas ya protegidas por el guardia general de `/api/admin/*` de T052 (no repetir `requireAdmin` en cada ruta): `POST /api/admin/products` (multer con `memoryStorage`, `limits: { fileSize: 5 * 1024 * 1024 }`, un solo archivo `image`; mapea el error de tamaño de multer a `errors.image = "La foto no debe pesar más de 5 MB."` con estado 400; valida con Zod y `detectImageType`; escribe primero el archivo y luego la fila, y si la fila falla borra el archivo; responde 201 con el DTO) y `DELETE /api/admin/products/:id` (borra la fila y su foto; 204, o 404 si no existe). Montarlas en `server/app.js` después del router de T052. Debe pasar T062.
- [X] T067 [P] [US4] Agregar `createProduct(formData)` y `deleteProduct(id)` a `client/src/lib/api.js` (`createProduct` envía `FormData`; ante un 400 lanza `ApiError` con `body.errors`; ante un 401 el llamador redirige a `/admin`).
- [X] T068 [P] [US4] Crear `client/src/components/ConfirmDialog.jsx` con el elemento nativo `<dialog>` y `showModal()` (foco atrapado y cierre con Escape ya incluidos): título "¿Quitar este producto?", nombre del producto, botón destructivo "Quitar" (`#EF4444`) y botón "Cancelar" que recibe el foco al abrir.
- [X] T069 [P] [US4] Crear `client/src/components/ProductForm.jsx` (diseño de `06-agregar-producto-escritorio.png`): campos Nombre, Categoría (`<select>` con las tres categorías y opción vacía), Precio (`inputmode="decimal"`, prefijo visible "S/"), Descripción, Especificaciones (opcional, con la ayuda "Una por línea, con el formato Etiqueta: valor"), Foto (`<input type="file" accept="image/jpeg,image/png,image/webp">`); cada campo con `<label>` y su mensaje de error propio con `role="alert"` y borde `#EF4444`; botones "Guardar producto" (se deshabilita mientras envía) y "Cancelar".
- [X] T070 [US4] Crear `client/src/pages/AdminNuevoProducto.jsx`: arma el `FormData` con los campos del formulario, llama a `createProduct`, muestra los errores por campo que devuelve la API, y al guardar vuelve a `/admin/panel` tras refrescar la lista; "Cancelar" vuelve al panel sin guardar nada.
- [X] T071 [US4] Completar `client/src/pages/AdminPanel.jsx` (diseño de `05-panel-administracion-escritorio.png`): tabla con foto, nombre (con `overflow-wrap: anywhere` para nombres largos), categoría, precio (`formatPrice`) y botón "Quitar" por fila, del más reciente al más antiguo; botones "Agregar producto" (a `/admin/productos/nuevo`) y "Cerrar sesión"; "Quitar" abre `ConfirmDialog`; al confirmar llama a `deleteProduct` y refresca la lista (un 404 se trata como ya quitado, sin error); catálogo vacío: tabla vacía con "Agregar producto" visible. Llama a `refresh()` al montarse.
- [X] T072 [US4] Agregar la ruta `/admin/productos/nuevo` (AdminNuevoProducto dentro de `AdminGuard`) en `client/src/App.jsx`.
- [X] T073 [US4] Ejecutar `npm test` y recorrer a mano la Historia 4 del `quickstart.md` en una vista de 1440 px: errores por campo, precios inválidos (`0`, `-5`, `12.345`, `abc`), foto inválida y de más de 5 MB, alta con precio `1299.9` (se ve `S/ 1,299.90`), confirmación al quitar, producto quitado dentro de un pedido abierto en otro dispositivo, y catálogo vacío sin que reaparezcan los de ejemplo.

**Checkpoint**: las cuatro historias funcionan, solas y juntas.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: verificación final antes de cerrar la feature (constitución, Flujo de trabajo).

- [X] T074 Ejecutar `npm test` completo y confirmar que todas las pruebas pasan sin saltarse ninguna (Principio VI).
- [ ] T075 Recorrer el `quickstart.md` completo de principio a fin en celular (390 px) y escritorio (1440 px), marcando cada comprobación y cada criterio de éxito SC-001 a SC-008 (Principio IV).
- [X] T076 [P] Revisión de seguridad: confirmar que `.env` y `data/` están ignorados por git (`git status` no los lista), que `.env.example` solo trae nombres sin valores, que no hay claves ni números de teléfono reales en el código (`grep -rniE "password|51[0-9]{9}" server client/src tests` solo muestra nombres de variables y datos de prueba), y que sin `ADMIN_PASSWORD` el servidor se niega a arrancar.
- [X] T077 [P] Revisión de precios (SC-002): `grep -rn "toFixed\|toLocaleString\|priceCents" client/src` y confirmar que todo precio mostrado pasa por `formatPrice` de `client/src/lib/money.js`.
- [X] T078 [P] Auditoría de la interfaz con el skill `reglas-web` sobre `client/src/` (accesibilidad, formularios, foco, objetivos táctiles, `prefers-reduced-motion`) y corregir solo lo que incumpla reglas MUST o NEVER.
- [X] T079 Verificar alcance (Principio III): comparar la interfaz con la spec y confirmar que no existen dirección de entrega, compartir, favoritos, comparar, perfil ni edición de productos; eliminar lo que sobre.
- [ ] T080 Cerrar con el skill `verification-before-completion` (evidencia de `npm test` y del quickstart antes de afirmar que la feature está lista) y luego `finishing-a-development-branch`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup. BLOQUEA todas las historias.
- **User Stories (Phase 3 a 6)**: dependen de Foundational. Orden por prioridad: US1 y US2 (P1), luego US3 y US4 (P2).
- **Polish (Phase 7)**: depende de las historias completas.

### User Story Dependencies

- **US1 (P1)**: empieza tras Foundational. Sin dependencias de otras historias. Crea `server/products.js`, `StoreContext`, `CustomerLayout` y `App.jsx` con sus primeras rutas.
- **US2 (P1)**: empieza tras Foundational, pero **edita archivos de US1** (`StoreContext.jsx`, `CustomerLayout.jsx`, `ProductCard.jsx`, `Detalle.jsx`, `App.jsx`), por lo que conviene hacerla después de US1. Se puede comprobar sola: el catálogo de US1 le sirve de entrada.
- **US3 (P2)**: empieza tras Foundational; **no depende** de US1 ni de US2 (solo toca `server/auth.js`, `app.js`, `api.js`, `App.jsx` y páginas de administración).
- **US4 (P2)**: **depende de US3** (usa `requireAdmin`, `AdminGuard` y `AdminPanel`) y reutiliza `server/products.js` y `StoreContext` de US1.

### Within Each User Story

- Las pruebas se escriben primero y se confirma que fallan (tareas T022, T037, T051, T063).
- Funciones puras y módulos del servidor, luego rutas, luego componentes, luego páginas, luego la ruta en `App.jsx`, y por último la comprobación manual.
- Cada historia termina con su checkpoint antes de pasar a la siguiente.

### Parallel Opportunities

- Setup: T002, T003 y T004 en paralelo.
- Foundational: T005, T007, T009 en paralelo (pruebas); T015 y T016 en paralelo.
- US1: T018 a T021 (pruebas) en paralelo; T023, T024, T025 en paralelo; T028, T029, T030 en paralelo.
- US2: T035 y T036 en paralelo; T038 y T039 en paralelo; T042, T044, T045 en paralelo.
- US3: T049 y T050 en paralelo; T054 y T055 en paralelo.
- US4: T060, T061, T062 en paralelo; T064 y T065 en paralelo; T067, T068, T069 en paralelo.
- US3 puede avanzar en paralelo con US1 y US2 si hay más de una persona.
- Polish: T076, T077, T078 en paralelo.

---

## Parallel Example: User Story 1

```text
# Escribir juntas las pruebas de la Historia 1:
Task: "Escribir tests/lib/catalog.test.js"
Task: "Escribir tests/lib/specs.test.js"
Task: "Escribir tests/api/seed.test.js"
Task: "Escribir tests/api/products-read.test.js"

# Luego, en paralelo, lo que no comparte archivos:
Task: "Implementar client/src/lib/catalog.js"
Task: "Implementar client/src/lib/specs.js"
Task: "Crear las 10 ilustraciones en server/seed-images/"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

La spec dice que las Historias 1 y 2 juntas forman "el producto mínimo utilizable".

1. Completar Phase 1: Setup.
2. Completar Phase 2: Foundational (bloquea todo).
3. Completar Phase 3: US1 y comprobarla sola.
4. Completar Phase 4: US2 y comprobarla.
5. **DETENERSE Y VALIDAR**: una tienda consultable que recibe pedidos por WhatsApp, con los productos de ejemplo.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → tienda consultable.
3. US2 → pedidos por WhatsApp (MVP).
4. US3 → acceso del administrador protegido.
5. US4 → el administrador mantiene el catálogo sin ayuda técnica.
6. Cada historia suma valor sin romper las anteriores.

### Nota sobre la implementación

Según el reparto de `CLAUDE.md`, la implementación sigue Superpowers y no `speckit-implement`: `test-driven-development` (cada tarea de pruebas primero, RED-GREEN-REFACTOR), `subagent-driven-development` para las tareas [P], y `verification-before-completion` al final.

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí.
- La etiqueta [Story] traza cada tarea a su historia.
- Verificar que las pruebas fallen antes de implementar.
- Hacer commit tras cada tarea o grupo lógico (sin mencionar herramientas de IA en los mensajes).
- Detenerse en cada checkpoint para validar la historia.
- Evitar: tareas vagas, conflictos en un mismo archivo dentro de una misma fase paralela, y dependencias entre historias que rompan su independencia.
