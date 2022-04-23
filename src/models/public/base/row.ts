import { IRow } from "../dto/row.dto";

export class Row implements IRow {
  available = 0;
  vendor = "";
  vendorCode = "";
  price = "";
  vendorReg = new RegExp(/([\w_&'-]+)/g);

  constructor() {
    this.available = 0;
    this.vendor = "";
    this.vendorCode = "";
    this.price = "";
  }
}
