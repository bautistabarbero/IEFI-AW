// Piezas de interfaz compartidas entre páginas. Todo el contenido se inserta con textContent
// (nunca innerHTML con datos) para evitar inyección de código.
import { formatoPrecio } from './formato.js';
import { enlaceProducto } from './productos.js';
import { contarUnidades, leerCarrito } from './carrito.js';

/** Actualiza el "(n)" junto al enlace del carrito en el encabezado y en el botón flotante. */
export function actualizarContadorCarrito() {
    const cantidad = contarUnidades(leerCarrito());
    document.querySelectorAll('.header__carrito a, .carrito-flotante').forEach((enlace) => {
        let contador = enlace.querySelector('.carrito-contador');
        if (!contador) {
            contador = document.createElement('span');
            contador.className = 'carrito-contador';
            enlace.appendChild(contador);
        }
        contador.textContent = `(${cantidad})`;
        enlace.setAttribute('aria-label', `Ver carrito de compras: ${cantidad} unidades`);
    });
}

/** Crea la tarjeta de un producto. `alAgregar(producto)` se ejecuta al pulsar el botón. */
export function crearTarjetaProducto(producto, alAgregar) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';

    const imagen = document.createElement('img');
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.width = 300;
    imagen.loading = 'lazy';

    const titulo = document.createElement('h3');
    titulo.textContent = producto.nombre;

    const descripcion = document.createElement('p');
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement('p');
    precio.className = 'tarjeta__precio';
    precio.textContent = formatoPrecio(producto.precio);
    if (producto.precioAnterior > producto.precio) {
        const anterior = document.createElement('s');
        anterior.className = 'tarjeta__precio-anterior';
        anterior.textContent = formatoPrecio(producto.precioAnterior);
        precio.append(' ', anterior);
    }

    const detalle = document.createElement('a');
    detalle.href = enlaceProducto(producto);
    detalle.textContent = 'Ver producto';

    tarjeta.append(imagen, titulo, descripcion, precio, detalle);
    if (alAgregar) {
        const agregar = document.createElement('button');
        agregar.type = 'button';
        agregar.className = 'boton agregar-carrito';
        agregar.textContent = 'Agregar al carrito';
        agregar.setAttribute('aria-label', `Agregar ${producto.nombre} al carrito`);
        agregar.addEventListener('click', () => alAgregar(producto));
        tarjeta.appendChild(agregar);
    }
    return tarjeta;
}
