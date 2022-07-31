import debug from 'debug';
import Path from 'path';
import axios from 'axios';
import _ from 'lodash';
import Listr from 'listr';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { load } from 'cheerio';
import createFileName from './util.js';

const app = 'page-loader';
const log = debug(app);
const fileTagsAsset = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const getFilesSrc = (htmlCode) => {
  const $ = load(htmlCode);
  const srcs = [];
  Object.keys(fileTagsAsset).forEach((fileTag) => {
    $(fileTag).each((index, tag) => {
      srcs.push($(tag).attr(fileTagsAsset[fileTag]));
    });
  });

  return srcs;
};

const setFilesSrc = (htmlCode, newPaths) => {
  const $ = load(htmlCode);
  let counter = 0;
  Object.entries(fileTagsAsset).forEach(([fileTag, attribute]) => {
    $(fileTag).attr(attribute, (index, fileSrc) => {
      if (fileSrc) {
        const replacedFileSrc = fileSrc.replace(fileSrc, newPaths[counter]);
        counter += 1;
        return replacedFileSrc;
      }
      return fileSrc;
    });
  });
  return $.html();
};

const createFilesLinks = (webSrcs, pageLink, pageName, folderPath) => {
  const pathsToSave = [];
  const linksToDownload = [];

  const { origin } = pageLink;

  const makeLocalSrc = (absoluteWebSrc) => {
    const filesFolderName = `${pageName.slice(0, -5)}_files`;
    let type;
    let srcShort;
    if (absoluteWebSrc.match(/.*\/.*\..{1,4}$/)) {
      const cuttedSrc = absoluteWebSrc.split('.');
      type = _.last(cuttedSrc);
      srcShort = _.without(cuttedSrc, type).join('.');
    } else {
      type = 'html';
      srcShort = absoluteWebSrc;
    }
    const fileName = `${createFileName(srcShort)}.${type}`;
    return Path.join(filesFolderName, fileName);
  };

  const srcsInLocalPage = webSrcs.map((src) => {
    const absoluteLink = new URL(src, origin);
    if (absoluteLink.href === src && origin !== absoluteLink.origin) {
      return src;
    }
    linksToDownload.push(absoluteLink);
    const localSrc = makeLocalSrc(absoluteLink.href);
    pathsToSave.push(Path.join(folderPath, localSrc));
    return localSrc;
  });

  return {
    pathsToSave,
    linksToDownload,
    srcsInLocalPage,
  };
};

const downloadFiles = (links, savePaths) => {
  const filesToDownload = links.map((src, index) => ({
    title: src.href,
    task: () => axios.get(src.href, { responseType: 'stream' })
      .then((response) => {
        const { data } = response;
        log(`Save to this path ${savePaths[index]} \n ${data}`);
        return writeFile(savePaths[index], data)
          .then(() => log('Successfully saved file', savePaths[index]));
      }),
  }));

  const tasks = new Listr(filesToDownload, { concurrent: true, exitOnError: false });

  return mkdir(Path.dirname(savePaths[0]), { recursive: true })
    .then(() => tasks.run())
    .catch((error) => log(error.message));
};

const loadPage = (url, option = process.cwd()) => {
  let filesLinks;
  let html;

  const link = new URL(url);
  const folderPath = Path.resolve(option);
  const pageName = `${createFileName(link.href)}.html`;
  const pageLocalPath = Path.join(folderPath, pageName);

  log('Target page: ', url, '   ', 'Download path: ', option);

  //  Check the existence of download folder
  return readdir(folderPath)
    .then(() => axios.get(link.href))
    //  Save all resources mentioned in html to the localstorage
    .then((response) => {
      html = response.data;
      const webSrcs = getFilesSrc(html, link);

      log('Sources to download: ', webSrcs);

      filesLinks = createFilesLinks(webSrcs, link, pageName, folderPath);
      return downloadFiles(filesLinks.linksToDownload, filesLinks.pathsToSave);
    })
    //  Change html and save it
    .then(() => {
      log('Paths of files that were replaced: ', filesLinks.srcsInLocalPage);

      const changedHTML = setFilesSrc(html, filesLinks.srcsInLocalPage);
      return writeFile(pageLocalPath, changedHTML);
    })
    .then(() => log('Successfully saved page to: ', pageLocalPath))
    .then(() => {
      log('End of app\n');

      return pageLocalPath;
    })
    .catch((error) => {
      if (error.isAxiosError) {
        console.error(`WARNING!!! Download error. ${error.message} ${error.code}`);
      } else if (error.code) {
        console.error(error.message);
      }
      throw error;
    });
};

export default loadPage;
