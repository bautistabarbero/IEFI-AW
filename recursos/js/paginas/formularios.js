// Formularios de consulta (contacto, consignación, servicio): validan, envían por email real y avisan en pantalla.
import { CONFIG } from '../config.js';
import { construirMensajeConsulta, construirUrlWhatsApp, enviarEmail } from '../modulos/envio.js';
import { guardarJSON, leerJSON } from '../modulos/almacenamiento.js';
import { notificar } from '../modulos/notificaciones.js';
import { limpiarErroresAlEscribir, mostrarMensaje, validarFormulario } from '../modulos/validaciones.js';

export function iniciar() {
    for (const formulario of document.querySelectorAll('form[data-asunto]')) {
        limpiarErroresAlEscribir(formulario);
        formulario.addEventListener('submit', async (evento) => {
            evento.preventDefault();
            if (!validarFormulario(formulario)) return;

            const asunto = formulario.dataset.asunto;
            const datos = Object.fromEntries(new FormData(formulario).entries());
            const boton = formulario.querySelector('button[type="submit"]');
            const textoOriginal = boton.textContent;
            boton.disabled = true;
            boton.textContent = 'Enviando…';

            const resultado = await enviarEmail({ asunto: `${asunto} — ${CONFIG.negocio.nombre}`, campos: datos, responderA: datos.email });
            boton.disabled = false;
            boton.textContent = textoOriginal;

            // Se guarda un historial local de consultas (try/catch: el almacenamiento puede estar lleno o bloqueado).
            try {
                const previas = leerJSON(CONFIG.claves.consultas, []);
                guardarJSON(CONFIG.claves.consultas, [...(Array.isArray(previas) ? previas : []), { asunto, ...datos, enviada: resultado.ok, fecha: new Date().toISOString() }].slice(-30));
            } catch (error) {
                console.error(error);
            }

            if (resultado.ok) {
                mostrarMensaje(formulario, '¡Gracias! Tu consulta fue enviada por email. Te responderemos a la brevedad.', 'exito');
                notificar('Consulta enviada correctamente.', 'exito');
                formulario.reset();
                return;
            }
            const aviso = mostrarMensaje(formulario, `No pudimos enviar el email (${resultado.motivo}). Podés enviarla por WhatsApp: `, 'error');
            const enlace = document.createElement('a');
            enlace.href = construirUrlWhatsApp(CONFIG.negocio.whatsapp, construirMensajeConsulta(asunto, datos));
            enlace.target = '_blank';
            enlace.rel = 'noopener noreferrer';
            enlace.textContent = 'enviar por WhatsApp';
            aviso.appendChild(enlace);
            notificar('No se pudo enviar la consulta por email.', 'error');
        });
    }
}
