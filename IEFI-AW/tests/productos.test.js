import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filtrarProductos, normalizarTexto, obtenerCategorias } from '../recursos/js/modulos/productos.js';

const catalogo = JSON.parse(await readFile(new URL('../recursos/datos/productos.json', import.meta.url), 'utf8'));
const ids = (lista) => lista.map((p) => p.id);

test('el JSON del catálogo tiene la estructura esperada', () => {
    assert.ok(catalogo.length > 0);
    const repetidos = ids(catalogo).filter((id, i, todos) => todos.indexOf(id) !== i);
    assert.deepEqual(repetidos, [], 'los ids no deben repetirse');
    for (const p of catalogo) {
        for (const campo of ['id', 'nombre', 'categoria', 'descripcion', 'imagen']) assert.equal(typeof p[campo], 'string', `${p.id}.${campo}`);
        assert.ok(Number.isFinite(p.precio) && p.precio > 0, `${p.id}.precio`);
    }
});

test('normalizarTexto: quita tildes y mayúsculas', () => {
    assert.equal(normalizarTexto('  Cerámico PROFESIONAL '), 'ceramico profesional');
});

test('filtrarProductos: la búsqueda ignora tildes y mayúsculas', () => {
    assert.ok(ids(filtrarProductos(catalogo, { texto: 'CERAMICO' })).includes('ceramic-shield'));
});

test('filtrarProductos: filtra por categoría', () => {
    const interior = filtrarProductos(catalogo, { categoria: 'cuidado-interior' });
    assert.ok(interior.length > 0);
    assert.ok(interior.every((p) => p.categoria === 'cuidado-interior'));
});

test('filtrarProductos: solo ofertas devuelve productos con precio anterior mayor', () => {
    const ofertas = filtrarProductos(catalogo, { soloOfertas: true });
    assert.ok(ofertas.length > 0);
    assert.ok(ofertas.every((p) => p.precioAnterior > p.precio));
});

test('filtrarProductos: ordena por precio ascendente y descendente', () => {
    const asc = filtrarProductos(catalogo, { orden: 'precio-asc' }).map((p) => p.precio);
    assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
    const desc = filtrarProductos(catalogo, { orden: 'precio-desc' }).map((p) => p.precio);
    assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
});

test('filtrarProductos: no modifica el arreglo original y sin resultados devuelve []', () => {
    const copia = structuredClone(catalogo);
    filtrarProductos(catalogo, { orden: 'precio-desc' });
    assert.deepEqual(catalogo, copia);
    assert.deepEqual(filtrarProductos(catalogo, { texto: 'zzzz-no-existe' }), []);
});

test('obtenerCategorias: solo devuelve categorías con productos', () => {
    const categorias = obtenerCategorias(catalogo).map((c) => c.valor);
    assert.deepEqual(categorias, [...new Set(catalogo.map((p) => p.categoria))]);
});
