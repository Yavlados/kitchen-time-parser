import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { parseString } from "xml2js";

export default class BarcelonaDesign extends XMLParser {
  constructor() {
    super();
    this.filePath = resolve(
      __dirname,
      "..",
      "..",
      "files",
      "barcelona-design",
      "barcelona-priority.xml"
    );
  }

  parsingCallback(data: any) {
    console.log(this.stamp());
    parseString(data, (err, res) => {
      console.log(res)
    })
  }
}
