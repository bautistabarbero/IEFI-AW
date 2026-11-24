// Página de inicio: arma "Catálogo de productos" con los productos destacados del JSON.
import { obtenerProductos } from '../modulos/productos.js';
import { agregarProductoAlCarrito } from '../modulos/agregar.js';
import { crearTarjetaProducto } from '../modulos/vistas.js';

export async function iniciar() {
    const lista = document.querySelector('#productos-destacados');
    if (!lista) return;
    try {
        const productos = await obtenerProductos();
        const items = productos.filter((p) => p.destacado).map((producto) => {
            const li = document.createElement('li');
            li.appendChild(crearTarjetaProducto(producto, agregarProductoAlCarrito));
            return li;
        });
        lista.replaceChildren(...items);
    } catch (error) {
        console.error(error);
        const aviso = document.createElement('li');
        aviso.textContent = 'No se pudieron cargar los productos. Podés verlos en el catálogo completo.';
        lista.replaceChildren(aviso);
    }
}
