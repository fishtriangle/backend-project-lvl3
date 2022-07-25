import _ from 'lodash';
import Path from 'path';
import debug from 'debug';
import axios from 'axios';
import Listr from 'listr';
import 'axios-debug-log';
import {writeFile, mkdir, readdir} from 'node:fs/promises';
import createFileName from './util.js';

const module = 'page-loader: filesConfig';
const log = debug(module);

class FilesConfig {
  constructor(webSrcs, pageConfig) {
    this.webSrcs = webSrcs;
    this.pageConfig = pageConfig;
    this.linksToDownload = [];
    this.pathsToSave = [];
    this.srcsInLocalPage = this.makeLinks(this.webSrcs);
  }

  getLinksToDownload = () => this.linksToDownload;

  getSrcsInLocalPage = () => this.srcsInLocalPage;

  getPathsToSave = () => this.pathsToSave;

  makeLinks(webSrcs) {
    const { origin } = new URL(this.pageConfig.getLink());
    const makeLocalSrc = (absoluteWebSrc) => {
      const filesFolderName = `${this.pageConfig.getFileName().slice(0, -5)}_files`;
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
      this.linksToDownload.push(absoluteLink);
      const localSrc = makeLocalSrc(absoluteLink.href);
      this.pathsToSave.push(Path.join(this.pageConfig.getFolderPath(), localSrc));
      return localSrc;
    });
    return srcsInLocalPage;
  }

  download() {
    // const filesToDownload = this.getLinksToDownload().map((src, index) => ({
    //   title: src.href,
    //   task: () => axios.get(src.href, { responseType: 'blob' })
    //     .then((file) => {
    //       let data = '';
    //       if (file) {
    //         data = _.isObject(file.data) ? JSON.stringify(file.data) : file.data;
    //         console.log('!!!!!FILE: \n', data)
    //         log(`Save to this path ${this.getPathsToSave()[index]} \n ${data}`);
    //       }
    //       return writeFile(this.getPathsToSave()[index], data)
    //         .then(() => log('Successfully saved file', this.getPathsToSave()[index]))
    //         .catch((error) => log(error.message));;
    //     }),
    // }));

    const filesToDownload = this.getLinksToDownload().map((src, index) => ({
      title: src.href,
      task: () => axios.get(src.href, { responseType: 'blob' })
        .then((file) => {
          let data = '';
          if (file) {
            data = _.isObject(file.data) ? JSON.stringify(file.data) : file.data;
            log(`Save to this path ${this.getPathsToSave()[index]} \n ${data}`);
          }
          return writeFile(this.getPathsToSave()[index], data)
            .then(() => log('Successfully saved file', this.getPathsToSave()[index]))
            .catch((error) => log(error.message));;
        }),
    }));

    const tasks = new Listr(filesToDownload, { concurrent: true, exitOnError: false });

    return mkdir(Path.dirname(this.getPathsToSave()[0]), { recursive: true })
      // .then(() => readdir(this.getPathsToSave()[0]))
      // .then((dir) => log('!!!!!!!!    ' + dir))
    .then(() => tasks.run())
    .catch((error) => log(error.message));


    // const promises = this.getLinksToDownload().map((src) => axios.get(src.href, { responseType: 'blob' })
    //   .catch(() => log(`WARNING!!! ${src.href} cannot download`)));
    // const promise = Promise.all(promises);
    //
    // return mkdir(Path.dirname(this.getPathsToSave()[0]), { recursive: true })
    //   .then(() => promise)
    //   .then((files) => files.map(
    //     (
    //       file,
    //       index,
    //     ) => {
    //       if (file) {
    //         const data = _.isObject(file.data) ? JSON.stringify(file.data) : file.data;
    //         return writeFile(this.getPathsToSave()[index], data)
    //           .then(() => log('Successfully saved file', this.getPathsToSave()[index]))
    //           .catch((error) => log(`WARNING!!! ${file.data} cannot be saved`, '\n', error));
    //       }
    //       return null;
    //     },
    //   ))
    //   .catch((error) => log('WARNING!!! Some files cannot be saved', '\n', error));
  }
}

export default FilesConfig;
