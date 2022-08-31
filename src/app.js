/**
 * Main app module.
 */

const express = require('express');
const app = express();

app.use(express.json());

// Handle JSON parsing errors here
app.use(function (err, req, res, next) {
	if (err.type === 'entity.parse.failed') {
		res.sendStatus(400);
	} else {
		res.sendStatus(500);
	}
});

const BooksHandler = require('./handler/books.js');

/**
 * Initialize the app, using given database as data source.
 * @param {DB} database - Database instance
 * @return {express} Express instance with routes set up.
 */
module.exports.init = (database) => {
	BooksHandler.init(app, database);
	
	return app;
}

/**
 * Express instance created by module
 */
module.exports.app = app;

