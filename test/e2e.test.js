const fs = require('fs');

// Parse an example request-response into an object with case name, request and
// response strings
const requestResponseParser = (s) => {
	let lines = s.split("\n");

	let caseName = lines.shift().slice(2);

	let splitAt = lines.findIndex(ln => ln === '# Response');

	return {
		case: caseName,
		request: lines.slice(0, splitAt).join("\n"),
		response: lines.slice(splitAt + 1).join("\n"),
	};
};

const requestFile = 'test/requests.txt';

const cases = fs.readFileSync(requestFile, 'utf-8')
	.split(new RegExp(/\n##+\n\n/))
	.map(requestResponseParser);

test('Loaded test cases', () => { expect(cases.length).toBeGreaterThan(0); });
