import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { parseString } from "xml2js";
import { StampActionsEnum } from "../public/base/logger";
import { Row } from "../public/base/row";
import { IRawRow } from "../public/dto/row.dto";

class BarcelonaDesignRow extends Row {
  constructor(d: IRawRow) {
    super();

    const available = Number(d.available)

    this.vendor = this.processVendorField(d.vendor[0]);
    this.vendorCode = d.vendorCode[0].trim();
    this.available =  isNaN(available) ? 0 : available;
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

export default class BarcelonaDesign extends XMLParser {

  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "barcelona-design");
    this.devFileName = "barcelona-priority.xml";
  }

  parsingCallback(data: any) {
    this.stamp(this.constructor.name,StampActionsEnum.fetch);

    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {
      const row = new BarcelonaDesignRow({
        vendor: offer.vendor,
        vendorCode: offer.vendorCode,
        available: offer.stock[0],
        price: offer.price,
      });

      this.checkIfRowInBrands(row)
    });

    this.stamp(this.constructor.name,StampActionsEnum.parse);
  }
}
