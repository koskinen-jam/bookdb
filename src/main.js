/**
 * Book database server
 */

/** Command-line arguments */
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

/** Api port on localhost */
const port = args.port ?? 9000;

/** Database file path */
const dbpath = args.database ?? 'books.db';

if (dbpath.match(/^\/.*/) || dbpath.match(/\.\./)) {
	console.log('Database path must not start with "/" or contain "..".');
	process.exit(1);
}

/** Database class */
const { DB } = require('./database.js');

/** Database instance */
const db = new DB(dbpath);

/** Application instance */
const app = require('./app.js').init(db);

/** Active server instance */
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

