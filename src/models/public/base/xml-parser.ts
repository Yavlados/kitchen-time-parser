import axios from "axios";
import { readFile } from "fs";
import { Crawler } from "./crawler";

export default abstract class XMLParser extends Crawler {
  public url: string;
  public filePath: string;
  public brands: string[];

  constructor() {
    super();
  }

  async fetch(callback: (data: any) => void) {
    return await axios.get(this.url).then(callback);
  }

  bind(url: string, brands: string[]) {
    this.url = url;
    this.brands = brands;
  }

  async parse() {
    await this.fetch(this.parsingCallback);
  }

  async devParse() {
    readFile(this.filePath, (err, data) => {
      this.parsingCallback(data.toString());
    });
  }

  abstract parsingCallback(data: string): any;
}
