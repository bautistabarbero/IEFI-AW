// Configuración central del sitio. Es el único archivo que hay que tocar
// para cambiar el contacto del negocio, el destino de los emails o el código promocional.
export const CONFIG = {
    negocio: {
        nombre: 'Chiavetta Detailing',
        // Formato internacional sin "+" ni espacios (54 = Argentina, 9 = celular, 351 = Córdoba).
        whatsapp: '5493513090597',
    },
    // Dirección que recibe los pedidos y consultas por email (servicio FormSubmit, sin backend propio).
    emailDestino: 'santinoch92@gmail.com',
    rutaProductos: 'recursos/datos/productos.json',
    limiteUnidades: 99,
    promocion: { codigo: 'CHIAVETTA10', porcentaje: 10 },
    claves: {
        carrito: 'chiavetta-carrito',
        pedidos: 'chiavetta-pedidos',
        consultas: 'chiavetta-consultas',
        promocion: 'chiavetta-promocion',
    },
};
