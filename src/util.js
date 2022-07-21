import debug from 'debug';

const module = 'page-loader: createFileName';
const log = debug(module);

function isLetterOrFigure(str) {
  return str.length === 1 && str.match(/[a-z]|\d/i);
}

const createFileName = (pageLink) => {
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
  log('Filename formed from ', pageLink, ' to ', fileName);
  return fileName;
};

export default createFileName;
