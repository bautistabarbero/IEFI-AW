// Acceso seguro a localStorage / sessionStorage.
// Una lectura dañada nunca debe impedir que se abra el sitio (try/catch).

/** Lee y parsea un JSON. Si no existe o está dañado, devuelve `respaldo`. */
export function leerJSON(clave, respaldo, almacenamiento = globalThis.localStorage) {
    try {
        const crudo = almacenamiento.getItem(clave);
        return crudo === null ? respaldo : (JSON.parse(crudo) ?? respaldo);
    } catch {
        return respaldo;
    }
}

/** Guarda un valor como JSON. Lanza error si el almacenamiento está lleno o bloqueado. */
export function guardarJSON(clave, valor, almacenamiento = globalThis.localStorage) {
    almacenamiento.setItem(clave, JSON.stringify(valor));
}
