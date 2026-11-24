// Lógica del carrito. Las funciones de cálculo son puras (reciben datos y devuelven datos nuevos);
// solo leerCarrito/guardarCarrito tocan el almacenamiento.
import { CONFIG } from '../config.js';
import { leerJSON, guardarJSON } from './almacenamiento.js';

const { limiteUnidades } = CONFIG;

/** Descarta entradas inválidas, une duplicados y limita cada cantidad a 1..99. */
export function normalizarCarrito(datos) {
    if (!Array.isArray(datos)) return [];
    const resultado = [];
    for (const item of datos) {
        if (!item || typeof item.id !== 'string' || !Number.isInteger(item.cantidad) || item.cantidad < 1) continue;
        const existente = resultado.find((linea) => linea.id === item.id);
        if (existente) existente.cantidad = Math.min(limiteUnidades, existente.cantidad + item.cantidad);
        else resultado.push({ id: item.id, cantidad: Math.min(limiteUnidades, item.cantidad) });
    }
    return resultado;
}

/** Suma `cantidad` unidades de un producto. Si supera el límite devuelve el carrito sin cambios. */
export function agregarAlCarrito(carrito, id, cantidad = 1) {
    const actual = carrito.find((linea) => linea.id === id)?.cantidad ?? 0;
    if (!Number.isInteger(cantidad) || cantidad < 1 || actual + cantidad > limiteUnidades) {
        return { carrito, agregado: false };
    }
    const nuevo = actual
        ? carrito.map((linea) => (linea.id === id ? { ...linea, cantidad: actual + cantidad } : linea))
        : [...carrito, { id, cantidad }];
    return { carrito: nuevo, agregado: true };
}

/** Fija la cantidad de una línea (1..99). Valores inválidos no cambian nada. */
export function cambiarCantidad(carrito, id, cantidad) {
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > limiteUnidades) return carrito;
    return carrito.map((linea) => (linea.id === id ? { ...linea, cantidad } : linea));
}

export const quitarDelCarrito = (carrito, id) => carrito.filter((linea) => linea.id !== id);

export const contarUnidades = (carrito) => carrito.reduce((total, linea) => total + linea.cantidad, 0);

/** Cruza el carrito con el catálogo; ignora productos que ya no existen. */
export function detallarCarrito(carrito, productos) {
    return carrito.flatMap((linea) => {
        const producto = productos.find((p) => p.id === linea.id);
        if (!producto) return [];
        return [{ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: linea.cantidad, importe: producto.precio * linea.cantidad }];
    });
}

/** Subtotal, descuento (si hay código válido) y total. Los precios del catálogo ya incluyen impuestos. */
export function calcularTotales(subtotal, promocionActiva = false) {
    const descuento = promocionActiva ? Math.round(subtotal * (CONFIG.promocion.porcentaje / 100)) : 0;
    return { subtotal, descuento, total: subtotal - descuento };
}

export const esCodigoPromocional = (codigo) => String(codigo ?? '').trim().toUpperCase() === CONFIG.promocion.codigo;

// --- Persistencia (localStorage) ---
export const leerCarrito = () => normalizarCarrito(leerJSON(CONFIG.claves.carrito, []));
export const guardarCarrito = (carrito) => guardarJSON(CONFIG.claves.carrito, carrito);
export const promocionGuardada = () => leerJSON(CONFIG.claves.promocion, false) === true;
export const guardarPromocion = (activa) => guardarJSON(CONFIG.claves.promocion, activa);
