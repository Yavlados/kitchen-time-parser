import { resolve } from "path";
import { readFileSync } from "fs";

export interface IConfig {
  isDev: boolean;
  dateFormat: string;
  statisticsDateFormat: string;
  timeOutDuration: number;
  repeatCount: number;
  loggerSize: number;
  loggingTimeoutDuration: number;
  cronTime: string;
}

export class Config {
  configPath: string = resolve(__dirname, "..", "..", "..", "config.json");
  static config: IConfig = null;
  static instance: Config = null;

  constructor() {
    if (Config.instance) {
      return;
    }
    this.readConfig();
    Config.instance = this;
  }

  // updateConfig() {}

  readConfig() {
    const readBuffer = readFileSync(this.configPath);
    Config.config = (JSON.parse(readBuffer.toString()) as any) as IConfig;
  }

  get isDev() {
    return Config.config.isDev;
  }

  get dateFormat() {
    return Config.config.dateFormat;
  }

  get timeOutDuration() {
    return Config.config.timeOutDuration;
  }

  get repeatCount() {
    return Config.config.repeatCount;
  }

  get loggerSize() {
    return Config.config.loggerSize;
  }

  get loggingTimeoutDuration() {
    return Config.config.loggingTimeoutDuration;
  }

  get statisticsDateFormat() {
    return Config.config.statisticsDateFormat;
  }

  get cronTime(){
    return Config.config.cronTime;
  }
}
