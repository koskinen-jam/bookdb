const fs = require('fs');

// Parse an example request-response into an object with case name, request and
// response strings
//
// --------------Example:---------
// # Post a new book
// POST http://localhost:9000/books
// Content-Type: application/json
//
// {
//         "title": "Harry Potter and the Philosophers Stone",
//         "author": "J.K. Rowling",
//         "year": 1997,
//         "publisher": "Bloomsbury (UK)",
//         "description": "A book about a wizard boy"
// }
//
//
// # Response
// 200 OK
//
// {
//         "id": 1
// }
//
// -----------/Example-----------

const requestResponseParser = (s) => {
	let r = {
		case: '',
		request: {},
		response: {},
	};
	let lines = s.split("\n");

	// Test case name
	r.case = lines.shift().slice(2);

	// Split off request parts
	let splitIdx = lines.findIndex(ln => ln === '# Response');
	let request = lines.splice(0, splitIdx - 1);
	let headers = {};
	let line;

	// Request HTTP method, URL and headers:
	// Separated from body / response by empty line
	while ((line = request.shift())) {
		let parts = line.split(' ');
		if (['GET', 'POST', 'DELETE'].includes(parts[0])) {
			r.request.method = parts[0];
			r.request.uri = parts[1];
			r.request.path = parts[1].replace('http://localhost:9000', '');
			continue;
		}

		headers[parts[0].replace(':', '')] = parts[1];
	}
	r.request.headers = headers;

	// Request body
	try {
		r.request.body = JSON.parse(request.join("\n"));
	} catch (e) {
		// include unparseable JSON bodies as strings
		r.request.body = request.join("\n");
	}

	// discard whitespace and '# Response'
	let response = lines.splice(2);

	// Response code and message
	line = response.shift();

	let m = line.match(/^(\d{3}) (.*)$/);

	r.response.status = parseInt(m[1]);
	r.response.message = m[2];

	// Response body
	try {
		r.response.body = JSON.parse(response.join("\n"));
	} catch (e) {
		// Something along the way turns empty response bodies into
		// empty objects, so let's expect that if we fail to parse.
		r.response.body = {};
	}

	return r;
};

// Parse example requests
const requestFile = 'test/requests.txt';

const cases = fs.readFileSync(requestFile, 'utf-8')
	.split(new RegExp(/\n##+\n\n/))
	.map(requestResponseParser);

test('Loaded test cases', () => { expect(cases.length).toBeGreaterThan(0); });

// Test server responses
const request = require('supertest');

jest.setTimeout(1000);

const { DB } = require('../src/database.js');
const db = new DB(':memory:');

const app = require('../src/app.js').init(db);

describe('Request-response sequence', () => {
	for (let c of cases) {
		test(c.case, async () => {
			let res;
			switch (c.request.method) {
				case 'DELETE':
					res = await request(app).delete(c.request.path);
					break;
				case 'GET':
					res = await request(app).get(c.request.path);
					break;
				case 'POST':
					res = await request(app)
						.post(c.request.path)
						.set(
							'Content-Type',
							c.request.headers['Content-Type']
						)
						.send(c.request.body);
					break;
				default:
					break;
			}

			expect(res.status).toEqual(c.response.status);
			expect(res.body).toEqual(c.response.body);
		});
	}
});
