// Página "Revisar compra": resumen, código promocional y confirmación del pedido.
// Al confirmar: se abre WhatsApp con el pedido, se envía el email real y se avisa en pantalla.
import { CONFIG } from '../config.js';
import { formatoPrecio } from '../modulos/formato.js';
import { obtenerProductos } from '../modulos/productos.js';
import { calcularTotales, detallarCarrito, esCodigoPromocional, guardarCarrito, guardarPromocion, leerCarrito, promocionGuardada } from '../modulos/carrito.js';
import { camposEmailPedido, construirMensajePedido, construirUrlWhatsApp, enviarEmail, generarNumeroPedido } from '../modulos/envio.js';
import { guardarJSON, leerJSON } from '../modulos/almacenamiento.js';
import { notificar } from '../modulos/notificaciones.js';
import { limpiarErroresAlEscribir, mostrarMensaje, validarFormulario } from '../modulos/validaciones.js';

export async function iniciar() {
    const resumen = document.querySelector('#resumen-compra');
    const formPromo = document.querySelector('#form-promo');
    const formPedido = document.querySelector('#form-pedido');
    if (!resumen || !formPedido) return;

    let productos;
    try {
        productos = await obtenerProductos();
    } catch (error) {
        console.error(error);
        resumen.textContent = 'No se pudo cargar el resumen. Recargá la página para reintentar.';
        return;
    }

    let promocion = promocionGuardada();
    const botonConfirmar = formPedido.querySelector('button[type="submit"]');
    const grupoDireccion = formPedido.querySelector('#grupo-direccion');
    const direccion = formPedido.querySelector('#direccion');
    const lineasActuales = () => detallarCarrito(leerCarrito(), productos);

    function dibujarResumen() {
        const lineas = lineasActuales();
        botonConfirmar.disabled = !lineas.length;
        if (!lineas.length) {
            resumen.textContent = 'No hay artículos en el carrito. Volvé al catálogo para agregar productos.';
            return;
        }
        const lista = document.createElement('ul');
        for (const l of lineas) {
            const item = document.createElement('li');
            item.textContent = `${l.nombre}. Cantidad: ${l.cantidad}. Importe: ${formatoPrecio(l.importe)}.`;
            lista.appendChild(item);
        }
        const t = calcularTotales(lineas.reduce((suma, l) => suma + l.importe, 0), promocion);
        const textos = [`Subtotal: ${formatoPrecio(t.subtotal)}`, ...(t.descuento ? [`Descuento (${CONFIG.promocion.porcentaje}%): -${formatoPrecio(t.descuento)}`] : []), `Total: ${formatoPrecio(t.total)}`];
        const totales = textos.map((texto, i) => {
            const p = document.createElement('p');
            if (i === textos.length - 1) { const fuerte = document.createElement('strong'); fuerte.textContent = texto; p.appendChild(fuerte); } else p.textContent = texto;
            return p;
        });
        resumen.replaceChildren(lista, ...totales);
    }

    // --- Código promocional ---
    limpiarErroresAlEscribir(formPromo);
    formPromo.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const codigo = formPromo.querySelector('#codigo-promo').value.trim();
        if (!codigo) return mostrarMensaje(formPromo, 'Ingresá un código promocional.', 'error');
        promocion = esCodigoPromocional(codigo);
        try { guardarPromocion(promocion); } catch (error) { console.error(error); }
        mostrarMensaje(formPromo, promocion ? `Descuento del ${CONFIG.promocion.porcentaje}% aplicado al subtotal.` : 'Código inválido. No se aplica descuento.', promocion ? 'exito' : 'error');
        dibujarResumen();
    });

    // --- Entrega: la dirección solo es obligatoria para envíos ---
    const alternarDireccion = () => {
        const envio = formPedido.querySelector('input[name="entrega"]:checked')?.value === 'envio';
        grupoDireccion.hidden = !envio;
        direccion.required = envio;
        if (!envio) direccion.setCustomValidity('');
    };
    formPedido.addEventListener('change', (evento) => { if (evento.target.name === 'entrega') alternarDireccion(); });
    alternarDireccion();
    limpiarErroresAlEscribir(formPedido);

    // --- Confirmación ---
    formPedido.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const lineas = lineasActuales();
        if (!lineas.length) return dibujarResumen();
        if (!validarFormulario(formPedido)) return;

        const datos = Object.fromEntries(new FormData(formPedido).entries());
        const pedido = {
            numero: generarNumeroPedido(),
            fecha: new Date().toISOString(),
            cliente: { nombre: datos.nombre, telefono: datos.telefono, email: datos.email },
            entrega: { tipo: datos.entrega, direccion: datos.entrega === 'envio' ? datos.direccion : '' },
            notas: datos.notas || '',
            lineas,
            totales: calcularTotales(lineas.reduce((suma, l) => suma + l.importe, 0), promocion),
            estado: { whatsapp: 'pendiente', email: 'pendiente' },
        };

        botonConfirmar.disabled = true;
        const textoOriginal = botonConfirmar.textContent;
        botonConfirmar.textContent = 'Enviando pedido…';

        // 1) WhatsApp: se abre dentro del clic del usuario (si se esperara al email, el navegador bloquearía la ventana).
        const ventana = window.open(construirUrlWhatsApp(CONFIG.negocio.whatsapp, construirMensajePedido(pedido)), '_blank');
        pedido.estado.whatsapp = ventana ? 'abierto' : 'bloqueado';
        if (ventana) ventana.opener = null;
        if (!ventana) notificar('El navegador bloqueó la ventana de WhatsApp. Podés enviarlo desde la pantalla siguiente.', 'info');

        // 2) Email real al negocio.
        const resultado = await enviarEmail({ asunto: `Nuevo pedido ${pedido.numero} — ${CONFIG.negocio.nombre}`, campos: camposEmailPedido(pedido), responderA: pedido.cliente.email });
        pedido.estado.email = resultado.ok ? 'enviado' : 'error';
        pedido.estado.motivoEmail = resultado.motivo ?? '';
        notificar(resultado.ok ? 'Pedido enviado por email al negocio.' : `No se pudo enviar el email: ${resultado.motivo}`, resultado.ok ? 'exito' : 'error', 5000);

        // 3) Se guarda el pedido, se vacía el carrito y se muestra la confirmación.
        try {
            const pedidos = leerJSON(CONFIG.claves.pedidos, []);
            guardarJSON(CONFIG.claves.pedidos, [...(Array.isArray(pedidos) ? pedidos : []), pedido].slice(-20));
            guardarCarrito([]);
            guardarPromocion(false);
        } catch (error) {
            console.error(error);
            notificar('El pedido se envió, pero no se pudo guardar el comprobante en este navegador.', 'error');
            botonConfirmar.disabled = false;
            botonConfirmar.textContent = textoOriginal;
            return;
        }
        setTimeout(() => { location.href = 'confirmacion.html'; }, 1200);
    });

    dibujarResumen();
}
