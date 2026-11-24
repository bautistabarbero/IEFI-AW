import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatoPrecio } from '../recursos/js/modulos/formato.js';

// Intl usa espacios no separables (U+00A0) según la versión de ICU: se normalizan para comparar.
const limpio = (texto) => texto.replace(/\s/g, ' ');

test('formatoPrecio: usa separador de miles argentino y símbolo $', () => {
    assert.equal(limpio(formatoPrecio(45000)), '$ 45.000');
    assert.equal(limpio(formatoPrecio(1250000)), '$ 1.250.000');
});

test('formatoPrecio: redondea sin decimales', () => {
    assert.equal(limpio(formatoPrecio(18500.4)), '$ 18.500');
});

test('formatoPrecio: valores inválidos se muestran como cero', () => {
    assert.equal(limpio(formatoPrecio('abc')), '$ 0');
    assert.equal(limpio(formatoPrecio(undefined)), '$ 0');
});
