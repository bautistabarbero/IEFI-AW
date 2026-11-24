// Funciones de formato. Son puras: no tocan el DOM ni el navegador.
const formateadorPrecio = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

/** Convierte un número en un precio legible. Ej.: 45000 -> "$ 45.000". */
export function formatoPrecio(valor) {
    return formateadorPrecio.format(Number(valor) || 0);
}

/** Devuelve la fecha ISO como texto local. Ej.: "23/11/2026 20:15". */
export function formatoFecha(iso) {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(fecha);
}
