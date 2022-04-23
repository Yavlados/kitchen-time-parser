import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/logger";
import { Row } from "../public/base/row";
import { IRawRow } from "../public/dto/row.dto";
import ftp from "ftp";
import { decode, encode } from "iconv-lite";
import { parseString } from "xml2js";

class ZwillingRow extends Row {
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
    this.available = available;
    this.price = `${+d.price[0].trim()}`;
    delete this.vendorReg;
  }

  processVendorField(vendor: string) {
    const matchingResult = vendor.trim().toUpperCase().match(this.vendorReg);
    return matchingResult ? matchingResult.join(" ") : "";
  }
}

export default class Zwilling extends XMLParser {
  code = "win1251";

  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "zwilling");
    this.devFileName = "zwilling.xml";
  }

  fetch() {
    return new Promise((res, rej) => {
      const c = new ftp();

      c.on("ready", () => {
        c.list(".", (err1, _) => {
          if (err1) rej(err1);
          c.get("/zwilling.xml", (err2, stream) => {
            if (err2) rej(err2);
            let content = new Buffer("");
            stream.on("data", (chunk) => {
              content += chunk;
            });
            stream.on("end", () => {
              res({ data: content });
            });
          });
        });
      });

      c.connect({
        host: "ftp2.pmkc.ru",
        user: "zwilling",
        password: "cp2895va",
      });
    });
  }

  parsingCallback(data: any) {
    this.stamp(this.constructor.name, StampActionsEnum.fetch);

    const offers = data.yml_catalog.shop[0].offers[0].offer;
    offers.forEach((offer: any) => {
      const available = offer.outlets[0]?.outlet[0]?.$.instock || offer.$.available
      const row = new ZwillingRow({
        vendor: offer.vendor,
        vendorCode: offer.model,
        available,
        price: offer.price,
      });
      this.checkIfRowInBrands(row);
    });

    this.stamp(this.constructor.name, StampActionsEnum.parse);
  }
}
