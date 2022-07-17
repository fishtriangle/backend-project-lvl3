import Path from 'path';
import axios from 'axios';
import { writeFile } from 'node:fs/promises';

function isLetterOrFigure(str) {
  return str.length === 1 && str.match(/[a-z]|\d/i);
}

export const createFileName = (pageLink) => {
  console.log(pageLink);
  const protocolLength = pageLink.protocol.length + 2;
  const fileName = pageLink.href
    .slice(protocolLength, pageLink.href[pageLink.href.length - 1] !== '/' ? pageLink.href.length : -1)
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
    this.folderPath = option;
    this.fileName = `${createFileName(this.link)}.html`;
    this.filePath = Path.join(this.folderPath, this.fileName);
  }

  getLink = () => this.link;

  getFolderPath = () => this.folderPath;

  getFileName = () => this.fileName;

  getFilePath = () => this.filePath;

  download = () => axios.get(this.getLink().href).catch(console.log);

  writeToFile = (html) => writeFile(this.getFilePath(), html);
}

export default PageConfig;
