// Punto de entrada único (<script type="module">). Carga solo el módulo que necesita cada página.
import { actualizarContadorCarrito } from './modulos/vistas.js';

// Se compara sin extensión para que también funcione en hostings con "clean URLs" (/productos).
const paginas = {
    productos: () => import('./paginas/catalogo.js'),
    'producto-detalle': () => import('./paginas/producto.js'),
    carrito: () => import('./paginas/carrito.js'),
    'revisar-compra': () => import('./paginas/checkout.js'),
    confirmacion: () => import('./paginas/confirmacion.js'),
    contacto: () => import('./paginas/formularios.js'),
    consignacion: () => import('./paginas/formularios.js'),
    'servicio-detalle': () => import('./paginas/formularios.js'),
    index: () => import('./paginas/inicio.js'),
};

async function arrancar() {
    actualizarContadorCarrito();
    const nombre = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
    const cargar = paginas[nombre];
    if (!cargar) return;
    try {
        const modulo = await cargar();
        await modulo.iniciar();
    } catch (error) {
        console.error('No se pudo iniciar la página:', error);
    }
}

arrancar();
