import { format } from "date-fns";
import config from "../../../config.json";
import { formatTimestamp } from "../../../utils/format-timestamp";

export interface IStamp {
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

export abstract class Crawler {
  startDate: Date = null;
  stepDate: Date = null;

  constructor() {
    this.startDate = new Date();
    this.stepDate = this.startDate;
    this.stamp(StampActionsEnum.start);
  }

  stamp(action: string): IStamp {
    const stepTime = formatTimestamp(this.stepDate, new Date());
    this.stepDate = new Date();
    return {
      start: format(this.startDate, config.dateFormat),
      stepTime,
      action,
      uptime: formatTimestamp(this.startDate, new Date()),
    };
  }
}
