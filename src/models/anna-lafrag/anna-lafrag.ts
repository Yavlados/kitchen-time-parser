import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";

export default class AnnaLafrag extends XMLParser {
  constructor() {
    super();
    this.filePath = resolve(
      __dirname,
      "..",
      "..",
      "files",
      "anna-lafrag",
      "annalafarg.xml"
    );
  }

  parsingCallback(data: any) {
    console.log(this.stamp());
    
  }
}
