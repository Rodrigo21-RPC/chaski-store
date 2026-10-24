# Data Model: Catálogo y pedidos por WhatsApp

**Feature**: `001-catalogo-pedidos-whatsapp` | **Date**: 2026-10-24

Hay tres tipos de datos, y cada uno vive en un lugar distinto:

| Dato | Dónde vive | Quién lo escribe |
|------|-----------|------------------|
| Producto | Servidor (SQLite + carpeta de fotos) | Administrador |
| Pedido y líneas de pedido | Navegador del cliente (`localStorage`) | Cliente |
| Sesión de administrador e intentos de acceso | Memoria del servidor | Servidor |

No existe tabla de clientes, de pedidos ni de administradores (spec, Assumptions).

---

## Producto (servidor)

### Tabla `products`

| Columna | Tipo SQLite | Regla |
|---------|-------------|-------|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Identidad. El nombre puede repetirse; el `id` no. Define el orden: mayor `id` = más reciente. |
| `name` | `TEXT NOT NULL` | Obligatorio, sin espacios sobrantes al inicio ni al final. Puede repetirse entre productos. |
| `category` | `TEXT NOT NULL CHECK (category IN ('Celulares','Laptops','Accesorios'))` | Una de las tres categorías fijas. |
| `price_cents` | `INTEGER NOT NULL CHECK (price_cents > 0)` | Precio en céntimos de sol. `S/ 4,299.00` se guarda como `429900`. |
| `description` | `TEXT NOT NULL` | Obligatoria. Sin límite de largo propio de la spec. |
| `specs` | `TEXT NOT NULL DEFAULT ''` | Opcional. Texto libre, una especificación por línea. |
| `image` | `TEXT NOT NULL` | Nombre del archivo en `data/uploads/` (por ejemplo `3f2a…c1.webp`). |

`PRAGMA user_version` guarda `0` en una base recién creada y `1` después de sembrar el catálogo inicial (ver research, decisión 4).

Consulta de lectura: `SELECT ... FROM products ORDER BY id DESC`.

### Producto tal como lo ve el cliente (DTO)

```json
{
  "id": 7,
  "name": "iPhone 15 Pro 256GB",
  "category": "Celulares",
  "priceCents": 429900,
  "description": "Titanio, chip A17 Pro y cámara de 48 MP.",
  "specs": "Pantalla: 6.1 pulgadas\nAlmacenamiento: 256 GB\nGarantía de 12 meses",
  "imageUrl": "/uploads/3f2a9c1e-….webp"
}
```

`price_cents` pasa a `priceCents` y `image` pasa a `imageUrl` (`/uploads/` + nombre). El DTO no expone nada interno.

### Reglas de validación (al agregar un producto)

Se aplican en el servidor (Zod, `server/validation.js`). El mismo conjunto de mensajes se muestra junto a cada campo.

| Campo | Regla | Mensaje |
|-------|-------|---------|
| `name` | Obligatorio tras quitar espacios | "Escribe el nombre del producto." |
| `category` | Una de `Celulares`, `Laptops`, `Accesorios` | "Elige una categoría." |
| `price` | Texto que cumple `^\d+(\.\d{1,2})?$` y es mayor que cero. Rechaza negativos, cero, letras, comas, más de dos decimales. | "Escribe un precio válido, mayor que cero y con hasta dos decimales." |
| `description` | Obligatoria tras quitar espacios | "Escribe una descripción." |
| `specs` | Opcional | (sin mensaje) |
| `image` | Obligatoria; formato detectado por bytes: JPG, PNG o WebP; hasta 5 MB | "Elige una foto." / "La foto debe ser JPG, PNG o WebP." / "La foto no debe pesar más de 5 MB." |

Conversión del precio: se parte el texto en parte entera y decimales y se arma el entero (`"25.5"` pasa a `2550`). Nunca se multiplica un decimal de coma flotante.

### Ciclo de vida del producto

```text
(no existe) --[administrador: Guardar producto, datos válidos]--> (en catálogo)
(en catálogo) --[administrador: Quitar + confirmar]--> (no existe)
```

No hay estado intermedio ni edición (fuera de alcance). Al pasar a "no existe" se borra la fila y su archivo de foto. Si falla el guardado de la foto, la fila no se crea (primero se escribe el archivo y después la fila; si la fila falla, se borra el archivo).

---

## Pedido y línea de pedido (cliente)

### Forma guardada

`localStorage["chaski.pedido"]`:

```json
[ { "productId": 7, "quantity": 1 }, { "productId": 12, "quantity": 2 } ]
```

Una línea por producto distinto. No se guardan nombres ni precios.

### Reglas (`client/src/lib/cart.js`)

| Regla | Detalle | Requisito |
|-------|---------|-----------|
| Una línea por producto | Agregar un producto presente suma 1 a su cantidad; no crea otra línea. | FR-008 |
| Cantidad mínima 1 | "−" con cantidad 1 no cambia nada; la línea solo desaparece con "Quitar". | FR-010 |
| Cantidad máxima 99 | "+" y "Agregar al pedido" con cantidad 99 no cambian nada; la interfaz deshabilita "+". | FR-010 (clarificación) |
| Contador | Suma de todas las cantidades. | FR-009 |
| Subtotal de línea | `priceCents × quantity` (enteros). | FR-011 |
| Total | Suma de los subtotales. | FR-011 |
| Vaciar | Deja la lista vacía de inmediato, sin confirmación. | FR-026 |
| Enviar | No modifica el pedido. | FR-012 |
| Conciliación | Al cargar el catálogo, se eliminan las líneas cuyo `productId` ya no existe y se informa al cliente. | FR-024 |
| Lectura segura | Si el JSON guardado está dañado, o una línea no tiene `productId` y `quantity` enteros válidos, se descarta; una cantidad fuera de 1..99 se ajusta al rango. | Robustez |

Línea mostrada = producto del catálogo + cantidad. "c/u" se muestra solo si `quantity > 1`.

### Transiciones del pedido

```text
vacío --[Agregar al pedido]--> con líneas
con líneas --[Agregar / + / − / Quitar línea]--> con líneas
con líneas --[Quitar la última línea  |  Vaciar pedido  |  conciliación elimina todo]--> vacío
con líneas --[Enviar pedido por WhatsApp]--> con líneas (sin cambios)
```

---

## Sesión de administrador (servidor, en memoria)

| Elemento | Forma | Regla |
|----------|-------|-------|
| Sesiones activas | `Set` de tokens aleatorios de 32 bytes (hex) | Se agrega al iniciar sesión, se quita en "Cerrar sesión". Se pierde al reiniciar el servidor. |
| Cookie | `chaski_admin=<token>`; `HttpOnly`, `SameSite=Strict`, `Path=/`, `Secure` en producción, **sin caducidad** | Se descarta al cerrar el navegador (FR-018 y Assumptions). |

## Intentos de acceso (servidor, en memoria)

`Map` de IP → `{ fails: number, lockedUntil: number | null }`.

```text
[sin fallos] --clave incorrecta--> [fails = n] (n = 1..4)
[fails = n] --clave incorrecta--> [fails = n+1]
[fails = 4] --clave incorrecta (5.º fallo)--> [bloqueado hasta ahora + 15 min]  (esta respuesta aún es 401)
[bloqueado] --cualquier intento, incluso con la clave correcta--> [bloqueado] (429)
[bloqueado] --pasan 15 min--> [sin fallos]
[fails = n] --clave correcta--> [sin fallos] + sesión iniciada
[cualquier estado sin bloqueo] --clave vacía o cuerpo inválido (400)--> sin cambios (no suma al conteo)
```

Las entradas vencidas o en cero se eliminan al consultar, para que el mapa no crezca sin límite.

---

## Relaciones

```text
Producto 1 ──── 0..n  Línea de pedido (solo por productId, en el navegador; sin clave foránea real)
Administrador: no es una entidad almacenada; es "quien conoce ADMIN_PASSWORD".
```

La relación entre línea y producto es débil a propósito: el producto puede desaparecer y la conciliación limpia la línea.
