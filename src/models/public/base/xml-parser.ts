import axios from "axios";
import { readFile } from "fs";
import { Logger } from "./logger";
import { decode, encode } from "iconv-lite";
import { resolve } from "path";
import { parseString } from "xml2js";
import { Row } from "./row";
import CircuitBreaker from "./circuit-breaker";

export interface ParsingError {
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
  brandsMap: Map<string, any[]>;
  circuitBreaker: CircuitBreaker;

  constructor() {
    this.brandsMap = new Map<string, any[]>();
  }

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

  rejector(errorMessage: string): ParsingError {
    return {
      error: errorMessage,
      caller: this,
    };
  }

  checkIfRowInBrands(row: Row): void {
    if (this.brands.get(row.vendor)) {
      this.parsedData.push(row);
      // this.updateMap(row);
    } else {
      const findedBrand = this.brandsNames.find((brandName) =>
        row.vendor.includes(brandName)
      );
      if (findedBrand) {
        this.parsedData.push(row);
        // this.updateMap(row);
      }
    }
  }

  // updateMap(row: Row) {
  //   let v = this.brandsMap.get(`${row.vendor}:${row.vendorCode}`);
  //   if (!v) {
  //     v = [];
  //     v.push(`${row.vendor}:${row.vendorCode}`);
  //   }
  //   v.push(row);
  //   this.brandsMap.set(`${row.vendor}:${row.vendorCode}`, v);
  // }

  parseXML(data: object): ParsingResult {
    this.parsingCallback(data);
    // const t = Array.from(this.brandsMap.values()).filter((r) => r.length > 2);
    return { result: this.parsedData, caller: this };
  }

  stamp(caller: string, action: string) {
    return Logger.stamp(caller, action);
  }

  runCircuit(): Promise<ParsingResult | ParsingError> {
    this.circuitBreaker = new CircuitBreaker(this);
    return this.circuitBreaker.tick();
  }

  turnOffCircuit() {
    delete this.circuitBreaker;
  }

  abstract parsingCallback(data: object): any;
}
