import { format } from "date-fns";
import { Config } from "./config";
import { formatTimestamp } from "../../../utils/format-timestamp";

export interface IStamp {
  caller: string;
  start: string;
  stepTime: string;
  action: string;
  uptime: string;
}

export const StampActionsEnum = {
  fetch: "Fetching data",
  parse: "Parsing of data",
  error: "Error has been occured",
  start: "Server start",
  reject: "Request was rejected",
  resolved: "Request was resolved",
};

export abstract class Logger {
  static startDate: Date = null;
  static stepDate: Date = null;
  static config = new Config();

  static initialization() {
    Logger.startDate = new Date();
    Logger.stepDate = Logger.startDate;
    Logger.stamp(Logger.constructor.name, StampActionsEnum.start);
  }

  static stamp(caller: string, action: string, message: string = ""): IStamp {
    const stepTime = formatTimestamp(this.stepDate, new Date());
    Logger.stepDate = new Date();
    const stampData = {
      caller,
      start: format(this.startDate, Logger.config.dateFormat),
      stepTime,
      action,
      uptime: formatTimestamp(this.startDate, new Date()),
      ...(message ? { message } : {}),
    };
    console.log(stampData);
    return stampData;
  }
}
