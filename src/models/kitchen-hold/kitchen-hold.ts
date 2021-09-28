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
      const matchingResult = vendor.trim().toLowerCase().match(this.vendorReg);
      return matchingResult ? matchingResult.join(" ") : "";
    }
    return "";
  }
}

export default class KitchenHold extends XMLParser {
//   code = "win1251";

  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "kitchen-hold");
    this.devFileName = "kitchen-hold.xml";
  }

  parsingCallback(data: any) {
    console.log(this.stamp(StampActionsEnum.fetch));

    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {
      const row = new KitchenHoldRow({
        vendor: offer.vendor,
        vendorCode: offer.vendorCode,
        available: offer.$.available,
        price: offer.price,
      });

      this.checkIfRowInBrands(row);
    });
    console.log(this.parsedData);

    console.log(this.stamp(StampActionsEnum.parse));
  }
}
