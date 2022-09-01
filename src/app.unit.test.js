const request = require('supertest');

// Mockup database that never succeeds
const db = {
	fetch: (s, p) => { throw "Huh..."; },
	fetchRow: (s, p) => { throw "That's weird..."; },
	fetchColumn: (s, p) => { throw "That should not happen..."; },
	run: (s, p) => { throw "This is a bit embarrassing..."; },
};

const app = require('./app.js').init(db);
	
describe('Database errors in handler', () => {
	test('Caught database error in GET /books', async () => {
		res = await request(app).get('/books')

		expect(res.status).toEqual(500);
		expect(res.body).toEqual({});
		expect(res.text).toEqual('Internal Server Error');
	});

	test('Caught database error in GET /books/1', async () => {
		res = await request(app).get('/books/1')

		expect(res.status).toEqual(500);
		expect(res.body).toEqual({});
		expect(res.text).toEqual('Internal Server Error');
	});

	test('Caught database error in DELETE /books/1', async () => {
		res = await request(app).delete('/books/1')

		expect(res.status).toEqual(500);
		expect(res.body).toEqual({});
		expect(res.text).toEqual('Internal Server Error');
	});

	test('Caught database error in POST /books', async () => {
		res = await request(app).post('/books').send({
			title: 'Great success',
			author: 'Success guy',
			year: 20
		});

		expect(res.status).toEqual(500);
		expect(res.body).toEqual({});
		expect(res.text).toEqual('Internal Server Error');
	});
});
