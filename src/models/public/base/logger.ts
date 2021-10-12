import { format } from "date-fns";
import { Config } from "./config";
import { formatTimestamp } from "../../../utils/format-timestamp";
import { createObjectCsvStringifier } from "csv-writer";
import { resolve } from "path";
import { Row } from "./row";
import { CsvWriter } from "csv-writer/src/lib/csv-writer";
import { ObjectMap } from "csv-writer/src/lib/lang/object";
import { readFile, writeFile, writeFileSync } from "fs";
import { ObjectCsvStringifier } from "csv-writer/src/lib/csv-stringifiers/object";

export interface IStamp {
  caller: string;
  time: string;
  stepTime: string;
  action: string;
  uptime: string;
  message?: string;
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
  static logPath = resolve(__dirname, "..", "..", "..", "log.csv");
  static logWriter: ObjectCsvStringifier;
  static stampData: IStamp[] = [];
  static loggerUpdateTimeout: NodeJS.Timeout = null;

  static async initialization() {
    Logger.startDate = new Date();
    Logger.stepDate = Logger.startDate;
    Logger.logWriter = createObjectCsvStringifier({
      header: [
        { id: "time", title: "Time" },
        { id: "caller", title: "Caller" },
        { id: "action", title: "Action" },
        { id: "stepTime", title: "Time for step" },
        { id: "uptime", title: "Total uptime" },
        { id: "message", title: "Message" },
      ],
    });
    await Logger.stamp(Logger.constructor.name, StampActionsEnum.start);
  }

  static stamp(caller: string, action: string, message: string = ""): void {
    const stepTime = formatTimestamp(this.stepDate, new Date());
    Logger.stepDate = new Date();
    const stampData = {
      caller,
      time: format(new Date(), Logger.config.dateFormat),
      stepTime,
      action,
      uptime: formatTimestamp(this.startDate, new Date()),
      ...(message ? { message } : {}),
    };
    Logger.stampData.push(stampData);
    if (!Logger.loggerUpdateTimeout) {
      Logger.loggerUpdateTimeout = setTimeout(() => {
        while (Logger.stampData.length > Logger.config.loggerSize) {
          Logger.stampData.splice(0, 1);
        }
        Logger.writeDataToLog();
        clearTimeout(Logger.loggerUpdateTimeout);
        Logger.loggerUpdateTimeout = null;
      }, Logger.config.loggingTimeoutDuration);
    }
  }

  static createStatisticsReport(
    d: { inserted: string[]; updated: string[]; nonAffected: string[] },
    total: Row[],
    caller: string,
    vendors: string
  ) {
    const { inserted, updated, nonAffected } = d;
    Logger.stamp(
      caller,
      StampActionsEnum.statistics,
      `Parsing of vendors: ${vendors}. Statistics: ${inserted.length} inserted,  ${nonAffected.length} non affected, ${updated.length} updated,  ${total.length} total rows added.`
    );
  }

  static writeDataToLog() {
    const headerString = Logger.logWriter.getHeaderString();
    const body = Logger.logWriter.stringifyRecords(Logger.stampData);
    writeFileSync(Logger.logPath, headerString + body);
  }
}
