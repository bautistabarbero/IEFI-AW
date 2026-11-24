// Envío de pedidos y consultas: WhatsApp (enlace wa.me) y email real (FormSubmit vía fetch).
// Las funciones que construyen textos y URLs son puras y están cubiertas por tests.
import { CONFIG } from '../config.js';
import { formatoPrecio } from './formato.js';

/** Número de pedido legible y casi único. Ej.: "CD-LPQ3X9A". */
export const generarNumeroPedido = (ahora = Date.now()) => `CD-${ahora.toString(36).toUpperCase()}`;

/** Enlace que abre WhatsApp con el texto ya escrito. */
export const construirUrlWhatsApp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

/** Texto del pedido tal como se lo ve en WhatsApp y en el email. */
export function construirMensajePedido(pedido) {
    const lineas = pedido.lineas.map((l) => `• ${l.nombre} x${l.cantidad} — ${formatoPrecio(l.importe)}`);
    const entrega = pedido.entrega.tipo === 'envio' ? `Envío a domicilio: ${pedido.entrega.direccion}` : 'Retiro en el local (Barrio San Lorenzo)';
    return [
        `Hola ${CONFIG.negocio.nombre}! Quiero confirmar este pedido (${pedido.numero}):`,
        '',
        ...lineas,
        '',
        `Subtotal: ${formatoPrecio(pedido.totales.subtotal)}`,
        ...(pedido.totales.descuento ? [`Descuento: -${formatoPrecio(pedido.totales.descuento)}`] : []),
        `Total: ${formatoPrecio(pedido.totales.total)}`,
        '',
        `Entrega: ${entrega}`,
        `Nombre: ${pedido.cliente.nombre}`,
        `Teléfono: ${pedido.cliente.telefono}`,
        `Email: ${pedido.cliente.email}`,
        ...(pedido.notas ? [`Notas: ${pedido.notas}`] : []),
    ].join('\n');
}

/** Texto de una consulta (contacto, consignación o servicio). */
export function construirMensajeConsulta(asunto, datos) {
    const campos = Object.entries(datos).filter(([, valor]) => String(valor).trim() !== '').map(([clave, valor]) => `${clave}: ${valor}`);
    return [`Hola ${CONFIG.negocio.nombre}! ${asunto}`, '', ...campos].join('\n');
}

/**
 * Envía un email real al negocio mediante FormSubmit (no requiere servidor propio).
 * Nunca lanza: devuelve { ok, motivo } para que la interfaz pueda informar al usuario.
 * `fetchFn` se puede reemplazar en los tests.
 */
export async function enviarEmail({ asunto, campos, responderA }, fetchFn = globalThis.fetch) {
    try {
        const respuesta = await fetchFn(`https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.emailDestino)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ _subject: asunto, _template: 'table', _captcha: 'false', ...(responderA ? { _replyto: responderA } : {}), ...campos }),
        });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok || String(datos.success) !== 'true') {
            return { ok: false, motivo: datos.message || `El servicio de email respondió con error (${respuesta.status}).` };
        }
        return { ok: true };
    } catch (error) {
        return { ok: false, motivo: 'No hay conexión con el servicio de email.' };
    }
}

/** Convierte un pedido en los campos planos que recibe el email. */
export function camposEmailPedido(pedido) {
    return {
        Pedido: pedido.numero,
        Cliente: pedido.cliente.nombre,
        Teléfono: pedido.cliente.telefono,
        Email: pedido.cliente.email,
        Entrega: pedido.entrega.tipo === 'envio' ? `Envío: ${pedido.entrega.direccion}` : 'Retiro en el local',
        Detalle: pedido.lineas.map((l) => `${l.nombre} x${l.cantidad} (${formatoPrecio(l.importe)})`).join(' | '),
        Total: formatoPrecio(pedido.totales.total),
        Notas: pedido.notas || '-',
    };
}
