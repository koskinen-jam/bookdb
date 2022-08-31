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
	if (str === null || str === undefined) {
		return false;
	}
	if (typeof str === 'number') {
		if (Math.floor(str) === str) {
			return Math.floor(str);
		}
		return false;
	}
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

/**
 * Validation helpers
 * @exports validation
 */
module.exports = {
	parseId: parseId,
	parseYear: parseYear,
	isEmpty: isEmpty,
};
