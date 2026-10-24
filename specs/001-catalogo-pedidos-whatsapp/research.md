# Research: Catálogo y pedidos por WhatsApp

**Feature**: `001-catalogo-pedidos-whatsapp` | **Date**: 2026-10-24

El Technical Context no tiene `NEEDS CLARIFICATION`: el stack ya está fijado en `AGENTS.md`. Esta investigación resuelve las decisiones de diseño que la spec deja abiertas a propósito (dónde viven los datos, cómo se protege la clave, cómo se prueba) y deja registrados los riesgos.

Formato de cada decisión: **Decision**, **Rationale**, **Alternatives considered**.

---

## 1. Estructura del repositorio

**Decision**: un solo `package.json` con `server/` y `client/` como carpetas hermanas. En producción, Express sirve la API, `/uploads` y el cliente compilado (`client/dist`) desde un único proceso. En desarrollo, `concurrently` levanta `vite` (con proxy de `/api` y `/uploads`) y `node --watch`.

**Rationale**: Principio I. Un solo `npm install`, un solo `npm test`, un solo comando de arranque. `AGENTS.md` ya define `npm run dev`, `npm test` y `npm start` como comandos únicos.

**Alternatives considered**:

- Workspaces de npm con paquetes `client` y `server`: más ceremonia (dos `package.json`, dependencias repartidas) sin beneficio para una v1.
- Next.js o similar: contradice el stack indicado en `AGENTS.md`.
- Vite en modo middleware dentro de Express para tener un solo proceso en desarrollo: menos dependencias, pero mezcla código de desarrollo con el de producción y complica el arranque.

## 2. Dónde viven los productos

**Decision**: tabla `products` en SQLite (`node:sqlite`, `DatabaseSync`), archivo `data/chaski.db`. Consultas escritas a mano con sentencias preparadas. Precio guardado como **entero en céntimos** (`price_cents`). Orden de lectura `ORDER BY id DESC` (el id autoincremental desempata mejor que una marca de tiempo y cumple "más reciente primero").

**Rationale**: el administrador publica desde una computadora y los clientes ven el cambio en sus celulares (FR-022, FR-023, SC-006), así que el catálogo tiene que vivir en el servidor. Los céntimos enteros evitan errores de coma flotante y hacen exacto el SC-003. Sin ORM porque hay una sola tabla y tres consultas.

**Alternatives considered**:

- Archivo JSON: más simple aún, pero sin escrituras atómicas ni concurrencia segura entre dos peticiones; SQLite ya viene incluido en Node.
- Guardar el precio como decimal o texto: obliga a redondear en cada cálculo.
- ORM (Prisma, Drizzle): complejidad anticipada para una sola tabla.

## 3. Fotos

**Decision**: la foto se recibe como `multipart/form-data` con **multer** (almacenamiento en memoria, límite de 5 MB). El servidor identifica el formato por los **bytes iniciales** del archivo (JPG `FF D8 FF`, PNG `89 50 4E 47 0D 0A 1A 0A`, WebP `RIFF....WEBP`) y no confía en el nombre ni en el tipo MIME que envía el navegador. Se guarda en `data/uploads/` con nombre aleatorio (`crypto.randomUUID()` + extensión según el formato detectado). Se sirve de forma estática en `/uploads/...` con `X-Content-Type-Options: nosniff`. En la base solo se guarda el nombre del archivo. Al quitar un producto se borra también su archivo.

**Rationale**: FR-021 y los casos límite exigen rechazar formatos y tamaños inválidos con un mensaje claro. Validar por contenido evita que alguien suba un `.html` renombrado a `.png`. Nombre aleatorio evita colisiones y rutas manipuladas. Guardar en disco (no en la base) mantiene la base pequeña y deja que Express sirva los archivos directamente.

**Alternatives considered**:

- Enviar la foto como base64 dentro de JSON: sin dependencia extra, pero infla 33 % el tamaño y el límite de 5 MB se vuelve difícil de aplicar; multer es la opción estándar y pequeña.
- Guardar la foto como BLOB en SQLite: simple, pero cada vista del catálogo cargaría blobs por la base.
- Confiar en la extensión o el MIME declarado: inseguro.

## 4. Catálogo inicial de ejemplo

**Decision**: al crear la base por primera vez se insertan los productos de ejemplo (parecidos a los de los diseños) y se copian sus fotos desde `server/seed-images/` a `data/uploads/`. "Primera vez" se detecta con `PRAGMA user_version` (0 al crear, 1 después de sembrar). Así, si el administrador quita todos los productos, **no** reaparecen los de ejemplo, y se cumple el caso límite "Catálogo sin productos".

**Rationale**: la spec pide un catálogo inicial para comprobar la tienda desde el primer día, y que el administrador pueda quitarlos. Sembrar "cuando la tabla esté vacía" volvería a llenar un catálogo vaciado a propósito.

**Alternatives considered**:

- Sembrar cuando la tabla esté vacía: rompe el caso de catálogo vacío.
- Script de siembra manual (`npm run seed`): un paso extra para una persona no técnica (Principio IV).

## 5. El pedido vive en el cliente

**Decision**: el pedido se guarda en `localStorage` (clave `chaski.pedido`) como una lista de `{ productId, quantity }`. Cantidad acotada a 1..99 en una función pura. Si el contenido guardado está dañado o no es válido, se trata como pedido vacío. Nunca se guardan precios ni nombres en el pedido.

**Rationale**: la spec dice que el pedido no se guarda en la tienda (Assumptions) y solo vive en el dispositivo. Guardar solo ids y cantidades hace que el total se calcule siempre con los precios vigentes del catálogo, y permite detectar productos quitados (decisión 6). No hay endpoint de pedidos, lo que además deja claro que no se piden datos del cliente (FR-015).

**Alternatives considered**:

- `sessionStorage`: el pedido se perdería al cerrar la pestaña, contra FR-012.
- Guardar el pedido en el servidor con un identificador anónimo: crea datos del cliente que la spec no pide.
- Guardar copia de nombre y precio en cada línea: permite totales desfasados y no detecta productos quitados.

## 6. Productos quitados dentro de un pedido

**Decision**: al cargar la tienda, el cliente obtiene `GET /api/products` y concilia el pedido: toda línea cuyo `productId` ya no exista se elimina y se muestra un aviso en "Mi pedido" ("Quitamos de tu pedido productos que ya no están disponibles."). El detalle de un producto inexistente (`GET /api/products/:id` devuelve 404) muestra "Este producto ya no está disponible" con enlace al catálogo.

**Rationale**: FR-024 y el caso límite correspondiente. Se resuelve con la misma lista que ya se descarga para el catálogo, sin un endpoint extra.

**Alternatives considered**:

- Endpoint de validación del pedido: una ruta más sin necesidad.
- Consultar el servidor solo al tocar "Enviar": el cliente vería un pedido con productos fantasma hasta el último paso.

## 7. Filtro y búsqueda

**Decision**: el servidor devuelve la lista completa ordenada; categoría y búsqueda se aplican **en el navegador** con una función pura (`filterProducts`). La búsqueda compara el nombre sin distinguir mayúsculas ni minúsculas (`toLocaleLowerCase('es-PE')`), conserva el orden del servidor y se combina con la categoría.

**Rationale**: respuesta instantánea y una sola regla fácil de probar. Para un catálogo de decenas de productos no hace falta nada más (Principio I).

**Alternatives considered**:

- Filtrar en el servidor con parámetros `?categoria=&q=`: más rutas y más pruebas sin beneficio a esta escala.
- Paginación: fuera de alcance; queda anotado como riesgo (decisión 15).

## 8. Autenticación del administrador

**Decision**: la clave llega por la variable `ADMIN_PASSWORD`. `POST /api/admin/login` compara el hash SHA-256 de lo escrito con el de la clave usando `crypto.timingSafeEqual`. Si coincide, el servidor genera un token aleatorio (`crypto.randomBytes(32)`), lo guarda en un `Set` en memoria y lo entrega en una cookie `HttpOnly`, `SameSite=Strict`, `Path=/`, `Secure` en producción y **sin `Max-Age` ni `Expires`** (cookie de sesión: el navegador la descarta al cerrarse). Un middleware `requireAdmin` protege `POST` y `DELETE` de productos y `GET /api/admin/session`. `POST /api/admin/logout` borra el token. El cliente consulta `GET /api/admin/session` antes de mostrar `/admin/panel` y `/admin/productos/nuevo`, y redirige a `/admin` si recibe 401.

**Rationale**: FR-016, FR-017, FR-018, SC-007. La protección real está en el servidor: aunque alguien conozca la dirección del panel, la API rechaza cualquier acción sin sesión. `SameSite=Strict` más cookie `HttpOnly` cubre el riesgo de CSRF para estas dos acciones sin añadir tokens. Sesiones en memoria no necesitan librería ni base de datos; si el servidor se reinicia, el administrador vuelve a escribir su clave, que es aceptable.

**Alternatives considered**:

- `express-session` o JWT: dependencias y configuración que no aportan con un único administrador.
- JWT en `localStorage`: expuesto a robo por scripts; no muere al cerrar el navegador.
- Caducidad máxima de sesión del lado del servidor: sería una regla que la spec no pide (Principio III); la spec define la duración como "hasta cerrar sesión o cerrar el navegador".

## 9. Bloqueo por intentos fallidos

**Decision**: contador **por dirección IP** (`req.ip`) en memoria: `{ fails, lockedUntil }`. Cada clave incorrecta suma 1. Al llegar a 5 fallos seguidos se fija `lockedUntil = ahora + 15 min`. Mientras dure, el login responde 429 con `Retry-After` y el mensaje "Demasiados intentos. Vuelve a intentarlo en 15 minutos.", **incluso con la clave correcta**. Pasado el tiempo, el contador vuelve a 0. Un acierto antes del quinto fallo reinicia el contador. El quinto intento incorrecto aún responde 401 "Clave incorrecta"; es el **sexto** intento el que recibe el 429 (escenario 5 de la Historia 3). El reloj se inyecta (`now`) en `createApp` para probar los 15 minutos sin esperar.

**Rationale**: cierra la duda dejada en la clarificación sobre el alcance del bloqueo. Un bloqueo **global** permitiría que cualquiera deje fuera al administrador con cinco intentos; por IP, solo se bloquea quien insiste. Si el despliegue estuviera detrás de un proxy sin configurar `trust proxy`, todos los clientes compartirían la misma IP: eso degrada a un bloqueo global (falla hacia el lado seguro, nunca permite adivinar la clave más rápido).

**Alternatives considered**:

- Bloqueo global: administrador expuesto a denegación de servicio trivial.
- Retraso progresivo o CAPTCHA: más complejo que lo que pide la spec.
- Guardar contadores en SQLite: sobrevivirían a un reinicio, pero para una v1 la memoria basta.

## 10. Configuración y variables de entorno

**Decision**: variables `ADMIN_PASSWORD` (obligatoria, no vacía), `WHATSAPP_NUMBER` (obligatoria, solo dígitos con código de país, 8 a 15 dígitos, sin `+`; por ejemplo `51999999999`) y `PORT` (opcional, por defecto 3000). Se cargan con `node --env-file-if-exists=.env server/index.js` (sin dotenv). `server/index.js` las valida con Zod y, si falta alguna obligatoria, **se niega a arrancar** con un mensaje en español. `.env.example` lista los tres nombres sin valores reales. `.env` está en `.gitignore`. El cliente recibe el número desde `GET /api/config` (no necesita recompilarse al cambiar el número).

**Rationale**: Principio V y FR (clave y número fuera del código). Fallar al arrancar evita una tienda "abierta" sin clave. El número de WhatsApp es público por naturaleza (aparece en el enlace), por eso puede enviarse al navegador; la clave nunca sale del servidor.

**Alternatives considered**:

- Variable `VITE_WHATSAPP_NUMBER` incrustada al compilar: cambiar el número exigiría recompilar.
- Valor por defecto para la clave: inseguro.
- `dotenv`: dependencia innecesaria con `--env-file-if-exists`.

## 11. Mensaje y enlace de WhatsApp

**Decision**: el cliente arma el texto y abre `https://wa.me/<número>?text=<encodeURIComponent(mensaje)>` mediante un enlace `<a target="_blank" rel="noopener noreferrer">` estilizado como botón (no con `window.open`, para evitar el bloqueo de ventanas emergentes). Con el pedido vacío se muestra el botón deshabilitado (sin enlace). El formato exacto del mensaje está en [contracts/api.md](./contracts/api.md). No incluye datos personales. Enviar **no** vacía el pedido (clarificación); el botón "Vaciar pedido" lo hace.

**Rationale**: FR-013, FR-014, FR-015, SC-004. `wa.me` abre la app o WhatsApp Web, que es la dependencia declarada en la spec.

**Alternatives considered**:

- `whatsapp://send`: solo funciona con la aplicación instalada.
- API de WhatsApp Business: requiere cuenta, costos y servidor; contradice "debe ser simple".

## 12. Estrategia de pruebas (Principio VI)

**Decision**:

- **API (supertest)**: `createApp` recibe una base `:memory:`, una carpeta temporal de fotos, la clave, el número y un reloj; así cada prueba es aislada y el bloqueo de 15 minutos se prueba sin esperar. Cubre: lista ordenada, detalle y 404, login correcto e incorrecto, rutas protegidas sin sesión (401), logout, bloqueo (5 fallos, sexto bloqueado aun con clave correcta, desbloqueo a los 15 minutos, reinicio del contador), validación de cada campo con su mensaje, rechazo de foto con formato o tamaño inválido, foto camuflada (HTML con extensión `.png`), quitar producto (204, desaparece, borra el archivo).
- **Cliente (Vitest, Node)**: funciones puras en `client/src/lib/`: formato de precio, cantidad mínima 1 y máxima 99, producto repetido suma, quitar, vaciar, total con 3 pedidos de ejemplo (SC-003), conciliación de productos quitados, filtro combinado, ficha técnica "Etiqueta: valor", mensaje de WhatsApp.
- Las reglas que solo se ven en pantalla (botón "+" deshabilitado en 99, confirmación al quitar, aviso del pedido) se comprueban con el `quickstart.md` (Principio IV).

**Rationale**: casi toda la lógica de negocio queda fuera de los componentes, así que se prueba rápido y sin navegador. Se evita jsdom y testing-library para no añadir dependencias; la capa de pantalla es delgada y se verifica a mano con los pasos del quickstart.

**Alternatives considered**:

- Playwright de punta a punta: útil, pero pesado para una v1 y no pedido por la spec; puede proponerse aparte.
- Pruebas de componentes con jsdom: más dependencias y más fragilidad para poca ganancia aquí.

## 13. Rutas del cliente

**Decision**: React Router con estas rutas: `/` (catálogo), `/producto/:id`, `/pedido`, `/admin` (acceso), `/admin/panel`, `/admin/productos/nuevo`. En producción Express devuelve `index.html` para cualquier ruta que no empiece por `/api` ni `/uploads`. Las pantallas de clientes no contienen enlaces a `/admin` (FR-025); el administrador entra escribiendo la dirección.

**Rationale**: FR-017 habla de "conocer la dirección de esas pantallas", por lo que cada pantalla necesita una dirección propia que se pueda abrir directamente. React Router es el estándar para eso con React.

**Alternatives considered**:

- Estado interno sin rutas: no permite abrir una pantalla por su dirección, recargar ni usar el botón Atrás.

## 14. Estilos y diseño

**Decision**: Tailwind CSS 4 con el plugin de Vite. Los tokens de `DESIGN-comprador.md` y `DESIGN-administrador.md` se definen una sola vez en `@theme` (lienzo `#0F1115`, superficie `#181B22`, borde `#282D37`/`#262B36` unificado, texto `#F3F4F6`/`#9CA3AF`, acento `#3B82F6`, WhatsApp `#25D366`, destructivo `#EF4444`, radios 16 y 8 px). Inter se instala como paquete (`@fontsource-variable/inter`) y se sirve desde el propio servidor. Los precios usan `tabular-nums` y peso 700. Las interfaces siguen las Vercel Web Interface Guidelines: foco visible, etiquetas en formularios, objetivos táctiles de 44 px o más, errores junto al campo, `prefers-reduced-motion`.

**Rationale**: Principio II y los diseños validados. Autoalojar la fuente evita depender de un servicio externo y de enviar la IP del visitante a terceros.

**Alternatives considered**:

- Google Fonts por CDN: dependencia externa y de privacidad innecesaria.
- Dos temas distintos (cliente y administrador): los dos documentos usan la misma base; se unifica el borde casi idéntico (`#282D37` y `#262B36`).

## 15. Riesgos abiertos y datos pendientes

| Tema | Detalle | Tratamiento |
|------|---------|-------------|
| Largo del mensaje de WhatsApp | Con muchas líneas distintas el enlace codificado podría ser muy largo y algunos navegadores o WhatsApp podrían truncarlo. | Formato compacto, una línea por producto. No se pone tope (no está en la spec). Si en la práctica falla, se propone un tope de líneas como cambio de spec. |
| Volumen del catálogo | Sin paginación; se devuelve la lista completa. | Aceptable para decenas de productos. Se propone paginación aparte si el catálogo crece. |
| Fotos del catálogo inicial | `server/seed-images/` necesita imágenes propias para los productos de ejemplo. | Resuelto en `tasks.md` (T025): 10 ilustraciones SVG propias, sin scripts. Solo las siembra el servidor; los administradores solo pueden subir JPG, PNG o WebP. Como defensa extra, `/uploads` se sirve con `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`. |
| IP detrás de un proxy | Sin `trust proxy`, todos los clientes comparten IP y el bloqueo se vuelve global. | Falla hacia el lado seguro. Se documenta en el quickstart si se despliega detrás de un proxy. |
| Sesión de administrador y navegador | Algunos navegadores restauran cookies de sesión al reabrir ("continuar donde lo dejé"). | Limitación del navegador; el servidor mantiene la sesión mientras no se reinicie o se cierre sesión. Se menciona en el quickstart. |
| `node:sqlite` | En Node 22 emite una advertencia de módulo experimental. | Inofensiva; el equipo usa Node 25 y `engines` exige 22.13 o superior. |
