import { load } from 'cheerio';

class ParsedHTML {
  constructor(htmlStr) {
    this.$ = load(htmlStr);
  }

  toString() {
    return this.$.html();
  }

  getImagesSrc() {
    const srcs = [];
    this.$('img').each((index, tag) => {
      srcs[index] = this.$(tag).attr('src');
    });
    return srcs;
  }

  setImagesSrc(newPaths) {
    const images = this.$('img');
    images.attr('src', (index, src) => src.replace(src, newPaths[index]));
  }
}

export default ParsedHTML;
