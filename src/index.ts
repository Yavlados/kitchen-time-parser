import { XMLListReader } from "./models/xml-list-reader";
import XMLParser from "./models/public/base/xml-parser";
import * as models from "./models";
import config from './config.json'

async function main() {
  const mappingTable = new Map<string, XMLParser>();
  /**
   * Setting of parsers
   */
  // mappingTable.set("West Gate", new models.WestGate());
  mappingTable.set("Лимарс", new models.Limars());
  // mappingTable.set("Barcelonadesign", new models.BarcelonaDesign());

  /** ======================================= */
  const suppliers = Array.from(mappingTable.keys());

  // Preparing list of xml-data
  const list = new XMLListReader();
  await list.prepareList().catch((err) => console.log(err));

  async function parseSuppliers() {
    for (const supplierName of suppliers) {
      const parser = mappingTable.get(supplierName);
      const meta = list.supplierMeta.get(supplierName);
      parser.bind(meta.url, meta.brands);

        config.isDev
      ? parser.devParse()
      : await parser.parse();
    }
  }

  parseSuppliers();
}

main();
