import _ from 'lodash';
import Path from 'path';
import axios from 'axios';
import { writeFile, mkdir } from 'node:fs/promises';
import { createFileName } from './pageConfig.js';

class ImagesConfig {
  constructor(webSrcs, pageConfig) {
    this.webSrcs = webSrcs;
    this.pageConfig = pageConfig;
    this.absoluteWebSrc = this.makeAbsoluteWebSrc(this.webSrcs);
    this.localSrc = this.makeLocalSrcs(this.absoluteWebSrc);
    this.absoluteLocalPaths = this.makeAbsoluteLocalPaths(this.localSrc);
  }

  getAbsoluteWebSrc = () => this.absoluteWebSrc;

  getLocalSrc = () => this.localSrc;

  getAbsoluteLocalPaths = () => this.absoluteLocalPaths;

  makeAbsoluteWebSrc(webSrcs) {
    const { origin } = this.pageConfig.getLink();
    return webSrcs.map((src) => new URL(`${origin}/${src}`));
  }

  makeLocalSrcs(absoluteWebSrcs) {
    const filesFolderName = `${this.pageConfig.getFileName().slice(0, -5)}_files`;
    const localPaths = absoluteWebSrcs.map((webSrc) => {
      const cuttedSrc = webSrc.href.split('.');
      const type = _.last(cuttedSrc);
      const srcShort = _.without(cuttedSrc, type).join('.');
      const fileName = `${createFileName(new URL(srcShort))}.${type}`;
      return `${filesFolderName}/${fileName}`;
    });
    return localPaths;
  }

  makeAbsoluteLocalPaths = (localSrcs) => localSrcs.map(
    (src) => Path.join(this.pageConfig.getFolderPath(), src),
  );

  download() {
    const promises = this.getAbsoluteWebSrc().map((src) => axios.get(src.href, { responseType: 'blob' }).catch(console.log));
    const promise = Promise.all(promises);

    return mkdir(Path.dirname(this.getAbsoluteLocalPaths()[0]), { recursive: true })
      .then(() => promise)
      .then((images) => images.map(
        (
          image,
          index,
        ) => writeFile(this.getAbsoluteLocalPaths()[index], image.data)
          .catch(console.log),
      ));
  }
}

export default ImagesConfig;
