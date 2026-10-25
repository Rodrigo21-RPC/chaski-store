# Contrato: API HTTP y mensaje de WhatsApp

**Feature**: `001-catalogo-pedidos-whatsapp` | **Date**: 2026-10-24

Este es el contrato entre el cliente React y el servidor Express. Todo el cuerpo y los mensajes de error van en español de Perú. Las respuestas JSON usan `Content-Type: application/json; charset=utf-8`. Los nombres de campos van en inglés (código); los textos que ve la persona, en español.

Los tipos de datos (`Producto`) están definidos en [data-model.md](../data-model.md).

## Resumen

| Método y ruta | Acceso | Respuestas |
|---------------|--------|------------|
| `GET /api/config` | Público | 200 |
| `GET /api/products` | Público | 200 |
| `GET /api/products/:id` | Público | 200, 404 |
| `POST /api/admin/login` | Público | 204, 400, 401, 429 |
| `POST /api/admin/logout` | Público | 204 |
| `GET /api/admin/session` | Administrador | 204, 401 |
| `POST /api/admin/products` | Administrador | 201, 400, 401 |
| `DELETE /api/admin/products/:id` | Administrador | 204, 401, 404 |

"Administrador" significa cookie `chaski_admin` válida. Sin ella, la respuesta es `401 {"error":"Inicia sesión para continuar."}` y no se hace ningún cambio (FR-017, SC-007).

No existen rutas para crear pedidos, editar productos ni crear cuentas.

---

## Público

### `GET /api/config`

Devuelve lo que el cliente necesita saber de la tienda.

```json
200  { "whatsappNumber": "51999999999" }
```

### `GET /api/products`

Todos los productos, del **más reciente al más antiguo** (`id` descendente). Sin parámetros.

```json
200  [ { "id": 7, "name": "…", "category": "Celulares", "priceCents": 429900,
         "description": "…", "specs": "…", "imageUrl": "/uploads/….webp" }, … ]
```

Con el catálogo vacío devuelve `200 []`.

### `GET /api/products/:id`

```json
200  { …Producto }
404  { "error": "Este producto ya no está disponible." }
```

Un `:id` que no sea un entero positivo también devuelve 404.

---

## Administrador

### `POST /api/admin/login`

Cuerpo JSON: `{ "password": "…" }`.

| Situación | Respuesta |
|-----------|-----------|
| Clave correcta y sin bloqueo | `204`, con `Set-Cookie: chaski_admin=…; HttpOnly; SameSite=Strict; Path=/` (sin `Max-Age`/`Expires`; `Secure` en producción) |
| Clave incorrecta (fallos 1 a 5) | `401 { "error": "Clave incorrecta." }` |
| Clave vacía o cuerpo inválido (no suma al conteo de intentos fallidos) | `400 { "error": "Escribe la clave." }` |
| Acceso bloqueado (a partir del 6.º intento seguido, o durante 15 minutos tras el 5.º fallo), con **cualquier** clave | `429 { "error": "Demasiados intentos. Vuelve a intentarlo en 15 minutos." }` y cabecera `Retry-After: <segundos restantes>` |

El 5.º fallo seguido todavía responde 401; el siguiente intento recibe 429. Una clave correcta antes del 5.º fallo reinicia el conteo. El bloqueo es por IP.

### `POST /api/admin/logout`

Sin cuerpo. Siempre `204`; borra la sesión del servidor y la cookie (`Max-Age=0`).

### `GET /api/admin/session`

```text
204  sesión válida
401  { "error": "Inicia sesión para continuar." }
```

El cliente lo llama antes de mostrar `/admin/panel` y `/admin/productos/nuevo`.

### `POST /api/admin/products`

`multipart/form-data` con estos campos:

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `name` | texto | Sí |
| `category` | `Celulares` \| `Laptops` \| `Accesorios` | Sí |
| `price` | texto, por ejemplo `4299.00` o `25.5` | Sí |
| `description` | texto | Sí |
| `specs` | texto, una especificación por línea | No |
| `image` | archivo JPG, PNG o WebP, hasta 5 MB | Sí |

Respuestas:

```json
201  { …Producto }                       // ya visible en GET /api/products, en primer lugar
400  { "errors": { "name": "Escribe el nombre del producto.",
                   "price": "Escribe un precio válido, mayor que cero y con hasta dos decimales.",
                   "image": "La foto debe ser JPG, PNG o WebP." } }
401  { "error": "Inicia sesión para continuar." }
```

`errors` incluye **solo** los campos con problema (clave = nombre del campo), para mostrar cada mensaje junto a su campo (FR-021, escenario 3 de la Historia 4). Los mensajes posibles están en la tabla de validación de [data-model.md](../data-model.md). Un archivo de más de 5 MB también responde `400` con `errors.image = "La foto no debe pesar más de 5 MB."` (no `413`). Si hay error, no se guarda ninguna fila ni archivo.

### `DELETE /api/admin/products/:id`

```text
204  producto y su foto eliminados
401  { "error": "Inicia sesión para continuar." }
404  { "error": "Este producto ya no está disponible." }
```

La confirmación "¿Quitar este producto?" es del cliente; la API no la repite. El `404` ocurre si el producto ya fue quitado (por ejemplo, desde otra pestaña); el panel entonces se actualiza sin mostrar error.

---

## Archivos estáticos

| Ruta | Contenido |
|------|-----------|
| `/uploads/<nombre>` | Fotos de productos. Cabeceras `X-Content-Type-Options: nosniff` y `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`. Solo se sirve lo que está en `data/uploads/`. |
| `/` y cualquier otra ruta que no empiece por `/api` ni `/uploads` | `index.html` del cliente (producción) |

---

## Mensaje de WhatsApp

Lo arma el cliente con `buildWhatsAppUrl(lines, whatsappNumber)` (`client/src/lib/whatsapp.js`). Una línea por producto distinto, en el orden en que se muestran en "Mi pedido". Sin datos del cliente.

Texto (los saltos de línea se codifican con `encodeURIComponent`):

```text
Hola Chaski Store, quiero hacer este pedido:

1. iPhone 15 Pro 256GB x1 = S/ 4,299.00
2. SSD Kingston NV2 1TB x2 = S/ 600.00

Total: S/ 4,899.00
```

Enlace: `https://wa.me/<whatsappNumber>?text=<texto codificado>`.

Reglas comprobables:

- Aparecen **todos** los productos del pedido, cada uno con su cantidad y su subtotal, y el total (SC-004).
- Los importes usan el formato `S/ 1,234.00` (SC-002).
- Subtotal de cada línea y total coinciden con `precio × cantidad` (SC-003).
- Con el pedido vacío no se genera enlace y el botón está deshabilitado.
