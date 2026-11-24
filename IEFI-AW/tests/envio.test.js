import { test } from 'node:test';
import assert from 'node:assert/strict';
import { camposEmailPedido, construirMensajeConsulta, construirMensajePedido, construirUrlWhatsApp, enviarEmail, generarNumeroPedido } from '../recursos/js/modulos/envio.js';

const pedido = {
    numero: 'CD-TEST1',
    cliente: { nombre: 'Ana Pérez', telefono: '3511234567', email: 'ana@correo.com' },
    entrega: { tipo: 'retiro', direccion: '' },
    notas: '',
    lineas: [{ nombre: 'Cera Carnauba Premium', precio: 45000, cantidad: 2, importe: 90000 }],
    totales: { subtotal: 90000, descuento: 9000, total: 81000 },
};

test('construirUrlWhatsApp: codifica el texto para la URL', () => {
    const url = construirUrlWhatsApp('5493513090597', 'Hola & chau\nlínea 2');
    assert.equal(url, 'https://wa.me/5493513090597?text=Hola%20%26%20chau%0Al%C3%ADnea%202');
    assert.equal(new URL(url).searchParams.get('text'), 'Hola & chau\nlínea 2');
});

test('construirMensajePedido: incluye número, productos, total, entrega y datos del cliente', () => {
    const texto = construirMensajePedido(pedido);
    for (const esperado of ['CD-TEST1', 'Cera Carnauba Premium x2', 'Descuento', 'Retiro en el local', 'Ana Pérez', 'ana@correo.com']) assert.ok(texto.includes(esperado), esperado);
});

test('construirMensajePedido: muestra la dirección cuando es envío y omite el descuento si no hay', () => {
    const texto = construirMensajePedido({ ...pedido, entrega: { tipo: 'envio', direccion: 'Av. Siempreviva 742' }, totales: { subtotal: 90000, descuento: 0, total: 90000 } });
    assert.ok(texto.includes('Av. Siempreviva 742'));
    assert.ok(!texto.includes('Descuento'));
});

test('construirMensajeConsulta: omite campos vacíos', () => {
    const texto = construirMensajeConsulta('Consulta', { nombre: 'Ana', telefono: '', mensaje: 'Hola' });
    assert.ok(texto.includes('nombre: Ana') && texto.includes('mensaje: Hola'));
    assert.ok(!texto.includes('telefono'));
});

test('generarNumeroPedido: formato CD-XXXX y distinto en momentos distintos', () => {
    assert.match(generarNumeroPedido(1_700_000_000_000), /^CD-[0-9A-Z]+$/);
    assert.notEqual(generarNumeroPedido(1), generarNumeroPedido(2));
});

test('camposEmailPedido: arma los campos planos del email', () => {
    const campos = camposEmailPedido(pedido);
    assert.equal(campos.Pedido, 'CD-TEST1');
    assert.equal(campos.Notas, '-');
    assert.ok(campos.Detalle.includes('x2'));
});

test('enviarEmail: devuelve ok cuando el servicio responde success', async () => {
    let pedidoRecibido;
    const falso = async (url, opciones) => { pedidoRecibido = { url, opciones }; return { ok: true, status: 200, json: async () => ({ success: 'true' }) }; };
    const resultado = await enviarEmail({ asunto: 'Prueba', campos: { a: 1 }, responderA: 'x@y.com' }, falso);
    assert.deepEqual(resultado, { ok: true });
    assert.match(pedidoRecibido.url, /^https:\/\/formsubmit\.co\/ajax\//);
    assert.equal(JSON.parse(pedidoRecibido.opciones.body)._subject, 'Prueba');
});

test('enviarEmail: informa el motivo cuando el servicio rechaza el envío', async () => {
    const falso = async () => ({ ok: true, status: 200, json: async () => ({ success: 'false', message: 'Falta activar el email' }) });
    assert.deepEqual(await enviarEmail({ asunto: 'x', campos: {} }, falso), { ok: false, motivo: 'Falta activar el email' });
});

test('enviarEmail: nunca lanza error si falla la red', async () => {
    const roto = async () => { throw new TypeError('network'); };
    const resultado = await enviarEmail({ asunto: 'x', campos: {} }, roto);
    assert.equal(resultado.ok, false);
    assert.ok(resultado.motivo.length > 0);
});
