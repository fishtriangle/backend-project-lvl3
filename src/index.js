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

  return page.checkForFolderToSave()
    .then(() => page.download())
    .catch((error) => {
      throw error;
    })
    .then((response) => response.data)
    .then((htmlCode) => {
      parsedHTML = new ParsedHTML(htmlCode);
      log('Sources to download: ', parsedHTML.getFilesSrc());
      files = new FilesConfig(parsedHTML.getFilesSrc(), page);
      return files.download();
    })
    .catch((error) => {
      if (error.isAxiosError) {
        console.error(`WARNING!!! Download error. ${error.message} ${error.code}`);
      } else if (error.code) {
        console.error(error.message);
      }
      throw error;
    })
    .then(() => {
      log('Paths of files that were replaced: ', files.getSrcsInLocalPage());
      parsedHTML.setFilesSrc(files.getSrcsInLocalPage());
      return page.writeToFile(parsedHTML.toString());
    })
    .then(() => {
      log('End of app\n');
      return page.getFilePath();
    })
    .catch((error) => {
      throw error;
    });
};

export default loadPage;
