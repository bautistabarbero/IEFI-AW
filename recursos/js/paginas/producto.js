// Página "Detalle de producto": lee ?id= de la URL, busca el producto en el JSON y lo muestra.
import { CONFIG } from '../config.js';
import { formatoPrecio } from '../modulos/formato.js';
import { obtenerProductos } from '../modulos/productos.js';
import { agregarProductoAlCarrito } from '../modulos/agregar.js';
import { limpiarErroresAlEscribir } from '../modulos/validaciones.js';

export async function iniciar() {
    const formulario = document.querySelector('#form-agregar-producto');
    const estado = document.querySelector('#estado-producto');
    if (!formulario || !estado) return;
    try {
        const productos = await obtenerProductos();
        const id = new URLSearchParams(location.search).get('id') ?? productos[0]?.id;
        const producto = productos.find((p) => p.id === id);
        if (!producto) {
            estado.textContent = 'Producto no encontrado. Volvé al catálogo para elegir otro.';
            return;
        }
        document.title = `${producto.nombre} | Chiavetta Detailing`;
        document.querySelector('#nombre-producto').textContent = producto.nombre;
        document.querySelector('#ruta-producto').textContent = producto.nombre;
        document.querySelector('#descripcion-producto').textContent = producto.descripcion;
        document.querySelector('#precio-producto').textContent = formatoPrecio(producto.precio);
        const imagen = document.querySelector('#imagen-producto');
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        document.querySelector('#contenido-producto').hidden = false;
        estado.hidden = true;

        const campo = formulario.querySelector('#cantidad');
        limpiarErroresAlEscribir(formulario);
        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const cantidad = Number(campo.value);
            if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > CONFIG.limiteUnidades) {
                campo.setCustomValidity(`Ingresá una cantidad entera entre 1 y ${CONFIG.limiteUnidades}.`);
                campo.reportValidity();
                return;
            }
            agregarProductoAlCarrito(producto, cantidad);
        });
    } catch (error) {
        console.error(error);
        estado.textContent = 'No se pudo cargar el producto. Recargá la página para reintentar.';
    }
}
