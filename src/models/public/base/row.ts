import {IRow} from '../dto/row.dto'

export abstract class Row implements IRow {
    available = 0
    vendor = ''
    vendorCode = ''
    price = ''
    vendorReg = new RegExp(/([a-z])\w+/g);

    constructor(){
        this.available = 0
        this.vendor= ''
        this.vendorCode = ''
        this.price = ''
    }
}