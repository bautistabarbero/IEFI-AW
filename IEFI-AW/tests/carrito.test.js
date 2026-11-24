import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agregarAlCarrito, cambiarCantidad, calcularTotales, contarUnidades, detallarCarrito, esCodigoPromocional, normalizarCarrito, quitarDelCarrito } from '../recursos/js/modulos/carrito.js';

const productos = [
    { id: 'a', nombre: 'Producto A', precio: 1000 },
    { id: 'b', nombre: 'Producto B', precio: 2500 },
];

test('calcularTotales: sin promoción el total es el subtotal', () => {
    assert.deepEqual(calcularTotales(10000), { subtotal: 10000, descuento: 0, total: 10000 });
});

test('calcularTotales: con promoción aplica 10% y redondea', () => {
    assert.deepEqual(calcularTotales(10000, true), { subtotal: 10000, descuento: 1000, total: 9000 });
    assert.deepEqual(calcularTotales(18500, true), { subtotal: 18500, descuento: 1850, total: 16650 });
    assert.equal(calcularTotales(12345, true).descuento, 1235); // 1234,5 redondea hacia arriba
});

test('agregarAlCarrito: agrega un producto nuevo sin mutar el original', () => {
    const original = [];
    const { carrito, agregado } = agregarAlCarrito(original, 'a', 2);
    assert.equal(agregado, true);
    assert.deepEqual(carrito, [{ id: 'a', cantidad: 2 }]);
    assert.deepEqual(original, []);
});

test('agregarAlCarrito: suma cantidades de un producto existente', () => {
    const { carrito } = agregarAlCarrito([{ id: 'a', cantidad: 2 }], 'a', 3);
    assert.deepEqual(carrito, [{ id: 'a', cantidad: 5 }]);
});

test('agregarAlCarrito: respeta el límite de 99 unidades', () => {
    const inicial = [{ id: 'a', cantidad: 98 }];
    const resultado = agregarAlCarrito(inicial, 'a', 2);
    assert.equal(resultado.agregado, false);
    assert.deepEqual(resultado.carrito, inicial);
});

test('agregarAlCarrito: rechaza cantidades inválidas', () => {
    for (const mala of [0, -1, 1.5, NaN, '2']) assert.equal(agregarAlCarrito([], 'a', mala).agregado, false);
});

test('cambiarCantidad y quitarDelCarrito', () => {
    const carrito = [{ id: 'a', cantidad: 1 }, { id: 'b', cantidad: 4 }];
    assert.deepEqual(cambiarCantidad(carrito, 'b', 7), [{ id: 'a', cantidad: 1 }, { id: 'b', cantidad: 7 }]);
    assert.deepEqual(cambiarCantidad(carrito, 'b', 100), carrito);
    assert.deepEqual(quitarDelCarrito(carrito, 'a'), [{ id: 'b', cantidad: 4 }]);
    assert.equal(contarUnidades(carrito), 5);
});

test('normalizarCarrito: descarta datos dañados y une duplicados', () => {
    const sucio = [{ id: 'a', cantidad: 2 }, { id: 'a', cantidad: 3 }, { id: 5, cantidad: 1 }, { id: 'b', cantidad: 0 }, null, { id: 'c', cantidad: 500 }];
    assert.deepEqual(normalizarCarrito(sucio), [{ id: 'a', cantidad: 5 }, { id: 'c', cantidad: 99 }]);
    assert.deepEqual(normalizarCarrito('no es un arreglo'), []);
});

test('detallarCarrito: calcula importes e ignora productos inexistentes', () => {
    const lineas = detallarCarrito([{ id: 'a', cantidad: 3 }, { id: 'zzz', cantidad: 1 }, { id: 'b', cantidad: 2 }], productos);
    assert.equal(lineas.length, 2);
    assert.equal(lineas[0].importe, 3000);
    assert.equal(lineas[1].importe, 5000);
});

test('esCodigoPromocional: ignora mayúsculas y espacios', () => {
    assert.equal(esCodigoPromocional(' chiavetta10 '), true);
    assert.equal(esCodigoPromocional('OTRO'), false);
    assert.equal(esCodigoPromocional(undefined), false);
});
