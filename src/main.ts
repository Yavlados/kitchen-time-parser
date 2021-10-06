import { XMLListReader } from "./models/xml-list-reader";
import XMLParser from "./models/public/base/xml-parser";
import * as models from "./models";
import config from "./config.json";
import { Row } from "./models/public/base/row";
import { utils, writeFile } from "xlsx";
import { resolve } from "path";

async function main() {
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

    const data = await Promise.allSettled(promises)

    data
      // saveResults(
      //  Array.prototype.concat.apply([], data)
      // );
  }

  async function saveResults(rows: Row[]) {
    const newFilePath = resolve(__dirname, "files", "_result", "result.xlsx");
    const newBook = utils.book_new();
    const sheet = utils.json_to_sheet(rows, { header: [] });
    utils.book_append_sheet(newBook, sheet);
    writeFile(newBook, newFilePath);
    console.log('File was saved')
  }

  parseSuppliers();
}

main();
