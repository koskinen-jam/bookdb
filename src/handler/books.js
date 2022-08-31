/** Base handler class */
const { Handler } = require('../handler.js');

/** Validation helpers */
const validation = require('../validation.js');

/** Books handler paths */
const paths = {
	listAndCreate: '/books',
	readAndDelete: '/books/:id',
};

/**
 * Create a handler callback for GET /books(?params).
 * @param {DB} db - Database instance.
 */
const listBooks = (db) => {
	return (req, res) => {
		if (validation.isEmpty(req.query)) {
			let data = db.fetch('SELECT * FROM books');
			return res.status(200).json(data);
		}

		let params = {};
		for (let k in req.query) {
			if (! ['author', 'year', 'publisher'].includes(k)) {
				continue;
			}
			switch (k) {
				case 'author':
				case 'publisher':
					if (req.query[k].length < 1) {
						return res.sendStatus(400);
					}
					params[k] = req.query[k];
					break;
				case 'year':
					let y = validation.parseYear(req.query[k]);
					if (y === false) {
						return res.sendStatus(400);
					}
					params[k] = y;
					break;
				default:
					break;
			}
		}

		let filter = Object.keys(params)
			.map((k) => {
				if (k === 'year') {
					return `${k} = $${k}`;
				}
				return `lower(${k}) = lower($${k})`;
			})
			.join(' AND ');

		let sql = `SELECT * FROM books WHERE ${filter}`;

		let data = db.fetch(sql, params);

		return res.status(200).json(data);
	};
};

/**
 * Create a handler callback for POST /books.
 * @param {DB} db - Database instance.
 */
const createBook = (db) => {
	return (req, res) => {
		let newBook = {
			title: req.body.title ?? null,
			author: req.body.author ?? null,
			year: req.body.year ?? null,
			publisher: req.body.publisher ?? null,
			description: req.body.description ?? null,
		};

		if (newBook.year !== null) {
			newBook.year = validation.parseYear(newBook.year);
		}

		let saved;
		try {
			saved = db.run(`
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
				)`,
				newBook
			);
		} catch (err) {
			return res.sendStatus(400);
		}

		return res.status(200).json({
			id: saved.lastInsertRowid,
		});
	};
};

/**
 * Create a handler callback for GET /books/:id.
 * @param {DB} db - Database instance.
 */
const getBook = (db) => {
	return (req, res) => {
		let id = validation.parseId(req.params.id);

		if (id === false) {
			return res.sendStatus(404);
		}

		let book = db.fetchRow('SELECT * FROM books WHERE id = ?', id);
		if (! book) {
			return res.sendStatus(404);
		}

		return res.status(200).json(book);
	};
};

/**
 * Create a handler callback for DELETE /books/:id.
 * @param {DB} db - Database instance.
 */
const deleteBook = (db) => {
	return (req, res) => {
		let id = validation.parseId(req.params.id);

		if (id === false) {
			return res.sendStatus(404);
		}

		let found = db.fetchColumn('SELECT 1 FROM books WHERE id = ?', id);
		if (! found) {
			return res.sendStatus(404);
		}

		let result = db.run('DELETE FROM books WHERE id = ?', id);

		if (result.changes !== 1) {
			return res.sendStatus(500);
		}
		return res.sendStatus(204);
	};
};

/**
 * Initialize handlers for '/books' and '/books/:id' and apply them to an
 * express instance.
 * @param {express} app - Express instance.
 * @param {DB} db - Database instance.
 */
const init = (app, db) => {
	(new Handler(
		paths.listAndCreate,
		{
			get: listBooks(db),
			post: createBook(db),
		}
	)).registerPaths(app);

	(new Handler(
		paths.readAndDelete,
		{
			get: getBook(db),
			delete: deleteBook(db),
		}
	)).registerPaths(app);
};

/**
 * Books handler
 * @exports BooksHandler
 */
module.exports.init = init;
