import { format } from "date-fns";
import { Config } from "./config";
import { formatTimestamp } from "../../../utils/format-timestamp";
import { createObjectCsvWriter } from "csv-writer";
import { resolve } from "path";
import { Row } from "./row";

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
  statistics: "Parsing statistics",
};

export class Logger {
  static startDate: Date = null;
  static stepDate: Date = null;
  static config = new Config();

  static initialization() {
    Logger.startDate = new Date();
    Logger.stepDate = Logger.startDate;
    Logger.stamp(Logger.constructor.name, StampActionsEnum.start);
    createObjectCsvWriter({
      path: resolve(__dirname, "..", "..", "..", "log.csv"),
      header: [],
    });
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

  static createStatisticsReport(
    d: { inserted: string[]; updated: string[]; nonAffected: string[] },
    total: Row[],
    caller: string,
    vendors: string
  ) {
    const { inserted, updated, nonAffected } = d;
    Logger.stamp(
      caller.constructor.name,
      StampActionsEnum.statistics,
      `Parsing of vendors: ${vendors}. Statistics: ${inserted.length} inserted,  ${nonAffected.length} non affected, ${updated.length} updated,  ${total.length} total rows added.`
    );
  }
}
