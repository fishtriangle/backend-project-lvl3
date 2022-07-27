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

  getLink() {
    return this.link.href;
  }

  getFolderPath() {
    return this.folderPath;
  }

  getFileName() {
    return this.fileName;
  }

  getFilePath() {
    return this.pagePath;
  }

  download() {
    return axios.get(this.getLink());
  }

  checkForFolderToSave() {
    return readdir(this.getFolderPath());
  }

  writeToFile(html) {
    return writeFile(this.getFilePath(), html)
      .then(() => log('Successfully saved page to: ', this.getFilePath()));
  }
}

export default PageConfig;
