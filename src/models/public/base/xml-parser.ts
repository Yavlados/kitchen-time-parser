import axios from "axios";
import { readFile } from "fs";
import { Crawler } from "./crawler";
import {decode, encode} from 'iconv-lite'
import {resolve} from 'path'
import { parseString } from "xml2js";
import { Row } from "./row";

export default abstract class XMLParser extends Crawler {
  public url: string;
  public dirPath: string;
  public devFileName: string;
  public brands: Map<string, number>;
  public brandsNames:string[];
  code: string = 'utf-8'
  parsedData: Row[] = [];

  constructor() {
    super();
  }

  async fetch() {
    const res = await axios.get(this.url, { responseType: "arraybuffer" });
    const dataEnc = decode(res.data, this.code)
    parseString( dataEnc, (parsingError, parsingResult) => {
      if(parsingError) throw new Error(`Parsing error: ${parsingError}`)
      this.parsingCallback(parsingResult);
    })
  }

  bind(url: string, brands: Map<string, number>) {
    this.url = url;
    this.brands = brands;
    this.brandsNames = [...this.brands.keys()]
  }

  async parse() {
    await this.fetch();
  }

  async devParse() {
    readFile( resolve(this.dirPath, this.devFileName) , (readingError, data: Buffer) => {
      if(readingError) throw new Error(`Reading error: ${readingError}`)

      const dataEnc = decode(data, this.code )
      parseString( dataEnc, (parsingError, parsingResult) => {
        if(parsingError) throw new Error(`Parsing error: ${parsingError}`)
        this.parsingCallback(parsingResult);
      })
    });
  }

  checkIfRowInBrands(row: Row){
    if (this.brands.get(row.vendor)) {
      this.parsedData.push(row);
    } else {
      const findedBrand = this.brandsNames.find((brandName) =>
        row.vendor.includes(brandName)
      );
      if (findedBrand) this.parsedData.push(row);
    }
  }

  abstract parsingCallback(data: object): any;
}
