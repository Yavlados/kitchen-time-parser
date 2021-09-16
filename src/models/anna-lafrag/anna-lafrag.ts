import XMLParser from "../public/base/xml-parser";

export default class AnnaLafrag extends XMLParser {
  parsingCallback(data: any) {
    console.log(data);
  }
}
