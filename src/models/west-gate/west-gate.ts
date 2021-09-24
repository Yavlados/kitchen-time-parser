import XMLParser from "../public/base/xml-parser";
import { resolve } from "path";
import { StampActionsEnum } from "../public/base/crawler";

class WestGateRow {
  vendor: string = ''
  vendorCode: string = ''
  available: number = 0
  price: string = ''

  constructor(vendor: string[], vendorCode: string[], available: string, price:string[]){
    this.vendor = this.processVendorField(vendor[0])
    this.vendorCode = vendorCode[0].trim()
    this.available = available === 'true' ? 1 : 0
    this.price = `${+price[0].trim()}`
  }

  processVendorField(vendor: string){
    const reg = new RegExp(/([a-z])\w+/g)
    const matchingResult = vendor.trim().toLowerCase().match(reg)
    return matchingResult ? matchingResult.join(' ') : ''
  }
}



export default class WestGate extends XMLParser {
  parsedData: WestGateRow[] = []

  constructor() {
    super();
    this.dirPath = resolve(__dirname, "..", "..", "files", "west-gate");
    this.devFileName = "west-gate.xml";
  }

  parsingCallback(data: any) {
    console.log(this.stamp(StampActionsEnum.fetch));
    const offers = data.yml_catalog.shop[0].offers[0].offer
    offers.forEach( (offer:any) => {
      const row = new WestGateRow(offer.vendor, offer.vendorCode, offer.$.available, offer.price)
      if(this.brands.get(row.vendor)) this.parsedData.push(row)
    });

    console.log(this.stamp(StampActionsEnum.fetch));

}
}
