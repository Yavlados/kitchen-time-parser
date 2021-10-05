import { IRawRow } from "../public/dto/row.dto";
import { Row } from "../public/base/row";
import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/crawler";

class LangeryRow extends Row {
  constructor(d: IRawRow) {
    super();
    this.vendor = this.processVendorField(d.vendor as any[]);
    this.vendorCode = d.vendorCode[0].trim();
    this.available = d.available === "true" ? 1 : 0;
    this.price = `${+d.price[0].trim()}`;
    delete this.vendorReg;
  }

  processVendorField(params: any[]): string {
    if (!Array.isArray(params)) {
      return "";
    }
    const vendorObject = params.find((p) => p.$.name === "Бренд");
    if (vendorObject) {
      const matchingResult = vendorObject._.trim()
        .toUpperCase()
        .match(this.vendorReg);
      return matchingResult ? matchingResult.join(" ") : "";
    }
    return "";
  }
}

export default class Langery extends XMLParser {

  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "langery");
    this.devFileName = "langery.xml";
  }

  parsingCallback(data: any) {
    console.log(this.stamp(this.constructor.name, StampActionsEnum.fetch));

    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {
      const row = new LangeryRow({
        vendor: offer.param,
        vendorCode: offer.vendorCode,
        available: offer.$.available,
        price: offer.price,
      });

      this.checkIfRowInBrands(row);
    });
    console.log(this.stamp(this.constructor.name, StampActionsEnum.parse));
  }
}
