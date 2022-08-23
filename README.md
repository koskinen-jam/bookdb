# bookdb

## Synopsis

Simple book database with an http API for adding, deleting and reading books.

## Requirements

  * NodeJS 16.17 or newer
  * Npm 8.18 or newer

## Installation and running

1. Clone this repo to installation directory.
```
~ $ git clone https://github.com/koskinen-jam/bookdb.git bookdb
```
2. Install dependencies.
```
~/bookdb $ npm install
```
3. Run server.
  * With npm lifecycle script:
```
~/bookdb $ npm run server
```
  * With node:
```
~/bookdb $ node src/main.js
```

## Tests

Unit tests have their own npm script:
```
~/bookdb $ npm test
```
