import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { parseString } from "xml2js";
import { StampActionsEnum } from "../public/base/crawler";

export default class BarcelonaDesign extends XMLParser {
  constructor() {
    super();
    this.dirPath = resolve(
      __dirname,
      "..",
      "..",
      "files",
      "barcelona-design"
    );
    this.devFileName =  "barcelona-priority.xml"
  }

  parsingCallback(data: any) {
    console.log(this.stamp(StampActionsEnum.fetch));
    parseString(data, (err, res) => {
      console.log(res)
    })
  }
}
