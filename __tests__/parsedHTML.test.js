import {
  beforeAll,
  describe,
  expect,
  test,
} from '@jest/globals';
import { minify } from 'html-minifier';
import { fileURLToPath } from 'url';
import path from 'path';
import { readFile as readFilePromise } from 'node:fs/promises';
import ParsedHTML from '../src/parsedHTML.js';
import minifyConfig from '../__fixtures__/minifyConfig.js';

let basePage;
let changedPage;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => readFilePromise(getFixturePath(filename), 'utf-8');

const baseHTMLSrcs = [
  'https://cdn2.hexlet.io/assets/menu.css',
  '/assets/application.css',
  '/courses',
  '/assets/professions/nodejs.png',
  'https://js.stripe.com/v3/',
  'https://ru.hexlet.io/packs/js/runtime.js',
];

const localHTMLSrcs = [
  'https://cdn2.hexlet.io/assets/menu.css',
  'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
  'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  'https://js.stripe.com/v3/',
  'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
];

describe('parse HTML', () => {
  beforeAll(async () => {
    try {
      basePage = await readFixture('htmlToDownload.html');
    } catch (error) {
      console.log('Cannot load fixture file: htmlToDownload.html');
      throw new Error(error);
    }
    try {
      changedPage = await readFixture('htmlAfterDownload.html');
    } catch (error) {
      console.log('Cannot load fixture file: htmlAfterDownload.html');
      throw new Error(error);
    }
  });

  test('create HTML, getImgSrcs, setImgSrc, get changed HTML', () => {
    const html = new ParsedHTML(basePage);
    expect(minify(html.toString(), minifyConfig)).toBe(minify(basePage, minifyConfig));
    const filesSrcs = html.getFilesSrc();
    expect(filesSrcs).toEqual(baseHTMLSrcs);
    html.setFilesSrc(localHTMLSrcs);
    expect(minify(html.toString(), minifyConfig)).toBe(minify(changedPage, minifyConfig));
  });
});
