const args = require('minimist')(process.argv.slice(2));

if (args.help) {
	console.log(`
Books api server

Usage

	node src/main.js [--port=<int>] [--database=<path>] [--help]

	or

	npm run server -- [--port=<int>] [--database=<path>] [--help]

Arguments

	port=<int>

		Set the port the server listens to on localhost. Default 9000.

	database=<path>

		Set the database file path. Default 'books.db'. Use ':memory:'
		for a temporary db.

	--help

		Print help and exit without further actions.
`);
	process.exit(0);
}

const port = args.port ?? 9000;

const dbpath = args.database ?? 'books.db';

if (dbpath.match(/^\/.*/) || dbpath.match(/\.\./)) {
	console.log('Database path must not start with "/" or contain "..".');
	process.exit(1);
}

const { DB } = require('./database.js');
const db = new DB(dbpath);
const app = require('./app.js').init(db);

const server = app.listen(port, () => console.log(`Listening at port ${port}.`));

process.on('exit', (code) => {
	console.log('Cleaning up.');
	server.close(() => {
		console.log('Stopped listening.');
	});
	db.close();
	console.log('Closed database.');
	console.log(`Exiting with code ${code}.`);
});
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

