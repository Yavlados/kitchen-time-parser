import { format } from "date-fns";
import {Config} from "./config";
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
};

export abstract class Logger {
  startDate: Date = null;
  stepDate: Date = null;
  static config = new Config();

  constructor() {
    this.startDate = new Date();
    this.stepDate = this.startDate;
    this.stamp(this.constructor.name, StampActionsEnum.start);
  }

  stamp(caller: string, action: string): IStamp {
    const stepTime = formatTimestamp(this.stepDate, new Date());
    this.stepDate = new Date();
    return {
      caller,
      start: format(this.startDate, Logger.config.dateFormat),
      stepTime,
      action,
      uptime: formatTimestamp(this.startDate, new Date()),
    };
  }
}
