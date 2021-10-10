import XMLParser from "../public/base/xml-parser";

export default class Iris extends XMLParser {
  rejectCount: number;
  rejectThreshold = 1;

  parsingCallback(data: object) {
    throw new Error("Method not implemented.");
  }

  constructor() {
    super();
    this.rejectCount = 0;
  }

  devParse() {
    return this.irisParsing();
  }

  parse() {
    return this.irisParsing();
  }

  irisParsing() {
    return new Promise<any>((res, rej) => {
      if (this.rejectCount <= this.rejectThreshold) {
        this.rejectCount += 1;
        rej(this.rejector("err"));
      } else {
        res({ result: this.parsedData, caller: this });
      }
    });
  }
}
