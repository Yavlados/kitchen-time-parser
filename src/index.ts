import { XMLListReader } from "./models/xml-list-reader";
import XMLParser from "./models/public/base/xml-parser";
import * as models from "./models";

async function main() {
  const mappingTable = new Map<string, XMLParser>();
  /**
   * Setting of parsers
   */
  mappingTable.set("Анна Лафарг", new models.AnnaLafrag());

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
      await parser.parse();
    }
  }

  parseSuppliers();
}

main();
