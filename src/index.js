import ParsedHTML from './parsedHTML.js';
import PageConfig from './pageConfig.js';
import FilesConfig from './filesConfig.js';

const loadPage = (url, option = process.cwd()) => {
  let parsedHTML;
  let files;

  const page = new PageConfig(url, option);
  // console.log('Option: ', option, '\n', 'FilePath: ', filePath);
  return page.download()
    .then((response) => response.data)
    .then((htmlCode) => {
      // console.log(htmlCode);
      parsedHTML = new ParsedHTML(htmlCode);
      files = new FilesConfig(parsedHTML.getFilesSrc(), page);
      return files.download();
    })
    .catch(() => console.log('WARNING!!! Error in downloading files!'))
    .then(() => {
      parsedHTML.setFilesSrc(files.getSrcsInLocalPage());
      // console.log(parsedHTML.toString());
      return page.writeToFile(parsedHTML.toString());
    })
    .catch(console.log)
    .then(() => page.getFilePath());
};

// console.log(loadPage('https://ya.ru'));

export default loadPage;
