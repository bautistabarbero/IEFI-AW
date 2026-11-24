// Acción compartida "agregar al carrito" (catálogo y ficha de producto).
import { CONFIG } from '../config.js';
import { agregarAlCarrito, guardarCarrito, leerCarrito } from './carrito.js';
import { notificar } from './notificaciones.js';
import { actualizarContadorCarrito } from './vistas.js';

/** Agrega unidades, guarda en localStorage y avisa al usuario. Devuelve true si se agregó. */
export function agregarProductoAlCarrito(producto, cantidad = 1) {
    try {
        const { carrito, agregado } = agregarAlCarrito(leerCarrito(), producto.id, cantidad);
        if (!agregado) {
            notificar(`El límite es ${CONFIG.limiteUnidades} unidades por producto.`, 'error');
            return false;
        }
        guardarCarrito(carrito);
        actualizarContadorCarrito();
        notificar(`${producto.nombre} agregado al carrito.`, 'exito', 4000);
        return true;
    } catch (error) {
        console.error(error);
        notificar('No se pudo guardar el carrito. Revisá el almacenamiento del navegador e intentá de nuevo.', 'error');
        return false;
    }
}
