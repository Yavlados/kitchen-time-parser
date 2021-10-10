import axios from "axios";
import { readFile } from "fs";
import { Logger } from "./logger";
import { decode, encode } from "iconv-lite";
import { resolve } from "path";
import { parseString } from "xml2js";
import { Row } from "./row";

export interface IError {
  error: string;
  caller: XMLParser;
}

export interface ParsingResult {
  result: Row[];
  caller: XMLParser;
}

export default abstract class XMLParser {
  public url: string;
  public dirPath: string;
  public devFileName: string;
  public brands: Map<string, number>;
  public brandsNames: string[];
  code: string = "utf-8";
  parsedData: Row[] = [];

  constructor() {}

  async fetch(): Promise<any> {
    return await axios.get(this.url, { responseType: "arraybuffer" });
  }

  bind(url: string, brands: Map<string, number>) {
    this.url = url;
    this.brands = brands;
    this.brandsNames = [...this.brands.keys()];
  }

  async parse(): Promise<ParsingResult> {
    return new Promise((resolver, reject) => {
      this.fetch()
        .then((response) => {
          return new Promise((_, rej) => {
            const dataEnc = decode(response.data, this.code);
            parseString(dataEnc, (parsingError, parsingResult) => {
              if (parsingError)
                reject(this.rejector(`Parsing error: ${parsingError}`));
              resolver(this.parseXML(parsingResult));
            });
          });
        })
        .catch((err) => {
          reject(this.rejector(err));
        });
    });
  }

  async devParse(): Promise<ParsingResult> {
    return new Promise((res, reject) => {
      readFile(
        resolve(this.dirPath, this.devFileName),
        (readingError, data: Buffer) => {
          if (readingError)
            reject(this.rejector(`Reading error: ${readingError}`));

          const dataEnc = decode(data, this.code);
          parseString(dataEnc, (parsingError, parsingResult) => {
            if (parsingError)
              reject(this.rejector(`Parsing error: ${parsingError}`));
            res(this.parseXML(parsingResult));
          });
        }
      );
    });
  }

  rejector(errorMessage: string): IError {
    return {
      error: errorMessage,
      caller: this,
    };
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

  parseXML(data: object): ParsingResult {
    this.parsingCallback(data);
    return { result: this.parsedData, caller: this };
  }

  stamp(caller: string, action: string) {
    return Logger.stamp(caller, action);
  }
}
