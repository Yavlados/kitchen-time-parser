import { Config } from "./config";
import XMLParser, { ParsingResult, ParsingError } from "./xml-parser";
import { Logger, StampActionsEnum } from "./logger";
import { convertMiliseconds } from "../../../utils/format-timestamp";
import { Row } from "./row";

export default class CircuitBreaker {
  timeOutDuration: number;
  repeatCount: number;
  totalRepeats: number;
  static config = new Config();
  caller: XMLParser;

  constructor(caller: XMLParser) {
    this.timeOutDuration = CircuitBreaker.config.circuitBreakerTimeOutDuration;
    this.repeatCount = CircuitBreaker.config.circuitBreakerRepeatCount;
    this.totalRepeats = 0;
    this.caller = caller;
  }

  turnOff() {
    this.caller.turnOffCircuit();
  }

  tick(): Promise<ParsingResult | ParsingError> {
    return new Promise((res, rej) => {
      this.totalRepeats += 1;
      const timeout = this.timeOutDuration * this.totalRepeats;

      setTimeout(() => {
        const promise = CircuitBreaker.config.isDev
          ? this.caller.devParse()
          : this.caller.parse();
        promise
          .then((data) => {
            Logger.stamp(
              this.caller.constructor.name,
              StampActionsEnum.resolved,
              `Resolved after timeout ${convertMiliseconds(timeout)}`
            );
            this.turnOff();
            res(data);
          })
          .catch(async (err) => {
            Logger.stamp(
              this.caller.constructor.name,
              StampActionsEnum.reject,
              `Rejected after timeout ${convertMiliseconds(timeout)}`
            );

            if (this.totalRepeats <= this.repeatCount) {
              res(await this.tick());
            } else {
              Logger.stamp(
                this.caller.constructor.name,
                StampActionsEnum.reject,
                `Total rejection count is more than limit. ${this.caller.constructor.name} parser will be called on next iteration`
              );
              res({
                result: this.createTemporaryResolveResult(),
                caller: this.caller,
              });
            }
          });
      }, timeout);
    });
  }

  createTemporaryResolveResult(): Map<string, Row[]> {
    return new Map<string, Row[]>();
  }
}
