# Quickstart: comprobar Chaski Store

**Feature**: `001-catalogo-pedidos-whatsapp` | **Date**: 2026-10-24

Guía para poner la tienda en marcha y comprobar cada historia y criterio de éxito **usando solo la aplicación** (Principio IV). Los detalles de datos y de la API están en [data-model.md](./data-model.md) y [contracts/api.md](./contracts/api.md); no se repiten aquí.

## Requisitos previos

- Node.js 22.13 o superior (`node -v`).
- Un celular (o la vista de celular del navegador, ancho de 390 px) y una computadora.
- WhatsApp en el dispositivo, o WhatsApp Web (dependencia declarada en la spec).

## Preparación

1. Instalar dependencias: `npm install`
2. Copiar `.env.example` a `.env` y completar los valores con datos propios (nunca se suben al repositorio):
   - `ADMIN_PASSWORD`: la clave del administrador.
   - `WHATSAPP_NUMBER`: número de la tienda, solo dígitos con código de país, por ejemplo `51999999999`.
   - `PORT`: opcional (por defecto 3000).
3. Desarrollo: `npm run dev`. Producción: `npm start` (compila el cliente y arranca el servidor).
4. Abrir `http://localhost:3000` (en desarrollo, la dirección que muestre Vite).

Si falta `ADMIN_PASSWORD` o `WHATSAPP_NUMBER`, el servidor no arranca y lo dice en español.

## Pruebas automáticas

`npm test` debe terminar sin fallos (Principio VI). Cubre las reglas de negocio de la API y del cliente; las comprobaciones de abajo cubren lo que se ve en pantalla.

## Comprobaciones en la aplicación

Hacerlas en el orden indicado. La tienda trae productos de ejemplo.

### Historia 1: explorar el catálogo (celular)

1. Abrir la tienda: se ven productos con foto, nombre y precio con el formato `S/ 4,299.00`, del más reciente al más antiguo.
2. Tocar **Laptops**: solo laptops. Tocar **Todos**: vuelven todos.
3. Escribir `iphone` (también en mayúsculas) en el buscador: solo aparece ese producto.
4. Con **Laptops** activo, escribir `mac`: solo MacBook (categoría y búsqueda juntas).
5. Buscar `zzzz`: aparece "No encontramos productos".
6. Tocar un producto: se ve categoría, nombre, precio, descripción y ficha técnica (las líneas `Etiqueta: valor` como filas). **Volver** regresa al catálogo.
7. Apagar el servidor (Ctrl+C en la terminal) y recargar el catálogo: se ve "No pudimos cargar los productos. Intenta de nuevo." con el botón **Reintentar**, y no una pantalla en blanco. Volver a arrancar el servidor y tocar **Reintentar**: el catálogo carga.

### Historia 2: armar el pedido y enviarlo

1. Agregar un iPhone y dos SSD: "Mi pedido" muestra 3 unidades y el total correcto (SC-003). Volver a agregar el mismo producto aumenta su cantidad, sin línea repetida.
2. En "Mi pedido": "+" y "−" cambian el subtotal y el total al instante; con más de 1 unidad aparece el precio "c/u". "−" con 1 unidad no baja de 1. Con 99 unidades, "+" queda deshabilitado.
3. **Quitar** elimina la línea y recalcula. **Vaciar pedido** deja "Tu pedido está vacío" con acceso al catálogo y sin botón de WhatsApp activo.
4. Armar de nuevo un pedido y tocar **Enviar pedido por WhatsApp**: WhatsApp se abre con el mensaje escrito (todos los productos, cantidades, subtotales y total, SC-004) dirigido al número configurado. Al volver a la tienda, el pedido sigue intacto.
5. Cerrar y reabrir la pestaña (mismo dispositivo): el pedido sigue ahí.
6. Se ve el aviso "Tu pedido se envía por WhatsApp. No se realiza ningún pago en esta página." y en ningún momento se piden nombre, teléfono, dirección ni correo.

### Historia 3: acceso del administrador (computadora)

1. Abrir `/admin` escribiendo la dirección (en las pantallas de clientes no hay ningún enlace al panel).
2. Clave incorrecta: "Clave incorrecta."
3. Abrir directamente `/admin/panel` o `/admin/productos/nuevo` sin sesión: lleva a `/admin` (SC-007).
4. Clave correcta: se ve el panel. **Cerrar sesión** y volver a abrir `/admin/panel`: pide la clave otra vez.
5. Bloqueo: escribir 5 claves incorrectas; el siguiente intento, aunque sea con la clave correcta, muestra "Demasiados intentos. Vuelve a intentarlo en 15 minutos." Pasado ese tiempo, la clave correcta entra.
6. Cerrar el navegador por completo y abrirlo: hay que escribir la clave de nuevo.

### Historia 4: agregar y quitar productos

1. En el panel se ve la tabla (foto, nombre, categoría, precio), del más reciente al más antiguo, con **Agregar producto**, **Cerrar sesión** y **Quitar** por producto.
2. **Agregar producto** y **Guardar producto** sin llenar nada: cada error aparece junto a su campo y no se guarda nada. Probar un precio `0`, `-5`, `12.345` y `abc`, y una foto que no sea JPG, PNG ni WebP, o de más de 5 MB.
3. Llenar todo con un precio `1299.9` y una foto válida: el producto aparece **primero** en el panel y en el catálogo de clientes, sin pasos adicionales y en menos de 2 minutos (SC-005). El precio se ve `S/ 1,299.90`.
4. **Cancelar** en el formulario vuelve al panel sin guardar.
5. **Quitar** muestra "¿Quitar este producto?" con **Quitar** y **Cancelar**. Cancelar lo mantiene; confirmar lo elimina del panel y del catálogo (SC-006: al recargar la tienda ya no aparece).
6. Poner un producto en "Mi pedido" desde el celular, quitarlo desde el panel y recargar "Mi pedido": el producto ya no está y se muestra un aviso. Abrir el detalle de un producto quitado muestra "Este producto ya no está disponible".
7. Quitar todos los productos: los clientes ven "Aún no hay productos disponibles" y el panel queda vacío con **Agregar producto**. Los productos de ejemplo no reaparecen.
8. Textos muy largos: guardar un producto con un nombre de 200 caracteres y una descripción de 2,000 caracteres sin espacios. El catálogo se mantiene ordenado (el nombre se recorta a dos líneas), el detalle muestra el texto completo sin desbordar la pantalla en 390 px y la tabla del panel se ve ordenada en 1440 px.

### Criterios generales

- **SC-002**: en todas las pantallas, todo precio tiene `S/` y exactamente dos decimales.
- **SC-001**: una persona nueva llega al botón de WhatsApp en menos de 2 minutos sin ayuda.
- **SC-008**: cada comprobación anterior se hizo sin leer código.

## Notas de despliegue

- Respaldar `data/` (base y fotos) si el catálogo importa.
- Detrás de un proxy inverso, el bloqueo por intentos puede comportarse como global si no se configura `trust proxy` (ver research, decisión 9). Falla hacia el lado seguro.
- Algunos navegadores restauran la sesión al reabrir ("continuar donde lo dejé"); eso depende del navegador, no de la tienda.
