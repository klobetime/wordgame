# Word Game

Simple word guessing game. A basic template project for using Node, TypeScript, and Jest.

## Environment

### Prerequisites

Check for proper versions of [NodeJS](https://nodejs.org/en/) (currently v16.x) and [NPM](https://www.npmjs.com/) (currently v8.x):

```bash
$ node --version

$ npm --v
```

A useful tool when moving between projects with different versions of node is [nvm](https://github.com/nvm-sh/nvm). A supporting `.nvmrc` file is a part of the project.

### Dependencies

To download the modules needed to develop and build simply run the following from the main directory where the `package.json` file lives:
```bash
$ npm install
```

This normally only has to be done when dependencies are added or updated.

<!---
Research this a bit more and add instructions about what to install in prod and what not to...
For a production build (avoid installing test and optional dependencies) use:
```bash
npm install --only=production --no-optional
```
Or do I really care about this?
-->

## Development

### Building

To translate the TypeScript code (`*.ts`) into executable JavaScript (`*.js`), use:
```bash
$ npm run build
```

When successful the resulting JavaScript will be in the `build` directory.

### Cleaning

It is often useful to get rid of generated files during the development process. Normally, it's no big deal to partially recompile -- to only recompile the changed files -- but to be absolutely safe there is a set of npm targets that can remove intermediate files.
* _tidy_ Deletes the `coverage` directory (containing code coverage reports generated during testing) and the `build/*.tsbuildinfo` (cache used by TypeScript to speed up compiling) files.
* _clean_ Removes all generated files from building, but leaves the downloaded modules in place by deleting the `coverage` and `build` directories.
* _distclean_ Resets to a fresh checkout by deleting the `coverage`, `build`, and `node_modules` directories.
```bash
$ npm run clean
```

### Testing

This template uses [Jest](https://facebook.github.io/jest/), [CSpell](https://github.com/streetsidesoftware/cspell), [Prettier](https://prettier.io/), and [ESLint](https://eslint.org/) to handle test and code quality tasks.

To execute all `*.ts` tests in the `tests` directory, as well as run a spell checker and lint the source:
```bash
$ npm test
```

To just run the tests and coverage report, skipping the other useful tools (which must all pass cleanly before committing anything!), use:
```bash
$ npm run test:unit
```

#### Test Coverage

Test coverage will be calculated with each run of the test suite. If coverage falls below 95% the test run will fail.

#### Linting

All projects should cleanly pass linting (both eslint and prettier) before a commit.

#### Spelling

A spell checker runs as a part of the normal testing target. When the tool flags words that are appropriate for the project but not a part of the configured dictionaries, they should be added to the `src/project-dictionary.txt` file.

## Execution

After building the game may be executed by running:
```bash
$ npm start
```
