import { Config } from "./config";
import XMLParser from "./xml-parser";

export default class CircuitBreaker {
  timeOutDuration: number;
  repeatCount: number;
  parser: XMLParser;
  totalRepeats: number;
  static config = new Config();

  constructor() {
    this.timeOutDuration = CircuitBreaker.config.timeOutDuration;
    this.repeatCount = CircuitBreaker.config.repeatCount;
    this.totalRepeats = 0;
  }

  async runCircuit() {
    if (this.totalRepeats <= this.repeatCount) {
      await this.tick();
    } else {
        
    }
  }

  tick() {
    return new Promise((res, rej) => {
      this.totalRepeats += 1;
      setTimeout(() => {
        const promise = CircuitBreaker.config.isDev
          ? this.parser.devParse()
          : this.parser.parse();
        promise
          .then((data) => {
            res("");
          })
          .catch((err) => {
            this.runCircuit();
            rej(err);
          });
      }, this.timeOutDuration * this.totalRepeats);
    });
  }
}
