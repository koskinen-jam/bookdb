/**
 * Book database wrapper
 */

/** Database interface */
const sqlite3 = require('better-sqlite3');

/**
 * Class with book database schema handling and convenience methods for
 * SQL queries.
 */
class DB {
	/**
	 * Create a database instance, creating a books table if it does not exist.
	 * @param {string} dbpath - Database file path
	 * @param {object} options - sqlite3 constructor options
	 */
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

	/**
	 * Check if books table exists.
	 * @return {boolean} True if table exists.
	 */
	hasBooksTable() {
		return this.fetchColumn(`
			SELECT 1
			FROM sqlite_schema
			WHERE type = 'table' AND name = 'books'`
		) ? true : false;
	}

	/**
	 * Check if database is open.
	 * @return {boolean} True if open.
	 */
	isOpen() {
		return this.db.open;
	}

	/**
	 * Run a query returning all the result rows.
	 * @param {string} sql - Query SQL
	 * @param {object} params - Bind values
	 * @return {array}
	 */
	fetch(sql, params) {
		let stm = this.db.prepare(sql);
		return params === undefined ? stm.all() : stm.all(params);
	}

	/**
	 * Run a query returning a single row.
	 * @param {string} sql - Query SQL
	 * @param {object} params - Bind values
	 * @return {object}
	 */
	fetchRow(sql, params) {
		let stm = this.db.prepare(sql);
		return params === undefined ? stm.get() : stm.get(params);
	}

	/**
	 * Run a query returning the first column of the first row.
	 * @param {string} sql - Query SQL
	 * @param {object} params - Bind values
	 * @return {(number|boolean|string)} 
	 */
	fetchColumn(sql, params) {
		let stm = this.db.prepare(sql).pluck();
		return params === undefined ? stm.get() : stm.get(params);
	}

	/**
	 * Run a query returning an object with number of affected rows
	 * in 'changes' and id of last inserted row in 'lastInsertRowid'
	 * @param {string} sql - Query SQL
	 * @param {object} params - Bind values
	 * @return {object} 
	 */
	run(sql, params) {
		let stm = this.db.prepare(sql);
		return params === undefined ? stm.run() : stm.run(params);
	}

	/**
	 * Run multiple sql queries in one string.
	 * @param {string} sql - Query SQL
	 */
	exec(sql) {
		this.db.exec(sql);
	}

	/**
	 * Close database
	 */
	close() {
		this.db.close();
	}
}

module.exports = { DB };

