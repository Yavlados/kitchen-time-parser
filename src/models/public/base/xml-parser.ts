import axios from "axios";
import { readFile } from "fs";
import { Crawler } from "./crawler";
import {decode, encode} from 'iconv-lite'


export default abstract class XMLParser extends Crawler {
  public url: string;
  public filePath: string;
  public brands: string[];
  code: string = 'utf-8'

  constructor() {
    super();
  }

  async fetch(callback: (data: any) => void) {
    const res = await axios.get(this.url, { responseType: "arraybuffer" });
    const dataEnc = decode(res.data, this.code)
    this.parsingCallback(dataEnc);
  }

  bind(url: string, brands: string[]) {
    this.url = url;
    this.brands = brands;
  }

  async parse() {
    await this.fetch(this.parsingCallback);
  }

  async devParse() {
    readFile(this.filePath, (err, data: Buffer) => {
      const dataEnc = decode(data, this.code )
      this.parsingCallback(dataEnc);
    });
  }

  abstract parsingCallback(data: string): any;

}
