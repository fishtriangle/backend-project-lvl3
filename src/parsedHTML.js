import { load } from 'cheerio';

const fileTagsAsset = {
  link: 'href',
  img: 'src',
  script: 'src',
};

class ParsedHTML {
  constructor(htmlStr) {
    this.$ = load(htmlStr);
  }

  toString() {
    return this.$.html();
  }

  getFilesSrc() {
    const srcs = [];
    Object.keys(fileTagsAsset).forEach((fileTag) => {
      this.$(fileTag).each((_, tag) => {
        srcs.push(this.$(tag).attr(fileTagsAsset[fileTag]));
      });
    });
    return srcs;
  }

  setFilesSrc(newPaths) {
    let counter = 0;
    Object.entries(fileTagsAsset).forEach(([fileTag, attribute]) => {
      this.$(fileTag).attr(attribute, (index, fileSrc) => {
        if (fileSrc) {
          const replacedFileSrc = fileSrc.replace(fileSrc, newPaths[counter]);
          counter += 1;
          return replacedFileSrc;
        }
        return fileSrc;
      });
    });
  }
}

export default ParsedHTML;
