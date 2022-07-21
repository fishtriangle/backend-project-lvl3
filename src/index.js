import debug from 'debug';
import ParsedHTML from './parsedHTML.js';
import PageConfig from './pageConfig.js';
import FilesConfig from './filesConfig.js';

const app = 'page-loader';
const log = debug(app);

const loadPage = (url, option = process.cwd()) => {
  let parsedHTML;
  let files;

  const page = new PageConfig(url, option);
  log('Target page: ', url, '   ', 'Download path: ', option);

  return page.download()
    .then((response) => response.data)
    .then((htmlCode) => {
      parsedHTML = new ParsedHTML(htmlCode);
      log('Sources to download: ', parsedHTML.getFilesSrc());
      files = new FilesConfig(parsedHTML.getFilesSrc(), page);
      return files.download();
    })
    .catch((error) => log('WARNING!!! Error in downloading files!', '\n', error.message))
    .then(() => {
      log('Paths of files that should be downloaded: ', files.getSrcsInLocalPage());
      parsedHTML.setFilesSrc(files.getSrcsInLocalPage());
      return page.writeToFile(parsedHTML.toString());
    })
    .catch((error) => log('WARNING!!! Error in saving changed page!', '\n', error.message))
    .then(() => {
      log('End of app\n');
      return page.getFilePath();
    });
};

export default loadPage;
