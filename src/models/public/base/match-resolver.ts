import { resolve } from "path";
import { Row } from "./row";
import { readFile, utils } from "xlsx";
import { ParsingResult } from "./xml-parser";
import { Logger, StampActionsEnum } from "./logger";

export interface MetaFileRow {
  __rowNum__?: number;
  vendor: string;
}

export class MatchResolver {
  static resultsFilePath = resolve(
    __dirname,
    "..",
    "..",
    "..",
    "files",
    "_result"
  );

  static resultsFileName = "_result.xlsx";
  static resultsMetaFileName = "_result_meta.xlsx";
  private oldResults: Row[];
  private oldResultsMatcher: Map<string, Row[]>;
  private meta: MetaFileRow[];
  private resultHeaders = Object.keys(new Row());

  constructor() {
    this.readOldResults();
    this.readMeta();
    this.createOldFileMatcher();
  }

  /**
   * Mutate newData
   */
  public async processNewRows(
    newData: ParsingResult[]
  ): Promise<{ data: Row[]; meta: MetaFileRow[] }> {
    const forInsert: string[] = [];
    const forUpdate: string[] = [];
    const forNonAffect: string[] = [];
    const totalData: Row[] = [];
    const localMeta: MetaFileRow[] = [];
    newData.forEach((p) => {
      const k = Array.from(p.result.keys());
      k.forEach((key) => {
        const newRows = p.result.get(key);
        const oldRows = this.oldResultsMatcher.get(key);

        for (let i = 0; i < newRows.length; i++) {
          const r1 = newRows[i];
          const r2 = oldRows && oldRows[i];
          if (!r2) {
            forInsert.push(key);
          } else if (
            r1.vendorCode === r2.vendorCode &&
            r1.vendor === r2.vendor &&
            r1.price === r2.price &&
            r1.available === r2.available
          ) {
            forNonAffect.push(key);
            oldRows.splice(i, 1);
          } else {
            forUpdate.push(key);
            oldRows.splice(i, 1);
          }
          totalData.push(r1);
          localMeta.push({ vendor: p.caller.constructor.name });
          newRows.splice(i, 1);
          i--;
          continue;
        }
      });
      // if data comes from rejected request after circuit breaker
      if (!k) {
        const oldRowKeys = Array.from(
          this.oldResultsMatcher.keys()
        ).filter((oldRowKey) =>
          oldRowKey.startsWith(p.caller.constructor.name)
        );
        oldRowKeys.forEach((ork) => {
          const oldRes = this.oldResultsMatcher.get(ork);
          oldRes.forEach((r) => {
            totalData.push(r);
            forNonAffect.push(ork);
          });
        });
      }
    });
    await Logger.createStatisticsReport(
      { inserted: forInsert, nonAffected: forNonAffect, updated: forUpdate },
      totalData,
      this.constructor.name,
      newData.map((p) => p.caller.constructor.name).join(", ")
    );

    return { data: totalData, meta: localMeta };
  }

  private readOldResults() {
    const wb = readFile(
      resolve(MatchResolver.resultsFilePath, MatchResolver.resultsFileName)
    );
    const ws = wb.Sheets[wb.SheetNames[0]];
    const wsAsJson = utils.sheet_to_json(ws, {
      header: this.resultHeaders,
    }) as Row[];
    wsAsJson.shift();
    this.oldResults = wsAsJson;
  }

  private readMeta() {
    const wb = readFile(
      resolve(MatchResolver.resultsFilePath, MatchResolver.resultsMetaFileName)
    );
    const ws = wb.Sheets[wb.SheetNames[0]];
    const wsAsJson = utils.sheet_to_json(ws, {
      header: ["vendor"],
    }) as Row[];
    wsAsJson.shift();
    this.meta = wsAsJson;
  }

  private createOldFileMatcher() {
    this.oldResultsMatcher = new Map<string, Row[]>();
    this.oldResults.forEach((r, i) => {
      const k = `${this.meta[i].vendor}:${r.vendor}:${r.vendorCode}`;
      let v = this.oldResultsMatcher.get(k);
      if (!v) {
        v = [];
      }
      v.push(r);
      this.oldResultsMatcher.set(k, v);
    });
  }
}
