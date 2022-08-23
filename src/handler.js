/**
 * Handler module.
 * @exports Handler
 */

/** HTTP methods that resolver callbacks can be defined for */
const configurableMethods = [
	'get',
	'post',
	'delete',
];

/** Class containing resolver callbacks for various HTTP methods of a single route. */
class Handler {
	/**
	 * Create a handler.
	 * @param {string} path - Path this handler handles, e.g. '/books'.
	 * @param {object} callbacks - HTTP methods as keys, resolver callbacks as values.
	 */
	constructor(path, callbacks) {
		if (path.length === 0) {
			throw new Error('Handler path must not be empty.');
		}

		if (path.slice(0, 1) !== '/') {
			throw new Error('Handler path must begin with "/".');
		}

		this.path = path;

		if (callbacks === null || typeof callbacks !== 'object') {
			throw new Error('callbacks must be a non-null object');
		}

		for (let k in callbacks) {
			if (! configurableMethods.includes(k)) {
				throw new Error(`${k} is not a configurable method`);
			}
			if (typeof callbacks[k] !== 'function') {
				throw new Error(`${k} in callbacks is not a function.`);
			}
		}

		this.callbacks = callbacks;
	}

	/**
	 * Set resolver callbacks in app for the route and methods defined in this handler.
	 * @param {express} app - express instance to bind resolvers to.
	 */
	registerPaths(app) {
		for (let k in this.callbacks) {
			let cb = this.callbacks[k];

			switch (k) {
				case 'get':
					app.get(this.path, cb);
					break;

				case 'post':
					app.post(this.path, cb);
					break;

				case 'delete':
					app.delete(this.path, cb);
					break;

				default:
					break;
			}
		}
	}
}

module.exports = { Handler };
