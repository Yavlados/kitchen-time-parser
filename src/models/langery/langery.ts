import { IRawRow } from "../public/dto/row.dto";
import { Row } from "../public/base/row";
import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/logger";

interface IParam {
  _?: string
  $:{ name: string}
}

class LangeryRow extends Row {
  constructor(d: IRawRow) {
    super();

    const available = Number(d.available)

    this.vendor = this.processVendorField(d.vendor as any[]);
    this.vendorCode = d.vendorCode[0].trim();
    this.available = isNaN(available) ? 0 : available;
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
    this.stamp(this.constructor.name, StampActionsEnum.fetch);

    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {

      const available = ((offer.param.filter( (p: IParam) => `${p.$.name}`.toLowerCase() === 'доступное количество' ) || [{_:'0'}])[0])._

      const row = new LangeryRow({
        vendor: offer.param,
        vendorCode: offer.vendorCode,
        available,
        price: offer.price,
      });

      this.checkIfRowInBrands(row);
    });
    this.stamp(this.constructor.name, StampActionsEnum.parse);
  }
}
