const express = require('express');

const app = express();

app.use(express.json())

const port = 9000;

let b = [];

app.get('/books', (req, res) => {
	let got = {
		message: 'Here be books',
		books: [],
	};
	return res.status(200).json(got);
});

app.post('/books', (req, res) => {
	b.push(req.body);
	return res.status(200).json({
		id: b.length
		
	});
});

module.exports = app;

