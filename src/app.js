const express = require('express');
const app = express();
const BooksHandler = require('./handler/books.js');

module.exports.init = (database) => {
	BooksHandler.init(app, database);
	return app;
}

app.use(express.json())

module.exports.app = app;

