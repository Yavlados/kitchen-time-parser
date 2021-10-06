import axios from "axios";
import { readFile } from "fs";
import { Logger } from "./crawler";
import { decode, encode } from "iconv-lite";
import { resolve } from "path";
import { parseString } from "xml2js";
import { Row } from "./row";

export default abstract class XMLParser extends Logger {
  public url: string;
  public dirPath: string;
  public devFileName: string;
  public brands: Map<string, number>;
  public brandsNames: string[];
  code: string = "utf-8";
  parsedData: Row[] = [];

  constructor() {
    super();
  }

  async fetch(): Promise<any> {
    return await axios.get(this.url, { responseType: "arraybuffer" });
  }

  bind(url: string, brands: Map<string, number>) {
    this.url = url;
    this.brands = brands;
    this.brandsNames = [...this.brands.keys()];
  }

  async parse(): Promise<Row[]> {
    return new Promise((resolver, reject) => {
      this.fetch()
        .then((response) => {
          return new Promise((_, rej) => {
            const dataEnc = decode(response.data, this.code);
            parseString(dataEnc, (parsingError, parsingResult) => {
              if (parsingError)
                reject(new Error(`Parsing error: ${parsingError}`));
              resolver(this.parseXML(parsingResult));
            });
          });
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
    });
  }

  async devParse(): Promise<Row[]> {
    return new Promise((res, rej) => {
      readFile(
        resolve(this.dirPath, this.devFileName),
        (readingError, data: Buffer) => {
          if (readingError) throw new Error(`Reading error: ${readingError}`);

          const dataEnc = decode(data, this.code);
          parseString(dataEnc, (parsingError, parsingResult) => {
            if (parsingError) throw new Error(`Parsing error: ${parsingError}`);
            res(this.parseXML(parsingResult));
          });
        }
      );
    });
  }

  checkIfRowInBrands(row: Row): void {
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

  parseXML(data: object) {
    this.parsingCallback(data);
    return this.parsedData;
  }
}
