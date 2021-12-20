import { HTMLElement, parse } from 'node-html-parser';
import fs from 'fs';

export default class HTMLParser {
  constructor(private file: string) {}

  getFromFile(): HTMLElement {
    return parse(fs.readFileSync(this.file).toString());
  }

  getWithInjectedContent(data: { [key in string]: string }): string {
    const html = this.getFromFile();
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(data)) {
      html.querySelector(`#${key}`)?.set_content(data[key]);
    }
    return html.toString();
  }
}
