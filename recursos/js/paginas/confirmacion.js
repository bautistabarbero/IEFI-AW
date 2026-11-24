// Página "Confirmación": muestra el último pedido y el estado de cada canal de envío.
import { CONFIG } from '../config.js';
import { formatoFecha, formatoPrecio } from '../modulos/formato.js';
import { camposEmailPedido, construirMensajePedido, construirUrlWhatsApp, enviarEmail } from '../modulos/envio.js';
import { guardarJSON, leerJSON } from '../modulos/almacenamiento.js';
import { notificar } from '../modulos/notificaciones.js';

const TEXTO_EMAIL = {
    enviado: 'Email enviado al negocio.',
    error: 'El email no se pudo enviar.',
    pendiente: 'Email pendiente.',
};
const TEXTO_WHATSAPP = {
    abierto: 'Se abrió WhatsApp con el pedido listo para enviar.',
    bloqueado: 'El navegador bloqueó WhatsApp: usá el botón de abajo para enviarlo.',
    pendiente: 'WhatsApp pendiente.',
};

const esPedidoValido = (p) => p && typeof p.numero === 'string' && Array.isArray(p.lineas) && p.lineas.length && Number.isFinite(p.totales?.total);

export function iniciar() {
    const contenedor = document.querySelector('#confirmacion-pedido');
    if (!contenedor) return;
    const pedidos = leerJSON(CONFIG.claves.pedidos, []);
    const pedido = Array.isArray(pedidos) ? pedidos.at(-1) : null;
    if (!esPedidoValido(pedido)) return;

    const titulo = document.createElement('h2');
    titulo.textContent = `Pedido ${pedido.numero}`;
    const fecha = document.createElement('p');
    fecha.textContent = `Realizado el ${formatoFecha(pedido.fecha)} · Total: ${formatoPrecio(pedido.totales.total)}.`;
    const lista = document.createElement('ul');
    for (const l of pedido.lineas) {
        const item = document.createElement('li');
        item.textContent = `${l.nombre} × ${l.cantidad} — ${formatoPrecio(l.importe)}`;
        lista.appendChild(item);
    }
    const estadoEmail = document.createElement('p');
    estadoEmail.dataset.canal = 'email';
    const estadoWhatsapp = document.createElement('p');
    estadoWhatsapp.textContent = TEXTO_WHATSAPP[pedido.estado?.whatsapp] ?? TEXTO_WHATSAPP.pendiente;
    const pago = document.createElement('p');
    pago.textContent = 'El pago y la entrega se coordinan directamente con el negocio por WhatsApp o teléfono.';

    const whatsapp = document.createElement('a');
    whatsapp.className = 'boton';
    whatsapp.href = construirUrlWhatsApp(CONFIG.negocio.whatsapp, construirMensajePedido(pedido));
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    whatsapp.textContent = 'Enviar pedido por WhatsApp';

    const acciones = document.createElement('p');
    acciones.append(whatsapp);

    function dibujarEstadoEmail() {
        estadoEmail.textContent = TEXTO_EMAIL[pedido.estado?.email] ?? TEXTO_EMAIL.pendiente;
        estadoEmail.dataset.tipo = pedido.estado?.email === 'enviado' ? 'exito' : 'error';
        acciones.querySelector('.reintentar')?.remove();
        if (pedido.estado?.email === 'enviado') return;
        const reintentar = document.createElement('button');
        reintentar.type = 'button';
        reintentar.className = 'reintentar';
        reintentar.textContent = 'Reintentar envío por email';
        reintentar.addEventListener('click', async () => {
            reintentar.disabled = true;
            const resultado = await enviarEmail({ asunto: `Nuevo pedido ${pedido.numero} — ${CONFIG.negocio.nombre}`, campos: camposEmailPedido(pedido), responderA: pedido.cliente.email });
            pedido.estado = { ...pedido.estado, email: resultado.ok ? 'enviado' : 'error', motivoEmail: resultado.motivo ?? '' };
            try { guardarJSON(CONFIG.claves.pedidos, pedidos); } catch (error) { console.error(error); }
            notificar(resultado.ok ? 'Pedido enviado por email al negocio.' : `No se pudo enviar el email: ${resultado.motivo}`, resultado.ok ? 'exito' : 'error');
            dibujarEstadoEmail();
        });
        acciones.append(' ', reintentar);
    }
    dibujarEstadoEmail();

    contenedor.replaceChildren(titulo, fecha, lista, estadoWhatsapp, estadoEmail, pago, acciones);
}
