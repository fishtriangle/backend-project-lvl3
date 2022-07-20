import _ from 'lodash';
import Path from 'path';
import axios from 'axios';
import { writeFile, mkdir } from 'node:fs/promises';
import { createFileName } from './pageConfig.js';

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
      // console.log('AbsWebSrc: ', absoluteWebSrc);
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
      // console.log('FileName: ', fileName);
      return Path.join(filesFolderName, fileName);
    };

    const srcsInLocalPage = webSrcs.map((src) => {
      const absoluteLink = new URL(src, origin);
      // console.log('Src: ', src);
      // console.log('Origin', origin);
      // console.log('Link: ', absoluteLink.href);
      if (absoluteLink.href === src && origin !== absoluteLink.origin) {
        return src;
      }
      this.linksToDownload.push(absoluteLink);
      const localSrc = makeLocalSrc(absoluteLink.href);
      // console.log('Local src: ', localSrc);
      this.pathsToSave.push(Path.join(this.pageConfig.getFolderPath(), localSrc));
      return localSrc;
    });
    // console.log('Srcs in local page: ', srcsInLocalPage);
    return srcsInLocalPage;
  }

  download() {
    // console.log('Download links: ', this.getLinksToDownload());
    // console.log('Download length: ', this.getLinksToDownload().length);
    const promises = this.getLinksToDownload().map((src) => axios.get(src.href, { responseType: 'blob' })
      .catch(() => console.log(`WARNING!!! ${src.href} cannot download`)));
    const promise = Promise.all(promises);

    return mkdir(Path.dirname(this.getPathsToSave()[0]), { recursive: true })
      .then(() => promise)
      .then((files) => files.map(
        (
          file,
          index,
        ) => {
          if (file) {
            return writeFile(this.getPathsToSave()[index], file.data)
              .catch((error) => {
                console.log(`WARNING!!! ${file.toString()} cannot be saved`);
                console.log(error);
              });
          }
          return null;
          // console.log('Save length: ', index, ':  ', files[index].data.length);
          // console.log(index, ': ', this.getPathsToSave()[index]);
          // console.log('Save 7: ', files[7]);
          // console.log('7 : ', this.getPathsToSave()[7]);
        },
      ))
      .catch((error) => {
        console.log('WARNING!!! Some files cannot be saved');
        console.log(error);
      });
  }
}

export default FilesConfig;
