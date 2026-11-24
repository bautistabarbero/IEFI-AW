# Chiavetta Detailing — Sitio web

Proyecto integrador (IEFI) de **Aplicaciones Web 1** — IES Siglo 21. Sitio comercial e institucional de un negocio de estética automotriz de Barrio San Lorenzo, Córdoba: servicios, catálogo con carrito, pedidos por WhatsApp y email, y consignación de vehículos.

> Sitio publicado: _(pegar link)_  ·  Repositorio: _(pegar link)_

## Qué incluye (consignas del IEFI)

| Consigna | Dónde está |
|---|---|
| ES Modules (`import`/`export`) y modularización | `recursos/js/main.js`, `modulos/`, `paginas/` (un único `<script type="module">`) |
| JSON con los datos y `fetch` | `recursos/datos/productos.json` + `obtenerProductos()` en `modulos/productos.js` |
| Renderizado de la vista desde el JSON | `paginas/catalogo.js`, `paginas/inicio.js`, `modulos/vistas.js` |
| Filtros del catálogo (eventos) | búsqueda, categoría, orden y "solo ofertas" en `paginas/catalogo.js` |
| Carrito + pedido completo | `paginas/carrito.js`, `paginas/checkout.js`, `paginas/confirmacion.js` |
| WhatsApp + email real + aviso en pantalla | `modulos/envio.js` (wa.me y FormSubmit), `modulos/notificaciones.js` |
| `try/catch` | lectura de storage, `fetch`, envíos, carga de páginas |
| `localStorage` | carrito, promoción, historial de pedidos y consultas |
| Validación HTML + JavaScript | atributos `required/minlength/pattern/type` + `modulos/validaciones.js` |
| Recursos en directorios | `recursos/css`, `recursos/img`, `recursos/js`, `recursos/datos` |
| Tests unitarios nativos de Node | `tests/*.test.js` (`node:test`) |
| CI/CD con GitHub Actions | `.github/workflows/ci-cd.yml` |

## Estructura

```
├── *.html                    # páginas
├── recursos/
│   ├── css/style.css
│   ├── datos/productos.json
│   ├── img/
│   └── js/
│       ├── main.js           # punto de entrada (carga solo el módulo de la página actual)
│       ├── config.js         # WhatsApp, email destino, código promocional
│       ├── modulos/          # lógica reutilizable (formato, carrito, productos, validaciones, envío...)
│       └── paginas/          # una función iniciar() por página
├── tests/                    # tests unitarios con node:test
└── .github/workflows/ci-cd.yml
```

## Ejecutar en local

Los módulos ES y `fetch` **no funcionan abriendo el HTML con doble clic** (`file://`): hace falta un servidor.

```bash
npm start            # o: python3 -m http.server 8000
# abrir http://localhost:8000
```

## Tests

```bash
npm test             # node --test  (Node 20 o superior, sin dependencias)
```

Cubren cálculo de totales y descuento, reglas del carrito (límite de 99, duplicados, datos dañados), filtros/orden/búsqueda sin tildes, validaciones, armado de mensajes y URL de WhatsApp, y el envío de email con `fetch` simulado.

## CI/CD

El workflow `ci-cd.yml` tiene dos jobs encadenados:

1. **test** — en cada push y pull request instala Node 22 y ejecuta `npm test`.
2. **deploy** — solo si `test` pasó y el push es a `main`, publica el sitio en GitHub Pages. Si un test falla, no se despliega nada.

Activación (una sola vez): en el repositorio, *Settings → Pages → Build and deployment → Source: **GitHub Actions***.

**Alternativa Vercel:** importar el repositorio en vercel.com (framework "Other", sin build). `vercel.json` ya está incluido.

## Configuración

Todo en `recursos/js/config.js`:

- `negocio.whatsapp`: número en formato internacional sin `+` (`5493513090597`).
- `emailDestino`: casilla que recibe pedidos y consultas.
- `promocion`: código y porcentaje de descuento (`CHIAVETTA10`, 10 %).

### Email real (FormSubmit)

Los emails se envían con [FormSubmit](https://formsubmit.co), sin servidor propio. **La primera vez** que llega un envío a `emailDestino`, FormSubmit manda un correo de activación a esa casilla: hay que abrirlo y confirmar. Desde ahí, cada pedido y consulta llega por email. Mientras no esté activado, la interfaz avisa el error y ofrece enviar por WhatsApp.

## Decisiones técnicas

- **Sin frameworks ni dependencias**: HTML, CSS y JavaScript nativos, como pide la materia.
- **Lógica pura separada del DOM** (`carrito.js`, `productos.js`, `envio.js`, `validaciones.js`): por eso se puede testear con Node sin navegador.
- **`textContent` en lugar de `innerHTML`** para datos dinámicos (evita inyección de código).
- **Carga por página** con `import()` dinámico: cada página descarga solo lo que usa.
- Los precios del catálogo se consideran finales; se eliminó el "impuesto de ejemplo" del TP4 porque el pedido ahora se envía de verdad al negocio.
