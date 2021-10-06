import { IRawRow } from "../public/dto/row.dto";
import { Row } from "../public/base/row";
import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/crawler";

class KitchenHoldRow extends Row {
  constructor(d: IRawRow) {
    super();
    this.vendor = this.processVendorField(d.vendor[0]);
    this.vendorCode = d.vendorCode[0].trim();
    this.available = d.available === "true" ? 1 : 0;
    this.price = `${+d.price[0].trim()}`;
    delete this.vendorReg;
  }

  processVendorField(vendor: string): string {
    if (vendor) {
      const matchingResult = vendor.trim().toUpperCase().match(this.vendorReg);
      return matchingResult ? matchingResult.join(" ") : "";
    }
    return "";
  }
}

export default class Iris extends XMLParser {
  parsingCallback(data: object) {
    throw new Error("Method not implemented.");
  }

  constructor() {
    super();
  }

  devParse() {
    return new Promise<any>((res, rej) => {
      rej(this.rejector("err"));
    });
  }

  parse() {
    return new Promise<any>((res, rej) => {
      rej("err");
    });
  }
}
