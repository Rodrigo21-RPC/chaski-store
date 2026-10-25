# Feature Specification: Catálogo y pedidos por WhatsApp

**Feature Branch**: `001-catalogo-pedidos-whatsapp`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "Tienda virtual llamada Chaski Store: un catálogo de productos electrónicos (celulares, laptops y accesorios) donde el administrador puede agregar y quitar productos (sin pagos) y los pedidos se realizan vía WhatsApp. Debe ser simple. Referencia visual: las seis imágenes validadas en docs/diseno (01-catalogo-movil, 02-detalle-producto-movil, 03-mi-pedido-movil, 04-acceso-administrador-escritorio, 05-panel-administracion-escritorio, 06-agregar-producto-escritorio)."

## Clarifications

### Session 2026-10-24

- Q: ¿Qué debe pasar con "Mi pedido" después de que el cliente toca "Enviar pedido por WhatsApp"? → A: El pedido se conserva y se agrega un botón "Vaciar pedido" en "Mi pedido".
- Q: ¿Qué debe pasar cuando el administrador toca "Quitar" en un producto del panel? → A: Se muestra una confirmación ("¿Quitar este producto?" con Quitar / Cancelar) antes de borrarlo.
- Q: ¿En qué orden se muestran los productos en el catálogo de los clientes y en el panel del administrador? → A: Más recientes primero (el último agregado aparece arriba).
- Q: ¿Qué debe pasar si alguien escribe la clave de administrador incorrecta varias veces seguidas? → A: Tras 5 intentos fallidos seguidos, se bloquea el acceso 15 minutos con un mensaje claro.
- Q: ¿Cuál es la cantidad máxima de unidades que se puede pedir de un mismo producto en "Mi pedido"? → A: Máximo 99 unidades por producto; al llegar a 99 el botón "+" se deshabilita.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el catálogo y ver un producto (Priority: P1)

Un cliente entra a Chaski Store desde su celular y ve los productos en una cuadrícula, cada uno con foto, nombre y precio en soles. Puede filtrar por categoría (Todos, Celulares, Laptops, Accesorios), buscar por nombre y abrir un producto para ver su descripción y su ficha técnica.

**Why this priority**: Sin catálogo no hay tienda. Es lo primero que ve el cliente y, por sí solo, ya entrega valor: permite conocer qué se vende y a qué precio.

**Independent Test**: Abrir la tienda en el celular, tocar "Laptops" y comprobar que solo aparecen laptops; escribir "iphone" en el buscador y comprobar que aparece solo ese producto; tocar un producto y ver su detalle con "Volver" al catálogo.

**Acceptance Scenarios**:

1. **Given** que hay productos de varias categorías, **When** el cliente abre la tienda, **Then** ve todos los productos con foto, nombre y precio con el formato "S/ 4,299.00".
2. **Given** que el cliente está en el catálogo, **When** toca una categoría, **Then** solo ve los productos de esa categoría, y al tocar "Todos" vuelve a ver todos.
3. **Given** que el cliente está en el catálogo, **When** escribe parte del nombre de un producto en el buscador, **Then** ve solo los productos cuyo nombre contiene ese texto, sin importar mayúsculas o minúsculas.
4. **Given** que el cliente está en el catálogo, **When** toca un producto, **Then** ve su categoría, nombre, precio, descripción y ficha técnica, y puede volver al catálogo con "Volver".
5. **Given** que la búsqueda o el filtro no encuentran nada, **When** se muestra el resultado, **Then** el cliente ve el mensaje "No encontramos productos" en lugar de una pantalla vacía.

---

### User Story 2 - Armar el pedido y enviarlo por WhatsApp (Priority: P1)

El cliente agrega productos a "Mi pedido" desde el catálogo o desde el detalle del producto, ajusta cantidades, quita lo que no quiere (o vacía todo el pedido con "Vaciar pedido") y ve el total. Al tocar "Enviar pedido por WhatsApp" se abre WhatsApp con un mensaje ya escrito con el resumen del pedido, dirigido al número de la tienda. No se realiza ningún pago en la página.

**Why this priority**: Es el objetivo del negocio: convertir la visita en un pedido. Junto con la Historia 1 forma el producto mínimo utilizable.

**Independent Test**: Agregar un iPhone y dos SSD al pedido, comprobar que "Mi pedido" muestra 3 unidades y el total correcto, tocar "Enviar pedido por WhatsApp" y comprobar que WhatsApp se abre con el resumen escrito.

**Acceptance Scenarios**:

1. **Given** que el cliente ve un producto en el catálogo o en su detalle, **When** toca "Agregar al pedido", **Then** el contador de "Mi pedido" aumenta en 1 unidad.
2. **Given** que el producto ya está en el pedido, **When** el cliente vuelve a tocar "Agregar al pedido", **Then** la cantidad de ese producto aumenta en 1 y no aparece una línea repetida.
3. **Given** que el cliente está en "Mi pedido", **When** cambia la cantidad con los botones "−" y "+", **Then** el subtotal de esa línea y el total se actualizan al instante; si una línea tiene más de 1 unidad se muestra también el precio unitario "c/u".
4. **Given** que una línea tiene cantidad 1, **When** el cliente toca "−", **Then** la cantidad se mantiene en 1 (para eliminar la línea se usa "Quitar").
5. **Given** que una línea tiene cantidad 99, **When** el cliente intenta aumentarla (con "+" o con "Agregar al pedido"), **Then** la cantidad se mantiene en 99 y el botón "+" aparece deshabilitado.
6. **Given** que el cliente está en "Mi pedido", **When** toca "Quitar" en una línea, **Then** el producto desaparece del pedido y el total se recalcula.
7. **Given** que el pedido tiene productos, **When** el cliente toca "Enviar pedido por WhatsApp", **Then** se abre WhatsApp con un mensaje que lista cada producto con su cantidad y subtotal, y el total del pedido.
8. **Given** que el pedido está vacío, **When** el cliente abre "Mi pedido", **Then** ve el mensaje "Tu pedido está vacío" con un acceso al catálogo, y el botón de WhatsApp no está disponible.
9. **Given** que el cliente armó un pedido, **When** cierra o recarga la página y vuelve en el mismo dispositivo, **Then** su pedido sigue ahí.
10. **Given** que el pedido tiene productos, **When** el cliente toca "Enviar pedido por WhatsApp", **Then** el pedido se mantiene intacto en "Mi pedido" (enviar no lo vacía).
11. **Given** que el pedido tiene productos, **When** el cliente toca "Vaciar pedido", **Then** el pedido queda vacío de inmediato y se muestra el mensaje "Tu pedido está vacío".

---

### User Story 3 - Acceso del administrador (Priority: P2)

El administrador entra a una pantalla de "Acceso de administrador" donde escribe su clave. Si es correcta, ve el panel de administración; si no, ve un mensaje de error. Puede cerrar sesión.

**Why this priority**: Protege la gestión del catálogo. Hace falta antes de poder agregar o quitar productos, pero la tienda ya funciona para los clientes sin ella.

**Independent Test**: Abrir el acceso de administrador, escribir una clave incorrecta y ver el error; escribir la clave correcta y llegar al panel; tocar "Cerrar sesión" y comprobar que ya no se puede abrir el panel sin volver a entrar.

**Acceptance Scenarios**:

1. **Given** que el administrador está en el acceso, **When** escribe la clave correcta, **Then** entra al panel de administración.
2. **Given** que el administrador está en el acceso, **When** escribe una clave incorrecta, **Then** ve el mensaje "Clave incorrecta" y no entra al panel.
3. **Given** que alguien no ha iniciado sesión, **When** intenta abrir directamente el panel o el formulario de agregar producto, **Then** es llevado al acceso de administrador.
4. **Given** que el administrador está en el panel, **When** toca "Cerrar sesión", **Then** sale del panel y para volver a entrar debe escribir la clave de nuevo.
5. **Given** que se escribieron 5 claves incorrectas seguidas desde la misma conexión, **When** se hace un sexto intento desde esa conexión, **Then** el acceso queda bloqueado durante 15 minutos con el mensaje "Demasiados intentos. Vuelve a intentarlo en 15 minutos." y ni siquiera la clave correcta da acceso durante ese tiempo; desde otra conexión sigue siendo posible entrar.
6. **Given** que el bloqueo terminó, **When** el administrador escribe la clave correcta, **Then** entra al panel; una clave correcta antes de llegar a 5 fallos reinicia el conteo de intentos fallidos.
7. **Given** que un cliente usa la tienda, **When** recorre las pantallas de clientes, **Then** no ve ningún botón ni enlace hacia el panel de administración.

---

### User Story 4 - Agregar y quitar productos (Priority: P2)

Con la sesión iniciada, el administrador ve una tabla con todos los productos (foto, nombre, categoría, precio). Puede quitar un producto con "Quitar" o tocar "Agregar producto" para completar un formulario (nombre, categoría, precio, descripción, especificaciones y foto) y guardarlo. El cambio se refleja en el catálogo de los clientes.

**Why this priority**: Permite que la tienda se mantenga al día sin ayuda técnica. Depende de la Historia 3.

**Independent Test**: Entrar como administrador, agregar un producto con foto, abrir el catálogo y comprobar que aparece; volver al panel, tocar "Quitar" en ese producto, confirmar y comprobar que ya no aparece en el catálogo.

**Acceptance Scenarios**:

1. **Given** que el administrador está en el panel, **When** lo abre, **Then** ve cada producto con su foto, nombre, categoría y precio, y los botones "Agregar producto" y "Cerrar sesión".
2. **Given** que el administrador completa todos los campos obligatorios del formulario, **When** toca "Guardar producto", **Then** el producto aparece en el panel y en el catálogo de los clientes.
3. **Given** que falta un campo obligatorio o el precio no es válido, **When** el administrador toca "Guardar producto", **Then** el producto no se guarda y cada error se muestra junto al campo correspondiente.
4. **Given** que el administrador está en el formulario, **When** toca "Cancelar", **Then** vuelve al panel sin guardar nada.
5. **Given** que el administrador está en el panel, **When** toca "Quitar" en un producto, **Then** se muestra la confirmación "¿Quitar este producto?" con las opciones "Quitar" y "Cancelar".
6. **Given** que se muestra la confirmación, **When** el administrador toca "Quitar", **Then** el producto desaparece del panel y del catálogo de los clientes; si toca "Cancelar", el producto se mantiene.
7. **Given** que un producto se quitó mientras un cliente lo tenía en su pedido, **When** el cliente abre "Mi pedido", **Then** ese producto ya no aparece en el pedido y se le avisa con un mensaje.

---

### Edge Cases

- Búsqueda y categoría activas a la vez: ambas se aplican juntas (por ejemplo, "Laptops" + "mac" solo muestra MacBook).
- Catálogo sin productos: el cliente ve "Aún no hay productos disponibles" y el administrador ve el panel vacío con "Agregar producto".
- Precio con más de dos decimales, negativo, cero o con letras: se rechaza con un mensaje claro.
- Foto en formato distinto de JPG, PNG o WebP, o demasiado pesada: se rechaza con un mensaje claro y el producto no se guarda.
- Nombre repetido: se permite, porque pueden existir dos productos con el mismo nombre.
- Descripción o ficha técnica muy largas: el catálogo se mantiene ordenado y el detalle muestra el texto completo.
- Producto quitado mientras un cliente lo tiene abierto: el cliente ve "Este producto ya no está disponible" y puede volver al catálogo.
- El administrador no sale de sesión y cierra el navegador: se aplica la regla de duración de sesión indicada en Assumptions.
- Error al cargar los productos (por ejemplo, sin conexión con el servidor): el cliente ve "No pudimos cargar los productos. Intenta de nuevo." con un botón "Reintentar", y no una pantalla en blanco.
- Clave de administrador vacía: se muestra "Escribe la clave." junto al campo y no cuenta como intento fallido.

## Requirements *(mandatory)*

### Functional Requirements

**Catálogo y detalle**

- **FR-001**: El sistema DEBE mostrar los productos en el catálogo con foto, nombre y precio, ordenados del más reciente al más antiguo (el último producto agregado aparece primero), también cuando hay filtro de categoría o búsqueda.
- **FR-002**: El sistema DEBE permitir filtrar el catálogo por las categorías Todos, Celulares, Laptops y Accesorios.
- **FR-003**: El sistema DEBE permitir buscar productos por nombre, sin distinguir mayúsculas ni minúsculas, y combinar la búsqueda con la categoría elegida.
- **FR-004**: El sistema DEBE mostrar, en el detalle de un producto, su categoría, nombre, precio, descripción y ficha técnica, con un botón "Agregar al pedido" y un botón "Volver".
- **FR-005**: El sistema DEBE mostrar todo precio en soles con el formato "S/ 1,234.00" (símbolo S/, separador de miles y dos decimales).
- **FR-006**: Todos los textos del producto DEBEN estar en español de Perú.

**Pedido**

- **FR-007**: El cliente DEBE poder agregar un producto al pedido desde el catálogo y desde el detalle.
- **FR-008**: Si el producto ya está en el pedido, el sistema DEBE aumentar su cantidad en lugar de crear una línea repetida.
- **FR-009**: El sistema DEBE mostrar el contador de unidades de "Mi pedido" (suma de todas las cantidades) en las pantallas de clientes.
- **FR-010**: En "Mi pedido", el cliente DEBE poder aumentar o disminuir la cantidad de cada línea (mínimo 1, máximo 99 unidades por producto) y quitar la línea.
- **FR-011**: El sistema DEBE calcular y mostrar el subtotal de cada línea y el total del pedido, actualizándolos al instante.
- **FR-012**: El sistema DEBE conservar el pedido del cliente en su dispositivo hasta que el cliente lo vacíe; enviar el pedido por WhatsApp no lo vacía.
- **FR-013**: El sistema DEBE ofrecer el botón "Enviar pedido por WhatsApp", que abre WhatsApp con un mensaje ya escrito, dirigido al número de la tienda, con cada producto, su cantidad, su subtotal y el total.
- **FR-014**: "Mi pedido" DEBE mostrar el aviso "Tu pedido se envía por WhatsApp. No se realiza ningún pago en esta página."
- **FR-026**: "Mi pedido" DEBE ofrecer un botón "Vaciar pedido" que quita todas las líneas de inmediato, sin pedir confirmación; con el pedido vacío, el botón no está disponible.
- **FR-015**: El sistema NO DEBE cobrar ni procesar pagos, y NO DEBE pedir al cliente datos personales (nombre, teléfono, dirección ni correo) para armar o enviar el pedido.

**Administración**

- **FR-016**: El sistema DEBE pedir la clave del administrador para acceder al panel y rechazar claves incorrectas con un mensaje claro. Tras 5 intentos fallidos seguidos desde la misma conexión a internet, DEBE bloquear el acceso desde esa conexión durante 15 minutos: el quinto intento fallido aún muestra "Clave incorrecta" y, a partir del sexto, se muestra un mensaje claro de bloqueo; durante el bloqueo se rechaza también la clave correcta. Una conexión distinta no se ve afectada.
- **FR-017**: El sistema DEBE impedir que alguien sin sesión iniciada vea el panel o agregue o quite productos, aunque conozca la dirección de esas pantallas.
- **FR-018**: El administrador DEBE poder cerrar sesión.
- **FR-019**: El panel DEBE listar todos los productos, del más reciente al más antiguo, con foto, nombre, categoría y precio, y un botón "Quitar" por producto.
- **FR-020**: El administrador DEBE poder agregar un producto indicando nombre, categoría, precio, descripción, especificaciones (opcional) y foto.
- **FR-021**: El sistema DEBE validar el formulario: nombre, categoría, precio, descripción y foto son obligatorios; el precio debe ser mayor que cero con hasta dos decimales; la foto debe ser JPG, PNG o WebP.
- **FR-022**: El administrador DEBE poder quitar un producto, previa confirmación ("¿Quitar este producto?" con Quitar / Cancelar); una vez confirmado, el producto deja de mostrarse de inmediato en el catálogo de los clientes.
- **FR-023**: Un producto agregado DEBE mostrarse de inmediato, en primer lugar, en el catálogo de los clientes y en el panel, sin pasos adicionales.
- **FR-024**: El sistema DEBE quitar del pedido de un cliente los productos que ya no existen y avisarle.
- **FR-025**: Las pantallas de clientes NO DEBEN mostrar enlaces ni botones hacia la administración.

### Key Entities

- **Producto**: Artículo del catálogo. Tiene nombre, categoría (Celulares, Laptops o Accesorios), precio en soles, descripción, especificaciones (texto, opcional) y una foto.
- **Pedido**: Lista temporal del cliente, guardada en su dispositivo. Contiene líneas y un total calculado.
- **Línea de pedido**: Un producto dentro del pedido con su cantidad y su subtotal (precio por cantidad).
- **Administrador**: Única persona con permiso para agregar y quitar productos. Se identifica solo con su clave; no hay cuentas de clientes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona que usa la tienda por primera vez encuentra un producto (por categoría o buscándolo), lo agrega al pedido y llega al botón de WhatsApp en menos de 2 minutos, sin ayuda.
- **SC-002**: En el 100 % de las pantallas, todo precio se ve con símbolo S/ y exactamente dos decimales.
- **SC-003**: El total de "Mi pedido" coincide siempre con la suma de cantidad por precio de cada línea; se comprueba con al menos tres pedidos de ejemplo, incluido uno con un producto repetido.
- **SC-004**: Al tocar "Enviar pedido por WhatsApp", el mensaje que se abre contiene todos los productos del pedido, con sus cantidades y el total.
- **SC-005**: Una persona no técnica agrega un producto nuevo con foto en menos de 2 minutos y lo ve en el catálogo de clientes de inmediato.
- **SC-006**: Un producto quitado por el administrador no aparece en el catálogo en la siguiente vez que se abre o recarga la tienda.
- **SC-007**: Ninguna pantalla de administración se puede abrir sin escribir la clave correcta.
- **SC-008**: Una persona no técnica puede comprobar cada historia de usuario usando solo la aplicación, sin leer código.

## Assumptions

- Los clientes usan principalmente el celular; el administrador usa principalmente una computadora (como en los diseños). Ambas pantallas funcionan en cualquier tamaño, pero se validan con esos formatos.
- Hay un único administrador con una sola clave. No hay registro de clientes, cuentas ni historial de pedidos.
- La clave del administrador y el número de WhatsApp de la tienda se configuran fuera del código, no se escriben en él y no se piden en la aplicación (según la constitución del proyecto).
- El pedido no se guarda en la tienda: solo vive en el dispositivo del cliente hasta que el cliente lo vacía (enviarlo por WhatsApp no lo borra). El negocio atiende y confirma el pedido por esa conversación.
- Las categorías son fijas: Celulares, Laptops y Accesorios. Agregar o quitar categorías está fuera de alcance.
- Los productos no tienen stock, variantes (color, capacidad) ni descuentos; cada producto tiene un único precio.
- Las especificaciones se escriben como texto libre, una por línea. En la ficha técnica, cada línea con el formato "Etiqueta: valor" se muestra como una fila (por ejemplo, "Pantalla: 6.1 pulgadas"), y las demás se muestran como texto.
- Cada producto tiene una sola foto, de hasta 5 MB.
- La sesión del administrador dura hasta que cierra sesión o cierra el navegador.
- Para poder comprobar la tienda desde el primer día, el catálogo inicial incluye productos de ejemplo parecidos a los de los diseños; el administrador puede quitarlos.
- Fuera de alcance en esta versión, aunque aparezcan en los diseños como adornos: compartir producto, perfil de usuario, y dirección de entrega o datos del cliente en el pedido. Cualquiera de ellos se propone aparte, no se construye aquí (constitución, principio III).
- Editar un producto ya creado está fuera de alcance: para cambiarlo se quita y se vuelve a agregar.
- Dependencia: el cliente necesita tener WhatsApp disponible en su dispositivo (la aplicación o WhatsApp Web).
