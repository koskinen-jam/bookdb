# bookdb

## Synopsis

Simple book database with an http API for adding, deleting and reading books.

## Requirements

  * NodeJS 16.17 or newer
  * Npm 8.18 or newer

## Installation

Create desired installation directory if it does not exist, and cd into it.
The following commands should be run in the installation directory.

Clone this repo to installation directory.
```
git clone https://github.com/koskinen-jam/bookdb.git .
```

Install dependencies.
```
npm install
```

## Usage

Start server with npm.
```
npm run server
```

Run unit tests with npm.
```
npm test
```

List available options.
```
npm run server -- --help
```

## Known issues

* API sends a templated HTML response when request body contains invalid JSON, although HTTP code is correct. Happens when querying the live API using curl, tests appear unaffected. Response contains a stacktrace unless server is started in production mode with `NODE_ENV=production npm run server`.
  * Applying rudimentary error-handling middleware had no apparent effect, though there is a high chance it was not applied correctly.
