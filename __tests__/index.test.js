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
    baseHTML = await readFixture('htmlToDownload.html');
  });

  beforeEach(async () => {
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
    const returnedFilePath = await pageLoader(pageURL.href);
    const downloadedHTML = await readFilePromise(returnedFilePath, 'utf-8');

    expect(returnedFilePath).toBe(path.join(defaultSavePath, 'ru-hexlet-io-courses.html'));
    expect(downloadedHTML).toBe(baseHTML);
  });

  test('custom option', async () => {
    const returnedFilePath = await pageLoader(pageURL.href, customSavePath);
    expect(returnedFilePath).toBe(path.join(customSavePath, 'ru-hexlet-io-courses.html'));
    const downloadedHTML = await readFilePromise(returnedFilePath, 'utf-8');
    expect(downloadedHTML).toBe(baseHTML);
  });
});

//page-loader --output /mnt/c/repository/backend-project-lvl3/__tests__ https://ya.ru/
//page-loader https://ya.ru/
//page-loader --help
