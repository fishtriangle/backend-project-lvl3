page-loader:
	node bin/pageLoader.js

install: install-deps
	npx simple-git-hooks

install-deps:
	npm ci

debug:
	npm run test:debug

debug-all:
	npm run test:debug-all

debug-axios:
	npm run test:debug-axios

debug-nock:
	npm run test:debug-nock

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish --dry-run

