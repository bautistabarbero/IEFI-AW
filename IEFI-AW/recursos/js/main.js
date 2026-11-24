// Punto de entrada único (<script type="module">) de todas las páginas.
// Igual que en el TP4, cada función iniciar() revisa si los elementos de su página existen
// y, si no están, no hace nada. Así se llaman todas sin importar en qué página estemos.
import { actualizarContadorCarrito } from './modulos/vistas.js';
import { iniciar as iniciarInicio } from './paginas/inicio.js';
import { iniciar as iniciarCatalogo } from './paginas/catalogo.js';
import { iniciar as iniciarProducto } from './paginas/producto.js';
import { iniciar as iniciarCarrito } from './paginas/carrito.js';
import { iniciar as iniciarCheckout } from './paginas/checkout.js';
import { iniciar as iniciarConfirmacion } from './paginas/confirmacion.js';
import { iniciar as iniciarFormularios } from './paginas/formularios.js';

actualizarContadorCarrito();
iniciarInicio();
iniciarCatalogo();
iniciarProducto();
iniciarCarrito();
iniciarCheckout();
iniciarConfirmacion();
iniciarFormularios();
