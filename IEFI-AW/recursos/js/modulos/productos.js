// Catálogo: carga con fetch() desde el JSON y funciones de filtrado/orden (puras).
import { CONFIG } from '../config.js';

const ETIQUETAS_CATEGORIA = {
    'ceras-selladores': 'Ceras y selladores',
    'cuidado-interior': 'Cuidado de interior',
    herramientas: 'Herramientas y accesorios',
};

let productosCargados = null;

/** Lee el catálogo del JSON con fetch() (una sola vez por página). Lanza un error si falla. */
export async function obtenerProductos(ruta = CONFIG.rutaProductos) {
    if (productosCargados) return productosCargados;
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta} (HTTP ${respuesta.status})`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) throw new Error('El catálogo no tiene el formato esperado.');
    productosCargados = datos;
    return datos;
}

/** Enlace a la ficha de un producto. */
export const enlaceProducto = (producto) => `producto-detalle.html?id=${encodeURIComponent(producto.id)}`;

/** Minúsculas y sin tildes, para que "ceramico" encuentre "Cerámico". */
export function normalizarTexto(texto) {
    return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function etiquetaCategoria(slug) {
    return ETIQUETAS_CATEGORIA[slug] ?? slug.replace(/-/g, ' ');
}

/** Categorías que realmente existen en los datos (así nunca hay un filtro vacío). */
export function obtenerCategorias(productos) {
    return [...new Set(productos.map((p) => p.categoria))].map((valor) => ({ valor, etiqueta: etiquetaCategoria(valor) }));
}

const ORDENES = {
    relevancia: null,
    'precio-asc': (a, b) => a.precio - b.precio,
    'precio-desc': (a, b) => b.precio - a.precio,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
};

/**
 * Aplica búsqueda, categoría, "solo ofertas" y orden. No modifica el arreglo original.
 * @param {Array} productos
 * @param {{texto?: string, categoria?: string, soloOfertas?: boolean, orden?: string}} filtros
 */
export function filtrarProductos(productos, { texto = '', categoria = 'todas', soloOfertas = false, orden = 'relevancia' } = {}) {
    const buscado = normalizarTexto(texto);
    const resultado = productos.filter((p) => {
        const coincideTexto = !buscado || normalizarTexto(`${p.nombre} ${p.descripcion}`).includes(buscado);
        const coincideCategoria = categoria === 'todas' || p.categoria === categoria;
        const coincideOferta = !soloOfertas || (p.precioAnterior ?? 0) > p.precio;
        return coincideTexto && coincideCategoria && coincideOferta;
    });
    const comparador = ORDENES[orden];
    return comparador ? resultado.sort(comparador) : resultado;
}
