import { IRawRow } from "../public/dto/row.dto";
import { Row } from "../public/base/row";
import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/logger";

class FineDesignRow extends Row {
  constructor(d: IRawRow) {
    super();
    let available
    if(isNaN(parseInt(d.available, 10))) {
      available = d.available === "true" ? 1 : 0;
    } else {
      available = parseInt(d.available, 10)
    }
    this.vendor = this.processVendorField(d.vendor[0]);
    this.vendorCode = d.vendorCode[0].trim();
    this.available = available
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

export default class FineDesign extends XMLParser {
  code = "win1251";

  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "fine-design");
    this.devFileName = "fine-design.xml";
  }

  parsingCallback(data: any) {
    this.stamp(this.constructor.name, StampActionsEnum.fetch);

    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {
      const available = offer.param.find((p: any) => p.$.name === 'stock')?._ || offer.$.available
      const row = new FineDesignRow({
        vendor: offer.vendor,
        vendorCode: offer.vendorCode,
        available,
        price: offer.price,
      });

      this.checkIfRowInBrands(row);
    });

    this.stamp(this.constructor.name, StampActionsEnum.parse);
  }
}
