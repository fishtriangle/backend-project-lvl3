import ParsedHTML from './parsedHTML.js';
import PageConfig from './pageConfig.js';
import ImagesConfig from './imagesConfig.js';

const loadPage = (url, option = process.cwd()) => {
  let parsedHTML;
  let images;

  const page = new PageConfig(url, option);
  // console.log('Option: ', option, '\n', 'FilePath: ', filePath);
  return page.download()
    .then((response) => response.data)
    .then((htmlCode) => {
      parsedHTML = new ParsedHTML(htmlCode);
      images = new ImagesConfig(parsedHTML.getImagesSrc(), page);
      return images.download();
    })
    .then(() => {
      parsedHTML.setImagesSrc(images.getLocalSrc());
      return page.writeToFile(parsedHTML.toString());
    })
    .catch(console.log)
    .then(() => page.getFilePath());
};

// console.log(loadPage('https://ya.ru'));

export default loadPage;
