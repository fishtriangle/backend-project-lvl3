import axios from 'axios';
import path from 'path';
import { writeFile } from 'node:fs/promises';

function isLetterOrFigure(str) {
  return str.length === 1 && str.match(/[a-z]|\d/i);
}

const createFileName = (url) => {
  const pageLink = new URL(url);

  const protocolLength = pageLink.protocol.length + 2;
  const fileName = pageLink.href
    .slice(protocolLength, pageLink.href[pageLink.href.length - 1] !== '/' ? pageLink.href.length : -1)
    .split('')
    .map((symbol) => {
      const changedSymbol = isLetterOrFigure(symbol) ? symbol : '-';
      return changedSymbol;
    })
    .concat(['.html'])
    .join('');
  return fileName;
};

const downloadPage = (url) => axios.get(url).catch(console.log);

const pageLoader = (url, option = process.cwd()) => {
  const fileName = createFileName(url);
  const filePath = path.join(option, fileName);
  // console.log('Option: ', option, '\n', 'FilePath: ', filePath);
  return downloadPage(url)
    .then((response) => response.data)
    .then((htmlCode) => writeFile(filePath, htmlCode))
    .catch(console.log)
    .then(() => filePath);
};

// console.log(pageLoader('https://ya.ru'));

export default pageLoader;
