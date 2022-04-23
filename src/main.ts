import { XMLListReader } from "./models/public/base/xml-list-reader";
import XMLParser, {
  ParsingResult,
  ParsingError,
} from "./models/public/base/xml-parser";
import * as models from "./models";
import { Config } from "./models/public/base/config";
import { Row } from "./models/public/base/row";
import { utils, writeFile } from "xlsx";
import { resolve } from "path";
import { Logger, StampActionsEnum } from "./models/public/base/logger";
import {
  MatchResolver,
  MetaFileRow,
} from "./models/public/base/match-resolver";
import cron from "cron";

async function main(list: XMLListReader) {
  const mappingTable = new Map<string, XMLParser>();
  /**
   * Setting of parsers
   */
  mappingTable.set("West Gate", new models.WestGate());
  mappingTable.set("Лимарс", new models.Limars());
  mappingTable.set("Barcelonadesign", new models.BarcelonaDesign());
  mappingTable.set("FineDesign", new models.FineDesign());
  mappingTable.set("Kitchen Hold", new models.KitchenHold());
  mappingTable.set("Langery", new models.Langery());
  mappingTable.set("Nadoba", new models.Nadoba());
  mappingTable.set("Zwilling", new models.Zwilling());
  // mappingTable.set("Anna Lafarg", new models.AnnaLafarg());

  /** ======================================= */
  const suppliers = Array.from(mappingTable.keys());

  async function parseSuppliers() {
    const promises = suppliers.map((supplierName) => {
      const parser = mappingTable.get(supplierName);
      const meta = list.supplierMeta.get(supplierName);
      parser.bind(meta.url, meta.brands);

      return config.isDev ? parser.devParse() : parser.parse();
    });

    const data = await Promise.allSettled(promises);

    const fulfilled = data
      .filter((pr) => pr.status === "fulfilled")
      .map((res: PromiseFulfilledResult<ParsingResult>) => res.value);
    const rejected = data
      .filter((pr) => pr.status === "rejected")
      .map((res: PromiseRejectedResult) => res.reason);

    const fullfilledAfterRejection = await handleRejectedResults(rejected);
    await handleFulfilledResults(fulfilled.concat(...fullfilledAfterRejection));
  }

  async function handleFulfilledResults(newData: ParsingResult[]) {
    const t = new MatchResolver();
    const { data, meta } = await t.processNewRows(newData);
    await saveResults(data);
    await saveMeta(meta);
  }

  async function handleRejectedResults(
    data: ParsingError[]
  ): Promise<ParsingResult[]> {
    const promises = data.map((d) => d.caller.runCircuit());
    const awaitedPromises = await Promise.allSettled(promises);
    const fulfilledResults = awaitedPromises
      .filter(
        (pr: PromiseFulfilledResult<ParsingResult | ParsingError>) =>
          !(pr.value as ParsingError)?.error
      )
      .map((ff: PromiseFulfilledResult<ParsingResult>) => ff.value);

    return fulfilledResults;
  }

  async function saveResults(rows: Row[]) {
    const newFilePath = resolve(
      MatchResolver.resultsFilePath,
      MatchResolver.resultsFileName
    );
    const newBook = utils.book_new();
    const sheet = utils.json_to_sheet(rows, {
      header: ["available", "vendor", "vendorCode", "price"],
    });
    utils.book_append_sheet(newBook, sheet);
    writeFile(newBook, newFilePath);
    console.log("File was saved");
  }

  async function saveMeta(rows: MetaFileRow[]) {
    const newFilePath = resolve(
      MatchResolver.resultsFilePath,
      MatchResolver.resultsMetaFileName
    );
    const newBook = utils.book_new();
    const sheet = utils.json_to_sheet(rows, { header: ["vendor"] });
    utils.book_append_sheet(newBook, sheet);
    writeFile(newBook, newFilePath);
    console.log("Meta file was saved");
  }

  parseSuppliers();
}

const config = new Config();
Logger.initialization();
// Preparing list of xml-data
const job = new cron.CronJob({
  cronTime: config.cronTime,
  onTick: async () => {
    const list = new XMLListReader();
    list
      .prepareList()
      .catch((err) => Logger.stamp("main", StampActionsEnum.error, err))
      .then(async () => {
        await main(list);
      });
  },
  start: true,
  timeZone: "Europe/Moscow",
  runOnInit: true,
});

job.start();