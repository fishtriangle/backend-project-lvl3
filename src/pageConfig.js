import Path from 'path';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';

function isLetterOrFigure(str) {
  return str.length === 1 && str.match(/[a-z]|\d/i);
}

export const createFileName = (pageLink) => {
  // console.log(pageLink);
  const url = new URL(pageLink);
  const protocolLength = url.protocol.length + 2;
  const fileName = url.href
    .slice(protocolLength, url.href[url.href.length - 1] !== '/' ? url.href.length : -1)
    .split('')
    .map((symbol) => {
      const changedSymbol = isLetterOrFigure(symbol) ? symbol : '-';
      return changedSymbol;
    })
    .join('');
  return fileName;
};

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

  download = () => axios.get(this.getLink()).catch(console.log);

  writeToFile = (html) => writeFile(this.getFilePath(), html);
}

export default PageConfig;
