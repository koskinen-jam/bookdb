const { DB } = require('./database.js');
const fs = require('fs');

const dbpath = '/tmp/test.db';

beforeAll(() => {
	try {
		if (fs.statSync(dbpath)) {
			fs.unlinkSync(dbpath);
		}
	} catch (err) {
		//
	}
});

afterAll(() => {
	try {
		if (fs.statSync(dbpath)) {
			fs.unlinkSync(dbpath);
		}
	} catch (err) {
		//
	}
});

describe('Database', () => {

	test('Initialized with books table', () => {
		let db = new DB(dbpath);

		expect(db.hasBooksTable()).toEqual(true);

		db.close();
	});

	const insertBook = `
		INSERT INTO books (
			title,
			author,
			year,
			publisher,
			description
		)
		VALUES (
			$title,
			$author,
			$year,
			$publisher,
			$description
		)`;

	let books = [
		{
			title: 'Fully qualified book',
			author: 'Famous Person',
			year: 2022,
			publisher: 'Big publish',
			description: 'Contains many things'
		},
		{
			title: 'Book with null fields',
			author: 'Some dude off the street',
			year: 0,
			publisher: null,
			description: null,
		},
	];

	for (let i in books) {
		test(`Added book ${books[i].title}`, () => {
			let db = new DB(dbpath);

			let res = db.run(insertBook, books[i]);

			expect(res).toEqual({
				changes: 1,
				lastInsertRowid: parseInt(i) + 1,
			});

			db.close();
		});
	}

	let cases = [
		[
			'Throws on duplicate book',
			books[0],
		],
		[
			'Throws on empty title',
			{
				title: '',
				author: 'Jerry',
				year: -50,
				publisher: null,
				description: null,
			},
		],
		[
			'Throws on empty author',
			{
				title: 'Foo',
				author: '',
				year: 999,
				publisher: null,
				description: null,
			},
		],
	];

	for (let testcase of cases) {
		test(testcase[0], () => {
			expect(() => {
				let db = new DB(dbpath);
				db.run(insertBook, testcase[1]);
				db.close();
			}).toThrow();
		});
	}
});
