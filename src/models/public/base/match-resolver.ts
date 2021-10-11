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
  private brandsMatcher: Map<string, string>;
  private callerMatcher: Map<string, number>;

  constructor() {
    this.brandsMatcher = new Map<string, string>();
    this.callerMatcher = new Map<string, number>();
    this.readOldResults();
    this.readMeta();
    this.createOldFileMatcher();
  }

  /**
   * Mutate newData
   */
  public processNewRows(
    newData: ParsingResult[]
  ): { data: Row[]; meta: MetaFileRow[] } {
    const forInsert: number[] = [];
    const forUpdate: number[] = [];
    const forNonAffect: number[] = [];
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
            forInsert.push(0);
          } else if (
            r1.vendorCode === r2.vendorCode &&
            r1.vendor === r2.vendor &&
            r1.price === r2.price &&
            r1.available === r2.available
          ) {
            forNonAffect.push(0);
            oldRows.splice(i, 1);
          } else {
            forUpdate.push(0);
            oldRows.splice(i, 1);
          }
          totalData.push(r1);
          localMeta.push({ vendor: p.caller.constructor.name });
          newRows.splice(i, 1);
          i--;
          continue;
        }
      });
    });
    Logger.stamp(
      this.constructor.name,
      StampActionsEnum.statistics,
      `Parsing of vendors: ${newData
        .map((p) => p.caller.constructor.name)
        .join(", ")}. Statistics: ${forInsert.length} inserted,  ${
        forNonAffect.length
      } non affected, ${forUpdate.length} updated,  ${
        totalData.length
      } total rows added.`
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
    this.meta;
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
