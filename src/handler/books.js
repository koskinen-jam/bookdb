// Handlers for /books and /books/{id}.
// 
// Exports function init(app, database) that creates aforementioned handlers
// using given database as data source and registers them to an express instance.
/** Base handler class */
const { Handler } = require('../handler.js');

/**
 * Parse an integer id from a string.
 * @param {string} str
 * @return {(boolean|number)} false if unable to parse, parsed number otherwise.
 */
const parseId = (str) => {
	if (! str.match(/^\d+(|\.0+)$/)) {
		return false;
	}
	let id = parseInt(str);
	if (! id || id === 'NaN') {
		return false;
	}
	return id;
};

/**
 * Parse an integer year from a string.
 * @param {string} str
 * @return {(boolean|number)} false if unable to parse, parsed number otherwise.
 */
const parseYear = (str) => {
	if (! str.match(/^-?\d+(|\.0+)$/)) {
		return false;
	}
	let year = parseInt(str);
	if (year === 'NaN') {
		return false;
	}
	return year;
};

/**
 * Check if an object is empty
 * @param {object} obj
 * @return {boolean} true if object has no keys.
 */
const isEmpty = (obj) => {
	for (let key in obj) {
		return false;
	}
	return true;
};

/** Path of list/post books actions */
const noIdPath = '/books';

/** Create list/search and post action handlers */
const noIdCallbacks = (db) => {
	return {
		/** List or search books */
		get: (req, res) => {
			if (isEmpty(req.query)) {
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
						let y = parseYear(req.query[k]);
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
		},

		/** Create a book */
		post: (req, res) => {
			let newBook = {
				title: req.body.title ?? null,
				author: req.body.author ?? null,
				year: parseInt(req.body.year ?? null),
				publisher: req.body.publisher ?? null,
				description: req.body.description ?? null,
			};

			let saved;
			try {
				saved = db.run('INSERT INTO books (title, author, year, publisher, description) VALUES ($title, $author, $year, $publisher, $description)', newBook);
			} catch (err) {
				return res.sendStatus(400);
			}

			return res.status(200).json({
				id: saved.lastInsertRowid,
			});
		},
	};
};

/** Route of get/delete single book by id */
const pathWithId = '/books/:id';

/**
 * Create resolver callbacks for getting and deleting a single book
 * @param {DB} db - Database instance
 */
const callbacksWithId = (db) => {
	return {
		/** Return a single book by id */
		get: (req, res) => {
			let id = parseId(req.params.id);

			if (id === false) {
				return res.sendStatus(404);
			}

			let book = db.fetchRow('SELECT * FROM books WHERE id = ?', id);
			if (! book) {
				return res.sendStatus(404);
			}

			return res.status(200).json(book);
		},

		/** Delete a book by id */
		delete: (req, res) => {
			let id = parseId(req.params.id);

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
		}
	};
};


/**
 * Initialize handlers for '/books' and '/books/:id' and apply them to an
 * express instance.
 * @param {express} app - Express instance.
 * @param {DB} db - Database instance.
 */
const init = (app, db) => {
	(new Handler(noIdPath, noIdCallbacks(db))).registerPaths(app);
	(new Handler(pathWithId, callbacksWithId(db))).registerPaths(app);
}

module.exports.init = init;
