import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/logger";
import { Row } from "../public/base/row";
import { IRawRow } from "../public/dto/row.dto";

class NadobaRow extends Row {
  constructor(d: IRawRow) {
    super();
    this.vendor = this.processVendorField(d.vendor[0]);
    this.vendorCode = d.vendorCode[0].trim();
    this.available = d.available === "true" ? 1 : 0;
    this.price = `${+d.price[0].trim()}`;
    delete this.vendorReg;
  }

  processVendorField(vendor: string) {
    const matchingResult = vendor.trim().toUpperCase().match(this.vendorReg);
    return matchingResult ? matchingResult.join(" ") : "";
  }
}

export default class Nadoba extends XMLParser {
  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "nadoba");
    this.devFileName = "nadoba.xml";
  }

  parsingCallback(data: any) {
    console.log(this.stamp(this.constructor.name, StampActionsEnum.fetch));
    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {
      const row = new NadobaRow({
        vendor: offer.vendor,
        vendorCode: offer.vendorCode,
        available: offer.$.available,
        price: offer.price,
      });
      this.checkIfRowInBrands(row);
    });

    console.log(this.stamp(this.constructor.name, StampActionsEnum.parse));
  }
}