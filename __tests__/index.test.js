import path from 'path';
import { fileURLToPath } from 'url';
import { readFile as readFilePromise } from 'node:fs/promises';
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

import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => readFilePromise(getFixturePath(filename), 'utf-8');

const customSavePath = path.join(__dirname, '/var/tmp');
const defaultSavePath = process.cwd();
const pageURL = new URL('https://ru.hexlet.io/courses');
let baseHTML;

describe('download html file and save it locally', () => {
  beforeAll(async () => {
    nock.disableNetConnect();
    try {
      baseHTML = await readFixture('htmlToDownload.html');
    } catch (error) {
      console.log('Cannot load fixture file: htmlToDownload.html');
      throw new Error(error);
    }
  });

  beforeEach(() => {
    mock({
      [customSavePath]: {},
      [defaultSavePath]: {},
    });

    nock(/ru\.hexlet\.io/)
      .get(/\/courses/)
      .reply(200, baseHTML);
  });

  afterEach(() => {
    mock.restore();
  });

  test('default option', async () => {
    let returnedFilePath;
    let downloadedHTML;
    try {
      returnedFilePath = await pageLoader(pageURL.href);
    } catch (error) {
      console.log('Cannot execute pageLoader function');
      throw new Error(error);
    }

    try {
      downloadedHTML = await readFilePromise(returnedFilePath, 'utf-8');
    } catch (error) {
      console.log('Cannot read saved file');
      throw new Error(error);
    }

    expect(returnedFilePath).toBe(path.join(defaultSavePath, 'ru-hexlet-io-courses.html'));
    expect(downloadedHTML).toBe(baseHTML);
  });

  test('custom option', async () => {
    let returnedFilePath;
    let downloadedHTML;
    try {
      returnedFilePath = await pageLoader(pageURL.href, customSavePath);
    } catch (error) {
      console.log('Cannot execute pageLoader function');
      throw new Error(error);
    }

    try {
      downloadedHTML = await readFilePromise(returnedFilePath, 'utf-8');
    } catch (error) {
      console.log('Cannot read saved file');
      throw new Error(error);
    }

    expect(returnedFilePath).toBe(path.join(customSavePath, 'ru-hexlet-io-courses.html'));
    expect(downloadedHTML).toBe(baseHTML);
  });
});
