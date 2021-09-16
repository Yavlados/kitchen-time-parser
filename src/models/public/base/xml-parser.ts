import axios from "axios";

export default abstract class XMLParser {
  public url: string;
  public filesPath: string;
  public brands: string[];

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

  abstract parsingCallback(data: any): any;
}
