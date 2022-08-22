// Exports Handler class

const configurableMethods = [
	'get',
	'post',
	'delete',
];

class Handler {
	// Create a new handler.
	//
	// - path is the route this handles, e.g. '/books'
	// - callbacks is an object containing handler methods under corresponding
	//   http method names as keys
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

	// Use this handlers callbacks to resolve requests with corresponding methods
	// for this handlers path in given express instance.
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
