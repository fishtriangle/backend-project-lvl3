import path from 'path';
import { fileURLToPath } from 'url';
import { readFile as readFilePromise, chmod } from 'node:fs/promises';
import {
  test,
  expect,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
} from '@jest/globals';
import mock from 'mock-fs';
import nock from 'nock';
import { minify } from 'html-minifier';

import loadPage from '../src/index.js';
import minifyConfig from '../__fixtures__/minifyConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => readFilePromise(getFixturePath(filename), 'utf-8');
const readFile = (filepath) => readFilePromise(filepath, 'utf-8');

const pageURL = new URL('https://ru.hexlet.io/courses');

const testModes = [
  {
    name: 'defaultSavePath',
    pathToSave: process.cwd(),
    testingArgs: [pageURL.href],
  },
  {
    name: 'customSavePath',
    pathToSave: path.join(__dirname, '/var/tmp'),
    testingArgs: [pageURL.href, path.join(__dirname, '/var/tmp')],
  },
];

const networkErrors = [
  ['Error: 400 - Bad Request', 400],
  ['Error: 403 - Forbidden', 403],
  ['Error: 404 - Not Found', 404],
  ['Error: 410 - Gone', 410],
  ['Error: 500 - Internal Server Error', 500],
  ['Error: 503 - Service Unavailable', 503],
];

let page;
let testingFiles;

describe('download html file and save it locally', () => {
  beforeAll(async () => {
    nock.cleanAll();
    nock.disableNetConnect();

    page = {
      basePage: {

        url: /\/courses/,
        content: await readFixture('htmlToDownload.html'),
      },
      downloadedPage: {
        content: null,
        baseContent: await readFixture('htmlAfterDownload.html'),
      },
    };

    testingFiles = {
      img: {
        url: /\/assets\/professions\/nodejs\.png/,
        filepath: path.join('ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png'),
        baseContent: await readFixture('assets/nodejs.png'),
      },
      css: {
        url: /\/assets\/application\.css/,
        filepath: path.join('ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css'),
        baseContent: await readFixture('assets/application.css'),
      },
      js: {
        url: /\/packs\/js\/runtime\.js/,
        filepath: path.join('ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js'),
        baseContent: await readFixture('assets/runtime.js'),
      },
    };
  });

  beforeEach(() => {
    testModes.forEach(({ pathToSave }) => {
      mock({
        [pathToSave]: {},
      });
    });

    nock(pageURL.origin)
      .get(pageURL.pathname)
      .twice()
      .reply(200, page.basePage.content);

    Object.keys(testingFiles).forEach((key) => {
      nock(pageURL.origin)
        .get(testingFiles[key].url)
        .reply(200, testingFiles[key].baseContent);
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test.each(testModes)('Save page and files with $name', async ({ pathToSave, testingArgs }) => {
    mock({
      [pathToSave]: {},
      [path.resolve(__dirname, '../node_modules')]: mock.load(path.resolve(__dirname, '../node_modules')),
    });

    page.downloadedPage.path = await loadPage(...testingArgs);

    try {
      page.downloadedPage.content = await readFile(page.downloadedPage.path);
    } catch (error) {
      console.log('Cannot read saved page');
      throw new Error(error);
    }

    expect(page.downloadedPage.path).toBe(path.join(pathToSave, 'ru-hexlet-io-courses.html'));
    expect(minify(page.downloadedPage.content, minifyConfig))
      .toBe(minify(page.downloadedPage.baseContent, minifyConfig));

    const typeOfFiles = Object.keys(testingFiles);

    const promise = Promise.all(typeOfFiles
      .map((filetype) => readFile(path.join(pathToSave, testingFiles[filetype].filepath))));

    (await promise).forEach((content, index) => {
      testingFiles[typeOfFiles[index]].content = content;
      expect(testingFiles[typeOfFiles[index]].content)
        .toBe(testingFiles[typeOfFiles[index]].baseContent);
    });
  });
});

describe('file system error handling', () => {
  beforeAll(() => {
    nock.cleanAll();
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock(pageURL.origin)
      .get(pageURL.pathname)
      .twice()
      .reply(200, page.basePage.content);
  });

  afterEach(async () => {
    mock.restore();
  });

  test('no folder to save', async () => {
    mock({
      [__dirname]: {},
      [path.resolve(__dirname, '../node_modules')]: mock.load(path.resolve(__dirname, '../node_modules')),
    });
    await expect(loadPage(pageURL.href, path.join(__dirname, '/var/tmp'))).rejects.toThrow(/ENOENT/);
  });

  test('no access to folder to save', async () => {
    mock({
      [path.join(__dirname, '/var/tmp')]: {},
      [path.resolve(__dirname, '../node_modules')]: mock.load(path.resolve(__dirname, '../node_modules')),
    });

    await chmod(path.join(__dirname, '/var/tmp'), 0);
    await expect(loadPage(pageURL.href, path.join(__dirname, '/var/tmp'))).rejects.toThrow(/EACCES/);
  });
});

describe('network error handling', () => {
  beforeAll(() => {
    nock.cleanAll();
    nock.disableNetConnect();
  });

  beforeEach(() => {
    mock({
      [path.join(__dirname, '/var/tmp')]: {},
      [path.resolve(__dirname, '../node_modules')]: mock.load(path.resolve(__dirname, '../node_modules')),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test.each(networkErrors)('%s', async (errorName, errorCode) => {
    nock(pageURL.origin).get(pageURL.pathname).reply(errorCode);
    await expect(loadPage(pageURL.href, path.join(__dirname, '/var/tmp'))).rejects.toThrow(new RegExp(errorCode));
  });
});
