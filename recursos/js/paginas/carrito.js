// Página "Carrito": lista los artículos, permite cambiar cantidades y quitar, y muestra los totales.
import { CONFIG } from '../config.js';
import { formatoPrecio } from '../modulos/formato.js';
import { obtenerProductos } from '../modulos/productos.js';
import { cambiarCantidad, calcularTotales, detallarCarrito, guardarCarrito, leerCarrito, promocionGuardada, quitarDelCarrito } from '../modulos/carrito.js';
import { notificar } from '../modulos/notificaciones.js';
import { actualizarContadorCarrito } from '../modulos/vistas.js';

function guardarYRedibujar(carrito, redibujar) {
    try {
        guardarCarrito(carrito);
    } catch (error) {
        console.error(error);
        notificar('No se pudieron guardar los cambios del carrito.', 'error');
        return;
    }
    actualizarContadorCarrito();
    redibujar();
}

export async function iniciar() {
    const contenedor = document.querySelector('.carrito__articulos');
    const totales = document.querySelector('#totales-carrito');
    const continuar = document.querySelector('#continuar-compra');
    if (!contenedor || !totales) return;

    let productos;
    try {
        productos = await obtenerProductos();
    } catch (error) {
        console.error(error);
        contenedor.textContent = 'No se pudo cargar el carrito. Recargá la página para reintentar.';
        return;
    }

    function dibujar() {
        const carrito = leerCarrito().filter((linea) => productos.some((p) => p.id === linea.id));
        const lineas = detallarCarrito(carrito, productos);
        contenedor.replaceChildren();
        continuar.hidden = !lineas.length;
        if (!lineas.length) {
            contenedor.textContent = 'El carrito está vacío. Podés agregar productos desde el catálogo.';
            totales.replaceChildren();
            return;
        }
        for (const linea of lineas) {
            const articulo = document.createElement('article');
            articulo.className = 'carrito__articulo';
            const titulo = document.createElement('h3');
            titulo.textContent = linea.nombre;
            const precio = document.createElement('p');
            precio.textContent = `Precio unitario: ${formatoPrecio(linea.precio)}`;
            const etiqueta = document.createElement('label');
            etiqueta.textContent = 'Cantidad ';
            etiqueta.htmlFor = `cantidad-${linea.id}`;
            const cantidad = document.createElement('input');
            Object.assign(cantidad, { type: 'number', min: '1', max: String(CONFIG.limiteUnidades), step: '1', value: String(linea.cantidad), id: etiqueta.htmlFor });
            cantidad.addEventListener('change', () => {
                const nueva = Number(cantidad.value);
                if (!Number.isInteger(nueva) || nueva < 1 || nueva > CONFIG.limiteUnidades) {
                    cantidad.value = linea.cantidad;
                    notificar(`La cantidad debe ser un entero entre 1 y ${CONFIG.limiteUnidades}.`, 'error', 4000);
                    return;
                }
                guardarYRedibujar(cambiarCantidad(carrito, linea.id, nueva), dibujar);
            });
            const importe = document.createElement('p');
            importe.textContent = `Subtotal: ${formatoPrecio(linea.importe)}`;
            const quitar = document.createElement('button');
            quitar.type = 'button';
            quitar.textContent = 'Quitar';
            quitar.setAttribute('aria-label', `Quitar ${linea.nombre} del carrito`);
            quitar.addEventListener('click', () => guardarYRedibujar(quitarDelCarrito(carrito, linea.id), dibujar));
            articulo.append(titulo, precio, etiqueta, cantidad, importe, quitar);
            contenedor.appendChild(articulo);
        }
        const t = calcularTotales(lineas.reduce((suma, l) => suma + l.importe, 0), promocionGuardada());
        const partes = [`Subtotal: ${formatoPrecio(t.subtotal)}`, ...(t.descuento ? [`Descuento: -${formatoPrecio(t.descuento)}`] : []), `Total: ${formatoPrecio(t.total)}`];
        totales.replaceChildren(...partes.map((texto, i) => {
            const p = document.createElement('p');
            if (i === partes.length - 1) { const fuerte = document.createElement('strong'); fuerte.textContent = texto; p.appendChild(fuerte); } else p.textContent = texto;
            return p;
        }));
    }
    dibujar();
}
