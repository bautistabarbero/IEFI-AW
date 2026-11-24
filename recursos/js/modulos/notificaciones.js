// Notificaciones visibles en la interfaz (toasts accesibles).
let contenedor = null;

function obtenerContenedor() {
    if (!contenedor || !contenedor.isConnected) {
        contenedor = document.createElement('div');
        contenedor.className = 'notificaciones';
        contenedor.setAttribute('aria-live', 'polite');
        document.body.appendChild(contenedor);
    }
    return contenedor;
}

/**
 * Muestra un aviso temporal.
 * @param {string} texto
 * @param {'exito'|'error'|'info'} tipo
 * @param {number} duracion milisegundos (0 = queda hasta que se cierre)
 */
export function notificar(texto, tipo = 'info', duracion = 7000) {
    const aviso = document.createElement('div');
    aviso.className = 'notificacion';
    aviso.dataset.tipo = tipo;
    aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    const mensaje = document.createElement('span');
    mensaje.textContent = texto;
    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'notificacion__cerrar';
    cerrar.setAttribute('aria-label', 'Cerrar aviso');
    cerrar.textContent = '×';
    const quitar = () => aviso.remove();
    cerrar.addEventListener('click', quitar);
    aviso.append(mensaje, cerrar);
    obtenerContenedor().appendChild(aviso);
    if (duracion > 0) setTimeout(quitar, duracion);
    return aviso;
}
