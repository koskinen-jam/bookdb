const { Handler } = require('./handler.js');

describe('Handler constructor', () => {
	test('throws on empty path', () => {
		expect(() => {
			new Handler();
		}).toThrow();
	});

	let invalidPaths = [
		'cac',
		'//',
		'foo?',
		'äöä',
		12,
		'',
		{},
		[],
		null,
		undefined,
	];

	invalidPaths.forEach(
		(path) => {
			test(`throws on invalid path ${path}.`, () => {
				expect(() => {
					new Handler(path);
				}).toThrow();
			});
		}
	);

	let invalidCallbacks = [
		'foo',
		0,
		{ foo: (x) => x },
		{ get: 'getto!' },
		{ get: null },
		{ get: undefined },
	];

	invalidCallbacks.forEach(
		(cbs) => {
			test(
				`throws on invalid callbacks ${cbs}.`,
				() => {
					expect(() => {
						new Handler('/foo', cbs);
					}).toThrow();
				}
			);
		}
	);
});

const express = require('express');

describe('Registering callbacks', () => {
	let app = express();

	let h = new Handler(
		'/foo',
		{
			get: (a, b) => `get ${a} ${b}`,
			post: (a, b) => `post ${a} ${b}`,
			delete: (a, b) => `delete ${a} ${b}`,
		}
	);
	h.registerPaths(app);

	let defs = app._router.stack
		.filter(r => r.route)
		.map(r => [
			r.route.path,
			r.route.methods,
		]);

	test('get registered', () => {
		expect(defs).toContainEqual(['/foo', { get: true }]);
	});
	test('post registered', () => {
		expect(defs).toContainEqual(['/foo', { post: true }]);
	});
	test('delete registered', () => {
		expect(defs).toContainEqual(['/foo', { delete: true }]);
	});

});
