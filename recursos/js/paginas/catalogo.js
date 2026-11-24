// Página "Productos": carga el JSON con fetch, arma los filtros y renderiza las tarjetas.
import { filtrarProductos, obtenerCategorias, obtenerProductos } from '../modulos/productos.js';
import { agregarProductoAlCarrito } from '../modulos/agregar.js';
import { crearTarjetaProducto } from '../modulos/vistas.js';

export async function iniciar() {
    const contenedor = document.querySelector('#catalogo-productos');
    const mensaje = document.querySelector('#mensaje-catalogo');
    const formulario = document.querySelector('#filtros-catalogo');
    if (!contenedor || !formulario) return;

    const campos = {
        texto: formulario.querySelector('#buscador-productos'),
        categoria: formulario.querySelector('#filtro-categoria'),
        orden: formulario.querySelector('#orden-productos'),
        soloOfertas: formulario.querySelector('#solo-ofertas'),
    };

    try {
        const productos = await obtenerProductos();

        // Las categorías salen de los datos: nunca aparece un filtro que devuelva cero resultados.
        for (const { valor, etiqueta } of obtenerCategorias(productos)) campos.categoria.add(new Option(etiqueta, valor));

        // Permite llegar con ?q=cera&cat=cuidado-interior (por ejemplo desde el buscador de otra página).
        const parametros = new URLSearchParams(location.search);
        if (parametros.get('q')) campos.texto.value = parametros.get('q');
        if ([...campos.categoria.options].some((o) => o.value === parametros.get('cat'))) campos.categoria.value = parametros.get('cat');

        const renderizar = () => {
            const encontrados = filtrarProductos(productos, {
                texto: campos.texto.value,
                categoria: campos.categoria.value,
                soloOfertas: campos.soloOfertas.checked,
                orden: campos.orden.value,
            });
            contenedor.replaceChildren(...encontrados.map((p) => crearTarjetaProducto(p, agregarProductoAlCarrito)));
            mensaje.textContent = encontrados.length
                ? `${encontrados.length} producto(s) encontrado(s).`
                : 'No se encontraron productos con esos criterios. Probá limpiando los filtros.';
        };

        // Eventos: escribir, elegir una opción, marcar la casilla, enviar o limpiar el formulario.
        formulario.addEventListener('input', renderizar);
        formulario.addEventListener('change', renderizar);
        formulario.addEventListener('submit', (evento) => { evento.preventDefault(); renderizar(); });
        formulario.addEventListener('reset', () => setTimeout(renderizar)); // espera a que el navegador vacíe los campos
        renderizar();
    } catch (error) {
        console.error(error);
        mensaje.textContent = 'No se pudo cargar el catálogo. Recargá la página para reintentar.';
        contenedor.replaceChildren();
    }
}
