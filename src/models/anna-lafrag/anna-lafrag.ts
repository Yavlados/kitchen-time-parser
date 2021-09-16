import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import {parseString} from 'xml2js'


export default class AnnaLafrag extends XMLParser {
  code = 'win1251'

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
    parseString(data, (err, res) => {
      console.log(res.yml_catalog.shop[0].company)
    })
  }
}
