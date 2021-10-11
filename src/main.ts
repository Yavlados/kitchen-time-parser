import { XMLListReader } from "./models/xml-list-reader";
import XMLParser, {
  ParsingResult,
  ParsingError,
} from "./models/public/base/xml-parser";
import * as models from "./models";
import { Config } from "./models/public/base/config";
import { Row } from "./models/public/base/row";
import { utils, writeFile } from "xlsx";
import { resolve } from "path";
import { Logger } from "./models/public/base/logger";

async function main() {
  const config = new Config();
  Logger.initialization();
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
  mappingTable.set("Iris", new models.Iris());

  /** ======================================= */
  const suppliers = Array.from(mappingTable.keys());

  // Preparing list of xml-data
  const list = new XMLListReader();
  await list.prepareList().catch((err) => console.log(err));

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

    await handleFulfilledResults(fulfilled);
    await handleRejectedResults(rejected);
    await saveResults(
      [].concat.apply(
        [],
        fulfilled.map((f) => f.result)
      )
    );
  }

  async function handleFulfilledResults(data: ParsingResult[]) {
    data;
  }

  async function handleRejectedResults(data: ParsingError[]) {
    const promises = data.map((d) => d.caller.runCircuit());
    const awaitedPromises = await Promise.allSettled(promises);
    console.log(awaitedPromises);
    const fulfilledResults = awaitedPromises
      .filter(
        (pr: PromiseFulfilledResult<ParsingResult | ParsingError>) =>
          !(pr.value as ParsingError)?.error
      )
      .map((ff: PromiseFulfilledResult<ParsingResult>) => ff.value);

    await handleFulfilledResults(fulfilledResults);
  }

  async function saveResults(rows: Row[]) {
    const newFilePath = resolve(__dirname, "files", "_result", "result.xlsx");
    const newBook = utils.book_new();
    const sheet = utils.json_to_sheet(rows, {
      header: ["available", "vendor", "vendorCode", "price"],
    });
    utils.book_append_sheet(newBook, sheet);
    writeFile(newBook, newFilePath);
    console.log("File was saved");
  }

  parseSuppliers();
}

main();
