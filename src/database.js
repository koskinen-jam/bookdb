const sqlite3 = require('better-sqlite3');

// Database wrapper with automated schema initialization.
class DB {
	// Open a database and set up the books table if not already there. 
	constructor(dbpath, options) {
		this.db = new sqlite3(dbpath, options);

		if (this.hasBooksTable()) {
			return;
		}

		this.run(`
			CREATE TABLE books (
				id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
				title TEXT NOT NULL CHECK (length(title) > 0),
				author TEXT NOT NULL CHECK (length(author) > 0),
				year INTEGER NOT NULL,
				publisher TEXT,
				description TEXT,
				UNIQUE (title, author, year)
			)`
		);

	}

	// Return true if the books table exists
	hasBooksTable() {
		return this.fetchColumn(`
			SELECT 1
			FROM sqlite_schema
			WHERE type = 'table' AND name = 'books'`
		) ? true : false;
	}

	isOpen() {
		return this.db.open;
	}

	// Fetch all matching rows
	fetch(sql, params) {
		let stm = this.db.prepare(sql);
		return params === undefined ? stm.all() : stm.all(params);
	}

	// Fetch first matching row
	fetchRow(sql, params) {
		let stm = this.db.prepare(sql);
		return params === undefined ? stm.get() : stm.get(params);
	}

	// Fetch first column of first matching row
	fetchColumn(sql, params) {
		let stm = this.db.prepare(sql).pluck();
		return params === undefined ? stm.get() : stm.get(params);
	}

	// Execute a statement
	run(sql, params) {
		let stm = this.db.prepare(sql);
		return params === undefined ? stm.run() : stm.run(params);
	}

	// Execute SQL with multiple statements
	exec(sql) {
		this.db.exec(sql);
	}

	// Close connection
	close() {
		this.db.close();
	}
}

module.exports = { DB };

