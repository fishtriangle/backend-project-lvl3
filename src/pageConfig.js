import Path from 'path';
import axios from 'axios';
import 'axios-debug-log';
import { writeFile, readdir } from 'node:fs/promises';
import debug from 'debug';
import createFileName from './util.js';

const module = 'page-loader: pageConfig';
const log = debug(module);

class PageConfig {
  constructor(url, option) {
    this.link = new URL(url);
    this.folderPath = Path.resolve(option);
    this.fileName = `${createFileName(this.getLink())}.html`;
    this.pagePath = Path.join(this.folderPath, this.fileName);
  }

  getLink = () => this.link.href;

  getFolderPath = () => this.folderPath;

  getFileName = () => this.fileName;

  getFilePath = () => this.pagePath;

  download = () => axios.get(this.getLink());

  checkForFolderToSave = () => readdir(this.getFolderPath()).then(console.log);

  writeToFile = (html) => writeFile(this.getFilePath(), html)
    .then(() => log('Successfully saved page to: ', this.getFilePath()));
}

export default PageConfig;
