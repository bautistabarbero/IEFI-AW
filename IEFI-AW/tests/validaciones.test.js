import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contarDigitos, esContactoValido, esEmailValido, esTelefonoValido } from '../recursos/js/modulos/validaciones.js';

test('esEmailValido: acepta emails correctos', () => {
    for (const ok of ['nombre@dominio.com', 'a.b+c@sub.dominio.com.ar', ' persona@correo.org ']) assert.equal(esEmailValido(ok), true, ok);
});

test('esEmailValido: rechaza emails incorrectos', () => {
    for (const mal of ['', 'sin-arroba.com', 'a@b', 'a@b.c', 'dos@@x.com', 'con espacio@x.com']) assert.equal(esEmailValido(mal), false, mal);
});

test('esTelefonoValido: exige 8 dígitos y solo caracteres permitidos', () => {
    assert.equal(esTelefonoValido('+54 351 309-0597'), true);
    assert.equal(esTelefonoValido('(351) 3090597'), true);
    assert.equal(esTelefonoValido('1234567'), false);
    assert.equal(esTelefonoValido('351-abc-0597'), false);
});

test('contarDigitos y esContactoValido', () => {
    assert.equal(contarDigitos('+54 (351) 309-0597'), 12);
    assert.equal(esContactoValido('persona@correo.com'), true);
    assert.equal(esContactoValido('3513090597'), true);
    assert.equal(esContactoValido('hola'), false);
});
