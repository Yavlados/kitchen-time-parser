import { format, parse } from "date-fns";
import { Config } from "./config";
import { formatTimestamp } from "../../../utils/format-timestamp";
import { createObjectCsvStringifier } from "csv-writer";
import { resolve, join } from "path";
import { Row } from "./row";
import { utils } from "xlsx";
import { writeFileSync, readdir, writeFile, unlink } from "fs";
import { ObjectCsvStringifier } from "csv-writer/src/lib/csv-stringifiers/object";
import {
  processArraysToLog,
  StatisticsResult,
} from "../../../utils/arrays-to-log";

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
  static statistcsFolderPath = resolve(
    __dirname,
    "..",
    "..",
    "..",
    "files",
    "_statistics"
  );
  static logWriter: ObjectCsvStringifier;
  static statisticsWriter: ObjectCsvStringifier;
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
    Logger.statisticsWriter = createObjectCsvStringifier({
      header: [
        { id: "inserted", title: "Inserted rows" },
        { id: "updated", title: "Updated rows" },
        { id: "nonAffected", title: "Not affected rows" },
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
    console.log(stampData);
  }

  static async createStatisticsReport(
    d: { inserted: string[]; updated: string[]; nonAffected: string[] },
    total: Row[],
    caller: string,
    vendors: string
  ) {
    const { inserted, updated, nonAffected } = d;
    const statisticsData = processArraysToLog(d);
    await Logger.writeStatisticsData(statisticsData);
    Logger.stamp(
      caller,
      StampActionsEnum.statistics,
      `Parsing of vendors: ${vendors}. Statistics: ${inserted.length} inserted,  ${nonAffected.length} non affected, ${updated.length} updated,  ${total.length} total rows added.`
    );
  }

  static writeDataToLog() {
    const head = Logger.logWriter.getHeaderString();
    const body = Logger.logWriter.stringifyRecords(Logger.stampData);
    writeFileSync(Logger.logPath, head + body);
  }

  static async writeStatisticsData(data: StatisticsResult[]): Promise<void> {
    await Logger.removeOldStatistcFile();
    const head = Logger.statisticsWriter.getHeaderString();
    const body = Logger.statisticsWriter.stringifyRecords(data);
    const fileName = `${format(
      new Date(),
      Logger.config.statisticsDateFormat
    )}.csv`;
    return new Promise((res, rej) => {
      writeFile(
        resolve(Logger.statistcsFolderPath, fileName),
        head + body,
        (err) => {
          if (err) console.log(err);
          res();
        }
      );
    });
  }

  static removeOldStatistcFile(): Promise<void> {
    return new Promise((res, rej) => {
      // remove old files
      readdir(Logger.statistcsFolderPath, (err, files) => {
        if (files.length > Logger.config.statisticFilesCount) {
          const filesDateNames = files.map((fileName) => {
            return {
              fileName,
              d: parse(
                fileName.replace(".csv", ""),
                Logger.config.statisticsDateFormat,
                new Date()
              ).getTime(),
            };
          });
          const firstLogFileDate = Math.min(
            ...filesDateNames.map((data) => data.d)
          );
          const oldestFile = filesDateNames.find(
            (data) => data.d === firstLogFileDate
          );
          unlink(resolve(Logger.statistcsFolderPath, oldestFile.fileName), () =>
            res()
          );
        } else {
          res();
        }
      });
    });
  }
}
