import { resolve } from "path";
import { readdir } from "fs";
import { readFile, utils } from "xlsx";
import {
  SupplierMeta,
  SupplierMetaLocal,
} from "./public/dto/supplier-meta.dto";

class XMLFileRow {
  supplier: string = "";
  url: string = "";
  format: string = "";
  brand: string = "";
}

export class XMLListReader {
  dirPath = resolve(__dirname, "..", "files", "meta", "xml-list");
  xmlListFilePath: string;
  xmlListFileHeaders = Object.keys(new XMLFileRow());

  public supplierMeta = new Map<string, SupplierMeta>();

  prepareList() {
    return new Promise((res, rej) => {
      readdir(this.dirPath, (err, filesRaw: string[]) => {
        const winFilter = "~$";
        const files = filesRaw.filter(
          (fileName) => !fileName.includes(winFilter)
        );
        this.xmlListFilePath = files[0] || "";
        if (!this.xmlListFilePath) rej("XML list file was not found");
        else {
          this.updateSupplierMeta();
          res("");
        }
      });
    });
  }

  updateSupplierMeta() {
    const wb = readFile(resolve(this.dirPath, this.xmlListFilePath));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const wsAsJson = utils.sheet_to_json(ws, {
      header: this.xmlListFileHeaders,
    }) as XMLFileRow[];
    // remove header row
    wsAsJson.shift();
    const localRow = new SupplierMetaLocal("", "", []);

    for (let i = 0; i < wsAsJson.length; i++) {
      const row = wsAsJson[i];
      if (row.supplier) {
        if (localRow.key) {
          this.supplierMeta.set(
            localRow.key,
            new SupplierMeta(localRow.url, localRow.brands)
          );
          localRow.clear();
        }
        localRow.key = row.supplier;
      }

      if (row.url) localRow.url = row.url;
      localRow.brands.push(row.brand);
    }

    console.log(this.supplierMeta);
  }
}
