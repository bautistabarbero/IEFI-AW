// Validaciones de formularios. Las reglas (esEmailValido, esTelefonoValido...) son puras y testeables;
// validarFormulario las aplica sobre el DOM combinándolas con la validación nativa de HTML.

export const contarDigitos = (texto) => (String(texto).match(/\d/g) ?? []).length;

export const esEmailValido = (texto) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(texto).trim());

/** Acepta dígitos, espacios, guiones, paréntesis y "+"; exige al menos 8 dígitos. */
export const esTelefonoValido = (texto) => /^[+()0-9 \-]+$/.test(String(texto).trim()) && contarDigitos(texto) >= 8;

export const esContactoValido = (texto) => esEmailValido(texto) || esTelefonoValido(texto);

/** Muestra un mensaje de estado dentro del formulario (accesible: role="status"). */
export function mostrarMensaje(formulario, texto, tipo = 'exito') {
    let mensaje = formulario.querySelector('.mensaje-formulario');
    if (!mensaje) {
        mensaje = document.createElement('p');
        mensaje.className = 'mensaje-formulario';
        mensaje.setAttribute('role', 'status');
        formulario.appendChild(mensaje);
    }
    mensaje.textContent = texto;
    mensaje.dataset.tipo = tipo;
    return mensaje;
}

/**
 * Valida un formulario: primero reglas extra en JavaScript (setCustomValidity) y luego
 * checkValidity() para las reglas HTML (required, minlength, pattern, type="email").
 * Devuelve true si todo está bien; si no, muestra el primer error del navegador.
 */
export function validarFormulario(formulario) {
    for (const campo of formulario.querySelectorAll('input, textarea')) {
        campo.setCustomValidity('');
        if (['text', 'email', 'tel', 'textarea'].includes(campo.type)) campo.value = campo.value.trim();
        if (!campo.value) continue;
        if (campo.minLength > 0 && campo.value.length < campo.minLength) campo.setCustomValidity(`Ingresá al menos ${campo.minLength} caracteres.`);
        if (campo.type === 'email' && !esEmailValido(campo.value)) campo.setCustomValidity('Ingresá un email válido, por ejemplo nombre@dominio.com.');
        if (campo.type === 'tel' && !esTelefonoValido(campo.value)) campo.setCustomValidity('Ingresá un teléfono válido (al menos 8 dígitos).');
        if (campo.dataset.regla === 'contacto' && !esContactoValido(campo.value)) campo.setCustomValidity('Ingresá un email o un teléfono válido.');
    }
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }
    return true;
}

/** Limpia el error personalizado apenas el usuario vuelve a escribir. */
export function limpiarErroresAlEscribir(formulario) {
    formulario.addEventListener('input', (evento) => evento.target.setCustomValidity?.(''));
}
